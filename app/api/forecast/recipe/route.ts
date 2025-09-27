import { NextRequest, NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { ForecastResult } from '@/hooks/usePriceForecast';

interface RecipeIngredient {
  name: string;
  quantity: number;
  unit?: string;
}

interface RecipeData {
  name: string;
  ingredients: RecipeIngredient[];
}

interface ForecastResultWithQuantity {
  ingredient: string;
  forecast?: ForecastResult;
  quantity: number;
  error?: string;
}

interface PythonScriptResult {
  output: string;
  error: string | null;
  code: number;
}

function executePythonScript(command: string, args: string[]): Promise<PythonScriptResult> {
  return new Promise((resolve) => {
    const childProcess: ChildProcess = spawn(command, args, { 
      shell: true,
      cwd: process.cwd()
    });
    
    let output = '';
    let error = '';

    childProcess.stdout?.on('data', (data: Buffer) => {
      output += data.toString();
    });

    childProcess.stderr?.on('data', (data: Buffer) => {
      error += data.toString();
    });

    childProcess.on('close', (code: number | null) => {
      resolve({ 
        output: output.trim(), 
        error: error.trim() || null, 
        code: code || 0 
      });
    });

    childProcess.on('error', (err: Error) => {
      resolve({ 
        output: '', 
        error: `Process error: ${err.message}`, 
        code: 1 
      });
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeData, days = 7, startDate = null }: {
      recipeData: RecipeData;
      days?: number;
      startDate?: string | null;
    } = body;

    // Validate input
    if (!recipeData || !recipeData.ingredients || recipeData.ingredients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Recipe data with ingredients is required' },
        { status: 400 }
      );
    }

    if (days > 30 || days < 1) {
      return NextResponse.json(
        { success: false, error: 'Days parameter must be between 1 and 30' },
        { status: 400 }
      );
    }

    console.log(`🧁 Forecasting recipe cost for "${recipeData.name || 'Custom Recipe'}" with ${recipeData.ingredients.length} ingredients`);

    const forecasts: Record<string, ForecastResult> = {};
    const totalCostForecast: Array<{
      date: string;
      total_cost: number;
      ingredient_costs: Record<string, {
        unit_price: number;
        quantity: number;
        total_cost: number;
      }>;
      days_from_now: number;
    }> = [];

    // Path to Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'forecast_ingredient_price.py');

    // Get forecasts for all ingredients
    const forecastPromises = recipeData.ingredients.map(async (ingredient: RecipeIngredient): Promise<ForecastResultWithQuantity> => {
      const args = [
        scriptPath,
        '--ingredient', ingredient.name,
        '--days', days.toString(),
        '--output-format', 'json'
      ];
      
      if (startDate) {
        args.push('--start-date', startDate);
      }

      console.log(`📊 Forecasting ${ingredient.name}...`);
      
      try {
        const result = await executePythonScript('python', args);
        
        if (result.code === 0 && result.output) {
          const parsedResult = JSON.parse(result.output);
          if (parsedResult.success) {
            return { ingredient: ingredient.name, forecast: parsedResult.data, quantity: ingredient.quantity };
          } else {
            console.warn(`⚠️ Forecast failed for ${ingredient.name}:`, parsedResult.error);
            return { ingredient: ingredient.name, error: parsedResult.error, quantity: ingredient.quantity };
          }
        } else {
          console.warn(`⚠️ Python script failed for ${ingredient.name}:`, result.error);
          
          // Check for common Python/dependency issues
          let errorMessage = result.error || 'Script execution failed';
          if (result.error?.includes('ModuleNotFoundError')) {
            errorMessage = 'Python dependencies missing. Please install: pip install prophet pandas numpy';
          } else if (result.error?.includes('prophet')) {
            errorMessage = 'Prophet library not found. Please install: pip install prophet';
          }
          
          return { ingredient: ingredient.name, error: errorMessage, quantity: ingredient.quantity };
        }
      } catch (error) {
        console.error(`❌ Error forecasting ${ingredient.name}:`, error);
        return { ingredient: ingredient.name, error: error instanceof Error ? error.message : 'Unknown error', quantity: ingredient.quantity };
      }
    });

    const forecastResults = await Promise.all(forecastPromises);

    // Process results
    for (const result of forecastResults) {
      if (result.forecast) {
        forecasts[result.ingredient] = result.forecast;
      } else {
        console.warn(`⚠️ No forecast data for ${result.ingredient}:`, result.error);
      }
    }

    // Calculate total cost for each day if we have at least one forecast
    const ingredientNames = Object.keys(forecasts);
    if (ingredientNames.length > 0) {
      const firstForecast = forecasts[ingredientNames[0]];
      
      if (firstForecast && firstForecast.forecast_data) {
        for (let i = 0; i < firstForecast.forecast_data.length; i++) {
          const dayData = firstForecast.forecast_data[i];
          let totalCost = 0;
          const ingredientCosts: Record<string, {
            unit_price: number;
            quantity: number;
            total_cost: number;
          }> = {};

          // Calculate cost for each ingredient on this day
          for (const ingredientResult of forecastResults) {
            if (ingredientResult.forecast) {
              const forecast = forecasts[ingredientResult.ingredient];
              if (forecast && forecast.forecast_data[i]) {
                const unitPrice = forecast.forecast_data[i].predicted_price;
                const quantity = ingredientResult.quantity;
                const cost = unitPrice * quantity;
                
                totalCost += cost;
                ingredientCosts[ingredientResult.ingredient] = {
                  unit_price: unitPrice,
                  quantity: quantity,
                  total_cost: Math.round(cost * 100) / 100
                };
              }
            }
          }

          totalCostForecast.push({
            date: dayData.date,
            total_cost: Math.round(totalCost * 100) / 100,
            ingredient_costs: ingredientCosts,
            days_from_now: dayData.days_from_now
          });
        }
      }
    }

    // Calculate recipe insights
    const insights = {
      total_ingredients: recipeData.ingredients.length,
      forecasted_ingredients: Object.keys(forecasts).length,
      failed_forecasts: forecastResults.filter(r => r.error).map(r => ({ ingredient: r.ingredient, error: r.error })),
      cost_trend: totalCostForecast.length > 1 ? 
        ((totalCostForecast[totalCostForecast.length - 1].total_cost - totalCostForecast[0].total_cost) / totalCostForecast[0].total_cost * 100) : 0,
      average_daily_cost: totalCostForecast.length > 0 ? 
        totalCostForecast.reduce((sum, day) => sum + day.total_cost, 0) / totalCostForecast.length : 0,
      highest_cost_day: totalCostForecast.length > 0 ? 
        totalCostForecast.reduce((max, day) => day.total_cost > max.total_cost ? day : max) : null,
      lowest_cost_day: totalCostForecast.length > 0 ? 
        totalCostForecast.reduce((min, day) => day.total_cost < min.total_cost ? day : min) : null
    };

    console.log(`✅ Recipe forecast completed. Total cost range: Rs. ${insights.lowest_cost_day?.total_cost?.toFixed(2)} - Rs. ${insights.highest_cost_day?.total_cost?.toFixed(2)}`);

    return NextResponse.json({
      success: true,
      data: {
        recipe_name: recipeData.name || 'Custom Recipe',
        total_cost_forecast: totalCostForecast,
        ingredient_forecasts: forecasts,
        insights: insights,
        generated_at: new Date().toISOString(),
        forecast_period: {
          days: days,
          start_date: startDate || new Date().toISOString().split('T')[0],
          end_date: totalCostForecast.length > 0 ? totalCostForecast[totalCostForecast.length - 1].date : null
        }
      }
    });

  } catch (error) {
    console.error('❌ Recipe forecast API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}