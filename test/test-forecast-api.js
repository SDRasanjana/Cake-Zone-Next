// Test forecast functionality
async function testForecastAPI() {
    console.log('🧪 Testing Forecast API...');

    try {
        // Test 1: Get all ingredients first
        console.log('\n1. Testing ingredients API...');
        const ingredientsResponse = await fetch('http://localhost:3000/api/ingredients');
        const ingredientsResult = await ingredientsResponse.json();

        if (ingredientsResult.success) {
            console.log(`✅ Found ${ingredientsResult.data.length} ingredients`);

            if (ingredientsResult.data.length > 0) {
                const firstIngredient = ingredientsResult.data[0];
                console.log(`   📦 Sample ingredient: ${firstIngredient.name} - Rs. ${firstIngredient.currentPrice}/${firstIngredient.unit}`);

                // Test 2: Get forecast for specific ingredient
                console.log('\n2. Testing forecast for specific ingredient...');
                const forecastResponse = await fetch(`http://localhost:3000/api/ingredients/forecast?ingredient=${encodeURIComponent(firstIngredient.name)}&days=30`);
                const forecastResult = await forecastResponse.json();

                if (forecastResult.success) {
                    console.log('✅ Forecast API working for specific ingredient');
                    console.log(`   📈 Forecast data:`, Object.keys(forecastResult.data));
                } else {
                    console.error('❌ Forecast API failed for specific ingredient:', forecastResult.error);
                }

                // Test 3: Get forecasts for all ingredients
                console.log('\n3. Testing forecast for all ingredients...');
                const allForecastsResponse = await fetch('http://localhost:3000/api/ingredients/forecast?days=30');
                const allForecastsResult = await allForecastsResponse.json();

                if (allForecastsResult.success) {
                    console.log('✅ Forecast API working for all ingredients');
                    console.log(`   📊 Generated forecasts for ${Object.keys(allForecastsResult.data).length} ingredients`);

                    // Show sample forecast data
                    const sampleForecast = Object.values(allForecastsResult.data)[0];
                    if (sampleForecast && !sampleForecast.error) {
                        console.log('   📝 Sample forecast structure:', {
                            predictions: sampleForecast.predictions?.length || 0,
                            insights: sampleForecast.insights?.length || 0,
                            statistics: sampleForecast.statistics ? 'Available' : 'Missing'
                        });
                    }
                } else {
                    console.error('❌ Forecast API failed for all ingredients:', allForecastsResult.error);
                }
            } else {
                console.log('⚠️  No ingredients found. Run add-test-data.js first');
            }
        } else {
            console.error('❌ Ingredients API failed:', ingredientsResult.error);
        }

        console.log('\n🎉 Forecast API test complete!');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Instructions
console.log(`
🧪 Forecast API Test Script
===========================

To run this test:
1. Make sure your development server is running (npm run dev)
2. Open browser console at http://localhost:3000
3. Paste this entire script and run it
4. Or run: testForecastAPI()

This will test:
- Ingredients API (GET /api/ingredients)
- Forecast API for specific ingredient (GET /api/ingredients/forecast?ingredient=X&days=30)
- Forecast API for all ingredients (GET /api/ingredients/forecast?days=30)
`);

// Export for browser use
if (typeof window !== 'undefined') {
    window.testForecastAPI = testForecastAPI;
}
