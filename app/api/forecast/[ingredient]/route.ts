import { NextRequest, NextResponse } from "next/server";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import { ForecastResult } from "@/hooks/usePriceForecast";

interface PythonScriptResult {
  output: string;
  error: string | null;
  code: number;
}

interface RecipeIngredient {
  name: string;
  quantity: number;
  unit?: string;
}

interface RecipeRequestData {
  name?: string;
  ingredients: RecipeIngredient[];
}

function executePythonScript(
  command: string,
  args: string[]
): Promise<PythonScriptResult> {
  return new Promise((resolve) => {
    const childProcess: ChildProcess = spawn(command, args, {
      shell: true,
      cwd: process.cwd(),
    });

    let output = "";
    let error = "";

    childProcess.stdout?.on("data", (data: Buffer) => {
      output += data.toString();
    });

    childProcess.stderr?.on("data", (data: Buffer) => {
      error += data.toString();
    });

    childProcess.on("close", (code: number | null) => {
      resolve({
        output: output.trim(),
        error: error.trim() || null,
        code: code || 0,
      });
    });

    childProcess.on("error", (err: Error) => {
      resolve({
        output: "",
        error: `Process error: ${err.message}`,
        code: 1,
      });
    });
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // Extract ingredient from the URL pathname
    // /api/forecast/[ingredient] => ingredient is the last segment
    const segments = request.nextUrl.pathname.split("/");
    const ingredient = segments[segments.length - 1];
    const days = parseInt(searchParams.get("days") || "7");
    const startDate = searchParams.get("startDate") || null;

    // Validate parameters
    if (!ingredient) {
      return NextResponse.json(
        { success: false, error: "Ingredient parameter required" },
        { status: 400 }
      );
    }

    if (days > 30 || days < 1) {
      return NextResponse.json(
        { success: false, error: "Days parameter must be between 1 and 30" },
        { status: 400 }
      );
    }

    // Validate date format if provided
    if (startDate) {
      try {
        const date = new Date(startDate);
        if (isNaN(date.getTime())) {
          throw new Error("Invalid date");
        }
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid date format. Use YYYY-MM-DD" },
          { status: 400 }
        );
      }
    }

    console.log(
      `🔮 Forecasting ${ingredient} prices for ${days} days${
        startDate ? ` from ${startDate}` : ""
      }`
    );

    // Path to Python script
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "forecast_ingredient_price.py"
    );

    // Arguments for Python script
    const args = [
      scriptPath,
      "--ingredient",
      ingredient,
      "--days",
      days.toString(),
      "--output-format",
      "json",
    ];

    if (startDate) {
      args.push("--start-date", startDate);
    }

    console.log(`🐍 Executing Python script: python ${args.join(" ")}`);

    // Execute Python script
    const pythonResult = await executePythonScript("python", args);

    console.log(`📊 Python script completed with code: ${pythonResult.code}`);

    if (pythonResult.code !== 0) {
      console.error("❌ Python script error:", pythonResult.error);

      // Check for common Python/dependency issues
      if (pythonResult.error?.includes("ModuleNotFoundError")) {
        throw new Error(
          "Python dependencies missing. Please run: pip install prophet pandas numpy matplotlib"
        );
      } else if (pythonResult.error?.includes("prophet")) {
        throw new Error(
          "Prophet library not found. Please install with: pip install prophet"
        );
      } else if (pythonResult.error?.includes("No such file or directory")) {
        throw new Error(
          "Python not found. Please ensure Python is installed and in your PATH"
        );
      }

      throw new Error(pythonResult.error || "Python script execution failed");
    }

    if (!pythonResult.output) {
      throw new Error("No output received from Python script");
    }

    try {
      // Parse JSON output from Python script
      const forecastData = JSON.parse(pythonResult.output);

      if (!forecastData.success) {
        throw new Error(forecastData.error || "Forecast generation failed");
      }

      console.log(`✅ Successfully generated forecast for ${ingredient}`);

      return NextResponse.json({
        success: true,
        data: forecastData.data,
        generated_at: new Date().toISOString(),
        processing_time: pythonResult.output.includes("Processing time")
          ? pythonResult.output.match(/Processing time: ([\d.]+)s/)?.[1]
          : null,
      });
    } catch (parseError) {
      console.error("❌ Failed to parse Python script output:", parseError);
      console.error("Raw output:", pythonResult.output);
      throw new Error(
        `Failed to parse forecast data: ${
          parseError instanceof Error ? parseError.message : "Unknown error"
        }`
      );
    }
  } catch (error) {
    console.error("❌ Forecast API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Extract ingredient from the URL pathname
    const segments = request.nextUrl.pathname.split("/");
    const ingredient = segments[segments.length - 1];
    const { days = 7, startDate = null, recipeData = null } = body;

    // If recipe data is provided, calculate total cost forecast
    if (recipeData && recipeData.ingredients) {
      return await handleRecipeCostForecast(recipeData, days, startDate);
    }

    // Otherwise, handle single ingredient forecast
    const searchParams = new URLSearchParams({
      days: days.toString(),
      ...(startDate && { startDate }),
    });

    const url = new URL(
      `/api/forecast/${ingredient}?${searchParams}`,
      request.url
    );
    const getRequest = new NextRequest(url);
    return await GET(getRequest);
  } catch (error) {
    console.error("❌ POST forecast API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

async function handleRecipeCostForecast(
  recipeData: RecipeRequestData,
  days: number,
  startDate: string | null
) {
  const ingredients = recipeData.ingredients;
  const forecasts: Record<string, ForecastResult> = {};
  const totalCostForecast: Array<{
    date: string;
    total_cost: number;
    ingredient_costs: Record<
      string,
      {
        unit_price: number;
        quantity: number;
        total_cost: number;
      }
    >;
    days_from_now: number;
  }> = [];

  try {
    // Get forecasts for all ingredients
    for (const ingredient of ingredients) {
      const scriptPath = path.join(
        process.cwd(),
        "scripts",
        "forecast_ingredient_price.py"
      );
      const args = [
        scriptPath,
        "--ingredient",
        ingredient.name,
        "--days",
        days.toString(),
        "--output-format",
        "json",
      ];

      if (startDate) {
        args.push("--start-date", startDate);
      }

      const result = await executePythonScript("python", args);

      if (result.code === 0 && result.output) {
        const parsedResult = JSON.parse(result.output);
        if (parsedResult.success) {
          forecasts[ingredient.name] = parsedResult.data;
        }
      }
    }

    // Calculate total cost for each day
    const firstForecast = Object.values(forecasts)[0];
    if (firstForecast && firstForecast.forecast_data) {
      for (let i = 0; i < firstForecast.forecast_data.length; i++) {
        const dayData = firstForecast.forecast_data[i];
        let totalCost = 0;
        const ingredientCosts: Record<
          string,
          {
            unit_price: number;
            quantity: number;
            total_cost: number;
          }
        > = {};

        // Calculate cost for each ingredient on this day
        for (const ingredient of ingredients) {
          const forecast = forecasts[ingredient.name];
          if (forecast && forecast.forecast_data[i]) {
            const unitPrice = forecast.forecast_data[i].predicted_price;
            const quantity = ingredient.quantity;
            const cost = unitPrice * quantity;

            totalCost += cost;
            ingredientCosts[ingredient.name] = {
              unit_price: unitPrice,
              quantity: quantity,
              total_cost: Math.round(cost * 100) / 100,
            };
          }
        }

        totalCostForecast.push({
          date: dayData.date,
          total_cost: Math.round(totalCost * 100) / 100,
          ingredient_costs: ingredientCosts,
          days_from_now: dayData.days_from_now,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        recipe_name: recipeData.name || "Custom Recipe",
        total_cost_forecast: totalCostForecast,
        ingredient_forecasts: forecasts,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Recipe cost forecast error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Recipe cost forecast failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
