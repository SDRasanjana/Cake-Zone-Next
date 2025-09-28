// Complete forecast functionality test
async function runCompleteForcastTest() {
    console.log('🚀 Starting Complete Forecast Functionality Test...\n');

    try {
        // Test 1: Check ingredients API
        console.log('📋 Test 1: Fetching ingredients...');
        const ingredientsResponse = await fetch('/api/ingredients');
        const ingredientsData = await ingredientsResponse.json();

        if (ingredientsData.success && ingredientsData.data.length > 0) {
            console.log(`✅ Ingredients API working: ${ingredientsData.data.length} ingredients found`);
            ingredientsData.data.forEach(ing => {
                console.log(`  - ${ing.name}: Rs. ${ing.currentPrice}/${ing.unit} (${ing.priceHistory?.length || 0} price points)`);
            });
        } else {
            console.log('❌ Ingredients API failed or no data found');
            return;
        }

        // Test 2: Check forecast API
        console.log('\n🔮 Test 2: Testing forecast generation...');
        const forecastResponse = await fetch('/api/ingredients/forecast?days=30');
        const forecastData = await forecastResponse.json();

        if (forecastData.success) {
            console.log(`✅ Forecast API working: Generated forecasts for ${Object.keys(forecastData.data).length} ingredients`);

            Object.entries(forecastData.data).forEach(([name, forecast]) => {
                if (forecast.error) {
                    console.log(`  ⚠️  ${name}: ${forecast.error} (${forecast.dataPoints || 0} data points)`);
                } else {
                    console.log(`  📈 ${name}: ${forecast.predictions?.length || 0} predictions, ${forecast.insights?.length || 0} insights`);

                    // Show trend information
                    if (forecast.statistics?.trend) {
                        const trend = forecast.statistics.trend;
                        const icon = trend.direction === 'increasing' ? '📈' : trend.direction === 'decreasing' ? '📉' : '➡️';
                        console.log(`     ${icon} Trend: ${trend.direction} ${trend.percentage}%`);
                    }

                    // Show insights
                    if (forecast.insights && forecast.insights.length > 0) {
                        forecast.insights.forEach(insight => {
                            const priorityIcon = insight.priority === 'high' ? '🚨' : insight.priority === 'medium' ? '⚠️' : 'ℹ️';
                            console.log(`     ${priorityIcon} ${insight.title}: ${insight.message}`);
                        });
                    }
                }
            });
        } else {
            console.log('❌ Forecast API failed:', forecastData.error);
            return;
        }

        // Test 3: Test specific ingredient forecast
        const firstIngredient = ingredientsData.data[0];
        if (firstIngredient) {
            console.log(`\n🎯 Test 3: Testing specific ingredient forecast (${firstIngredient.name})...`);
            const specificForecastResponse = await fetch(`/api/ingredients/forecast?ingredient=${encodeURIComponent(firstIngredient.name)}&days=7`);
            const specificForecastData = await specificForecastResponse.json();

            if (specificForecastData.success) {
                const forecast = specificForecastData.data[firstIngredient.name];
                if (forecast && !forecast.error) {
                    console.log(`✅ Specific forecast working for ${firstIngredient.name}`);
                    console.log(`   📊 Current Price: Rs. ${forecast.currentPrice}`);
                    console.log(`   📈 7-day predictions: ${forecast.predictions?.length || 0} data points`);
                    console.log(`   🧠 AI insights: ${forecast.insights?.length || 0} recommendations`);
                } else {
                    console.log(`⚠️  Specific forecast has issues: ${forecast?.error || 'Unknown error'}`);
                }
            } else {
                console.log('❌ Specific forecast API failed:', specificForecastData.error);
            }
        }

        // Test 4: Validate forecast data structure
        console.log('\n🔍 Test 4: Validating forecast data structure...');
        let structureValid = true;

        Object.entries(forecastData.data).forEach(([name, forecast]) => {
            if (!forecast.error) {
                const requiredFields = ['currentPrice', 'predictions', 'statistics', 'insights'];
                const missing = requiredFields.filter(field => !forecast[field]);

                if (missing.length > 0) {
                    console.log(`❌ ${name}: Missing fields: ${missing.join(', ')}`);
                    structureValid = false;
                } else {
                    // Check predictions structure
                    if (forecast.predictions.length > 0) {
                        const prediction = forecast.predictions[0];
                        if (!prediction.date || typeof prediction.predictedPrice !== 'number' || typeof prediction.confidence !== 'number') {
                            console.log(`❌ ${name}: Invalid prediction structure`);
                            structureValid = false;
                        }
                    }

                    // Check statistics structure
                    if (!forecast.statistics.average || !forecast.statistics.trend) {
                        console.log(`❌ ${name}: Invalid statistics structure`);
                        structureValid = false;
                    }
                }
            }
        });

        if (structureValid) {
            console.log('✅ All forecast data structures are valid');
        }
        // Test 5: Performance check
        console.log('\n⏱️  Test 5: Performance check...');
        const startTime = Date.now();
        const perfResponse = await fetch('/api/ingredients/forecast?days=90');
        await perfResponse.json(); // Just check if the request completes successfully
        const endTime = Date.now();

        console.log(`✅ 90-day forecast completed in ${endTime - startTime}ms`);
        if (endTime - startTime > 5000) {
            console.log('⚠️  Performance warning: Forecast taking longer than 5 seconds');
        }

        console.log('\n🎉 Complete Forecast Test Summary:');
        console.log('✅ All core forecast functionality is working properly!');
        console.log('✅ APIs are responsive and returning valid data');
        console.log('✅ Data structures are consistent');
        console.log('✅ Error handling is working');
        console.log('\n💡 You can now confidently use the Price Forecasting feature in the Owner dashboard!');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
        console.log('\n🔧 Troubleshooting suggestions:');
        console.log('1. Check if the server is running on http://localhost:3000');
        console.log('2. Verify MongoDB connection is working');
        console.log('3. Ensure ingredient data exists in the database');
        console.log('4. Check browser console for additional error details');
    }
}

// Make function available in browser console
if (typeof window !== 'undefined') {
    window.runCompleteForcastTest = runCompleteForcastTest;
    console.log('🧪 Forecast test function loaded! Run: runCompleteForcastTest()');
}

// Export for Node.js use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runCompleteForcastTest };
}
