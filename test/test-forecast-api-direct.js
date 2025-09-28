// Test script to add sample ingredient data via API and test forecasting
const baseUrl = 'http://localhost:3000';

async function addSampleIngredients() {
    console.log('🔧 Adding sample ingredient data...\n');

    const sampleIngredients = [
        {
            name: "All-Purpose Flour",
            category: "Flour",
            unit: "kg",
            currentPrice: 45,
            priceHistory: [
                { price: 40, date: "2024-11-01T00:00:00.000Z", source: 'manual' },
                { price: 42, date: "2024-11-05T00:00:00.000Z", source: 'manual' },
                { price: 41, date: "2024-11-10T00:00:00.000Z", source: 'manual' },
                { price: 43, date: "2024-11-15T00:00:00.000Z", source: 'manual' },
                { price: 44, date: "2024-11-20T00:00:00.000Z", source: 'manual' },
                { price: 45, date: "2024-11-25T00:00:00.000Z", source: 'manual' },
            ]
        },
        {
            name: "Granulated Sugar",
            category: "Sugar",
            unit: "kg",
            currentPrice: 55,
            priceHistory: [
                { price: 50, date: "2024-11-01T00:00:00.000Z", source: 'manual' },
                { price: 52, date: "2024-11-05T00:00:00.000Z", source: 'manual' },
                { price: 54, date: "2024-11-10T00:00:00.000Z", source: 'manual' },
                { price: 53, date: "2024-11-15T00:00:00.000Z", source: 'manual' },
                { price: 55, date: "2024-11-20T00:00:00.000Z", source: 'manual' },
                { price: 55, date: "2024-11-25T00:00:00.000Z", source: 'manual' },
            ]
        },
        {
            name: "Unsalted Butter",
            category: "Fats",
            unit: "kg",
            currentPrice: 320,
            priceHistory: [
                { price: 300, date: "2024-11-01T00:00:00.000Z", source: 'manual' },
                { price: 305, date: "2024-11-05T00:00:00.000Z", source: 'manual' },
                { price: 310, date: "2024-11-10T00:00:00.000Z", source: 'manual' },
                { price: 315, date: "2024-11-15T00:00:00.000Z", source: 'manual' },
                { price: 318, date: "2024-11-20T00:00:00.000Z", source: 'manual' },
                { price: 320, date: "2024-11-25T00:00:00.000Z", source: 'manual' },
            ]
        }
    ];

    try {
        for (const ingredient of sampleIngredients) {
            const response = await fetch(`${baseUrl}/api/ingredients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ingredient)
            });

            const result = await response.json();
            if (result.success) {
                console.log(`✅ Added ingredient: ${ingredient.name}`);
            } else {
                console.log(`⚠️  Ingredient ${ingredient.name}: ${result.message || 'Already exists'}`);
            }
        }
    } catch (error) {
        console.error('❌ Error adding ingredients:', error.message);
    }
}

async function testForecastAPI() {
    console.log('\n📊 Testing Forecast API...\n');

    try {
        // Test getting all forecasts
        console.log('Testing all forecasts...');
        const allForecastsResponse = await fetch(`${baseUrl}/api/ingredients/forecast`);
        const allForecasts = await allForecastsResponse.json();

        if (allForecasts.success) {
            console.log('✅ All forecasts API working');
            console.log(`📈 Generated forecasts for ${Object.keys(allForecasts.data).length} ingredients`);

            // Show sample forecast data
            const firstIngredient = Object.keys(allForecasts.data)[0];
            if (firstIngredient) {
                const forecast = allForecasts.data[firstIngredient];
                console.log(`\n📊 Sample forecast for ${firstIngredient}:`);
                console.log(`   Current Price: $${forecast.currentPrice}`);
                console.log(`   Historical Points: ${forecast.historical?.length || 0}`);
                console.log(`   Predictions: ${forecast.predictions?.length || 0}`);
                console.log(`   Trend: ${forecast.statistics?.trend?.direction} (${forecast.statistics?.trend?.percentage}%)`);

                if (forecast.insights && forecast.insights.length > 0) {
                    console.log(`   Key Insight: ${forecast.insights[0].message}`);
                }
            }
        } else {
            console.error('❌ All forecasts API failed:', allForecasts.error);
        }

        // Test specific ingredient forecast
        console.log('\n🎯 Testing specific ingredient forecast...');
        const specificResponse = await fetch(`${baseUrl}/api/ingredients/forecast?ingredient=All-Purpose Flour&days=14`);
        const specificForecast = await specificResponse.json();

        if (specificForecast.success) {
            console.log('✅ Specific ingredient forecast working');
            const forecast = specificForecast.data['All-Purpose Flour'];
            if (forecast && !forecast.error) {
                console.log(`📈 14-day forecast for All-Purpose Flour generated successfully`);
                console.log(`   Predictions: ${forecast.predictions?.length || 0} data points`);
            } else {
                console.log(`⚠️  Forecast error: ${forecast?.error || 'Unknown error'}`);
            }
        } else {
            console.error('❌ Specific forecast API failed:', specificForecast.error);
        }

    } catch (error) {
        console.error('❌ Error testing forecast API:', error.message);
    }
}

async function testIngredientAPI() {
    console.log('\n🧪 Testing Ingredient API...\n');

    try {
        const response = await fetch(`${baseUrl}/api/ingredients`);
        const result = await response.json();

        if (result.success) {
            console.log(`✅ Ingredients API working - Found ${result.data.length} ingredients`);
            result.data.forEach(ingredient => {
                console.log(`   📦 ${ingredient.name} - $${ingredient.currentPrice}/${ingredient.unit} (${ingredient.priceHistory?.length || 0} price points)`);
            });
        } else {
            console.error('❌ Ingredients API failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Error testing ingredients API:', error.message);
    }
}

async function runCompleteTest() {
    console.log('🚀 Starting Complete Forecast Data Test...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 1: Add sample data
    await addSampleIngredients();

    // Step 2: Test ingredient API
    await testIngredientAPI();

    // Step 3: Test forecast API
    await testForecastAPI();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Complete test finished!');
    console.log('\n💡 If all tests passed, you should now see forecast data in your browser!');
    console.log('   Navigate to: http://localhost:3000/dashboards/Owner');
    console.log('   Click on the "Price Forecasting" tab');
}

// Run the complete test
runCompleteTest().catch(console.error);
