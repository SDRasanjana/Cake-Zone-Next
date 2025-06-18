import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { addDays, format } from 'date-fns';
import { linearRegression, linearRegressionLine } from 'simple-statistics';

// 🔮 GET: Generate price forecasts for ingredients
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const ingredientName = searchParams.get('ingredient');
        const forecastDays = parseInt(searchParams.get('days')) || 30;

        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("ingredients");

        let ingredients = [];

        if (ingredientName) {
            // Get specific ingredient
            const ingredient = await collection.findOne({ name: ingredientName });
            if (!ingredient) {
                return NextResponse.json({ success: false, error: 'Ingredient not found' }, { status: 404 });
            }
            ingredients = [ingredient];
        } else {
            // Get all ingredients
            ingredients = await collection.find({}).toArray();
        }

        const forecasts = {};

        for (const ingredient of ingredients) {
            if (!ingredient.priceHistory || ingredient.priceHistory.length < 3) {
                // Need at least 3 data points for forecasting
                forecasts[ingredient.name] = {
                    error: 'Insufficient data for forecasting (minimum 3 price points required)',
                    dataPoints: ingredient.priceHistory ? ingredient.priceHistory.length : 0
                };
                continue;
            }

            try {
                const forecast = generateForecast(ingredient, forecastDays);
                forecasts[ingredient.name] = forecast;
            } catch (err) {
                console.error(`Forecasting error for ${ingredient.name}:`, err);
                forecasts[ingredient.name] = {
                    error: 'Failed to generate forecast',
                    message: err.message
                };
            }
        }

        return NextResponse.json({ success: true, data: forecasts });
    } catch (err) {
        console.error('Forecast API error:', err);
        return NextResponse.json({ success: false, error: 'Failed to generate forecasts' }, { status: 500 });
    }
}

function generateForecast(ingredient, forecastDays) {
    // Validate input
    if (!ingredient || !ingredient.priceHistory || !Array.isArray(ingredient.priceHistory)) {
        throw new Error('Invalid ingredient data');
    }

    if (ingredient.priceHistory.length < 3) {
        throw new Error('Insufficient price history data');
    }

    // Filter out invalid entries and sort by date
    const validPriceHistory = ingredient.priceHistory
        .filter(entry => entry && typeof entry.price === 'number' && entry.price >= 0 && entry.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (validPriceHistory.length < 3) {
        throw new Error('Insufficient valid price data after filtering');
    }

    // Prepare data for regression analysis
    const dataPoints = validPriceHistory.map((entry, index) => [index, entry.price]);

    // Calculate linear regression with error handling
    let regression, regressionLine;
    try {
        regression = linearRegression(dataPoints);
        regressionLine = linearRegressionLine(regression);
    } catch (err) {
        throw new Error('Failed to calculate price trend: ' + err.message);
    }

    // Generate historical trend analysis
    const historicalData = validPriceHistory.map((entry, index) => ({
        date: format(new Date(entry.date), 'yyyy-MM-dd'),
        actualPrice: entry.price,
        trendPrice: Math.round(regressionLine(index) * 100) / 100
    }));    // Generate future predictions
    const lastIndex = validPriceHistory.length - 1;
    const predictions = [];
    const today = new Date();

    for (let i = 1; i <= forecastDays; i++) {
        const futureDate = addDays(today, i);
        const predictedPrice = regressionLine(lastIndex + i);

        // Add some randomness to simulate market volatility (±5%)
        const volatility = 0.05;
        const randomFactor = 1 + (Math.random() - 0.5) * 2 * volatility;
        const adjustedPrice = Math.max(0, predictedPrice * randomFactor);

        predictions.push({
            date: format(futureDate, 'yyyy-MM-dd'),
            predictedPrice: Math.round(adjustedPrice * 100) / 100,
            confidence: Math.max(0.3, 0.9 - (i * 0.02)) // Confidence decreases over time
        });
    }

    // Calculate price statistics
    const prices = validPriceHistory.map(entry => entry.price);
    const currentPrice = prices[prices.length - 1];
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    // Calculate price trend
    const recentPrices = prices.slice(-5); // Last 5 entries
    const oldPrices = prices.slice(0, 5); // First 5 entries
    const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const oldAvg = oldPrices.reduce((a, b) => a + b, 0) / oldPrices.length;
    const trendDirection = recentAvg > oldAvg ? 'increasing' : recentAvg < oldAvg ? 'decreasing' : 'stable';
    const trendPercentage = Math.abs((recentAvg - oldAvg) / oldAvg * 100);

    // Generate insights and recommendations
    const insights = generateInsights(ingredient, predictions, { currentPrice, avgPrice, maxPrice, minPrice, trendDirection, trendPercentage });

    return {
        ingredient: ingredient.name,
        unit: ingredient.unit,
        currentPrice,
        historicalData,
        predictions,        statistics: {
            average: Math.round(avgPrice * 100) / 100,
            minimum: minPrice,
            maximum: maxPrice,
            dataPoints: validPriceHistory.length,
            trend: {
                direction: trendDirection,
                percentage: Math.round(trendPercentage * 100) / 100
            }
        },
        insights,
        lastUpdated: new Date().toISOString()
    };
}

function generateInsights(ingredient, predictions, stats) {
    const insights = [];
    const { currentPrice, avgPrice, trendDirection, trendPercentage } = stats;

    // Price trend insights
    if (trendDirection === 'increasing' && trendPercentage > 10) {
        insights.push({
            type: 'warning',
            title: 'Price Increasing Trend',
            message: `${ingredient.name} prices have increased by ${trendPercentage.toFixed(1)}% recently. Consider buying in bulk before further increases.`,
            priority: 'high'
        });
    } else if (trendDirection === 'decreasing' && trendPercentage > 10) {
        insights.push({
            type: 'opportunity',
            title: 'Price Decreasing Trend',
            message: `${ingredient.name} prices have decreased by ${trendPercentage.toFixed(1)}% recently. Good time for regular purchases.`,
            priority: 'medium'
        });
    }

    // Current price vs average
    const priceVsAvg = ((currentPrice - avgPrice) / avgPrice) * 100;
    if (priceVsAvg > 20) {
        insights.push({
            type: 'alert',
            title: 'Above Average Price',
            message: `Current price is ${priceVsAvg.toFixed(1)}% above historical average. Consider delaying non-urgent purchases.`,
            priority: 'high'
        });
    } else if (priceVsAvg < -20) {
        insights.push({
            type: 'opportunity',
            title: 'Below Average Price',
            message: `Current price is ${Math.abs(priceVsAvg).toFixed(1)}% below historical average. Excellent buying opportunity!`,
            priority: 'high'
        });
    }

    // Seasonal recommendations (placeholder for future enhancement)
    const month = new Date().getMonth();
    if (ingredient.name.toLowerCase().includes('flour') && [9, 10, 11].includes(month)) {
        insights.push({
            type: 'seasonal',
            title: 'Seasonal Trend',
            message: 'Flour prices typically increase during harvest season. Consider stocking up now.',
            priority: 'medium'
        });
    }

    // Future price predictions
    const futureAvg = predictions.slice(0, 7).reduce((sum, p) => sum + p.predictedPrice, 0) / 7;
    const priceChange = ((futureAvg - currentPrice) / currentPrice) * 100;

    if (Math.abs(priceChange) > 5) {
        insights.push({
            type: 'prediction',
            title: 'Week Ahead Forecast',
            message: `Prices expected to ${priceChange > 0 ? 'increase' : 'decrease'} by ${Math.abs(priceChange).toFixed(1)}% in the next week.`,
            priority: priceChange > 0 ? 'medium' : 'low'
        });
    }

    return insights;
}
