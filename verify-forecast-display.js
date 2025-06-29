// Browser verification script for forecast display
// Copy and paste this into your browser's console to verify functionality

console.log('🔍 Verifying Forecast Display Functionality...\n');

async function verifyForecastDisplay() {
    try {
        // Check if we're on the right page
        if (!window.location.href.includes('dashboards/Owner')) {
            console.log('⚠️  Navigate to http://localhost:3000/dashboards/Owner first');
            return;
        }

        console.log('✅ On Owner Dashboard page');

        // Check for forecast tab
        const forecastTab = document.querySelector('[data-tab="forecast"], [role="tab"]:contains("Forecast"), button:contains("Forecast")');
        if (forecastTab) {
            console.log('✅ Forecast tab found');

            // Click forecast tab if not already active
            if (!forecastTab.classList.contains('active') && !forecastTab.getAttribute('aria-selected')) {
                console.log('🖱️  Clicking forecast tab...');
                forecastTab.click();

                // Wait a moment for content to load
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } else {
            console.log('❌ Forecast tab not found - looking for alternatives...');

            // Look for any element containing "forecast" text
            const forecastElements = Array.from(document.querySelectorAll('*')).filter(el =>
                el.textContent && el.textContent.toLowerCase().includes('forecast')
            );

            if (forecastElements.length > 0) {
                console.log(`📍 Found ${forecastElements.length} elements with 'forecast' text`);
                forecastElements.forEach((el, i) => {
                    if (i < 3) console.log(`   ${i + 1}. ${el.tagName}: "${el.textContent.substring(0, 50)}..."`);
                });
            }
        }

        // Check for ingredient selector
        const ingredientSelector = document.querySelector('select[name*="ingredient"], select:has(option:contains("Flour")), #ingredient-select');
        if (ingredientSelector) {
            console.log('✅ Ingredient selector found');

            // Check available ingredients
            const options = ingredientSelector.querySelectorAll('option');
            console.log(`📦 Available ingredients: ${options.length - 1}`); // -1 for placeholder
            options.forEach((option, i) => {
                if (option.value && i < 5) {
                    console.log(`   - ${option.textContent}`);
                }
            });
        } else {
            console.log('❌ Ingredient selector not found');
        }

        // Check for forecast chart
        const chartContainer = document.querySelector('.recharts-wrapper, [class*="chart"], #forecast-chart');
        if (chartContainer) {
            console.log('✅ Chart container found');

            // Check if chart has data
            const chartLines = chartContainer.querySelectorAll('.recharts-line, path[stroke], line');
            console.log(`📊 Chart elements: ${chartLines.length}`);

        } else {
            console.log('❌ Chart container not found');
        }

        // Check for forecast data
        console.log('\n🔄 Testing API data...');

        const response = await fetch('/api/ingredients/forecast');
        const data = await response.json();

        if (data.success) {
            console.log('✅ Forecast API working');
            console.log(`📈 Forecasts available for: ${Object.keys(data.data).join(', ')}`);

            // Show sample forecast data
            const firstIngredient = Object.keys(data.data)[0];
            if (firstIngredient) {
                const forecast = data.data[firstIngredient];
                console.log(`\n📊 Sample forecast for ${firstIngredient}:`);
                console.log(`   Historical points: ${forecast.historicalData?.length || 0}`);
                console.log(`   Predictions: ${forecast.predictions?.length || 0}`);
                console.log(`   Current price: $${forecast.currentPrice}`);

                if (forecast.insights?.length > 0) {
                    console.log(`   Insight: ${forecast.insights[0].message}`);
                }
            }
        } else {
            console.log('❌ Forecast API failed:', data.error);
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎯 VERIFICATION COMPLETE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        console.log('\n💡 Next Steps:');
        console.log('1. Click on the Price Forecasting tab');
        console.log('2. Select an ingredient from the dropdown');
        console.log('3. Choose forecast period (7, 14, or 30 days)');
        console.log('4. View the generated charts and AI insights');
        console.log('5. Try adding new price data using the form');

    } catch (error) {
        console.error('❌ Verification error:', error);
    }
}

// Run verification
verifyForecastDisplay();

// Make function available globally
window.verifyForecastDisplay = verifyForecastDisplay;

console.log('\n📋 Instructions:');
console.log('1. Copy this entire script');
console.log('2. Open browser Developer Tools (F12)');
console.log('3. Go to Console tab');
console.log('4. Paste and press Enter');
console.log('5. Follow the verification results');
