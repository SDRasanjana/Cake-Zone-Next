// Browser debugging script for forecast issues
// Run this in browser console to diagnose forecast display problems

console.log('🔍 Starting Forecast Debugging...\n');

async function debugForecastIssues() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🐛 FORECAST DEBUGGING SCRIPT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Check if APIs are accessible
    console.log('1️⃣ Testing API Endpoints...');

    try {
        // Test ingredients API
        const ingredientsResponse = await fetch('/api/ingredients');
        const ingredientsData = await ingredientsResponse.json();

        if (ingredientsData.success) {
            console.log(`✅ Ingredients API: Found ${ingredientsData.data.length} ingredients`);

            // Show ingredients with price history
            const withHistory = ingredientsData.data.filter(ing => ing.priceHistory && ing.priceHistory.length > 0);
            console.log(`📊 Ingredients with price history: ${withHistory.length}`);

            withHistory.forEach(ing => {
                console.log(`   📦 ${ing.name}: ${ing.priceHistory.length} price points, current: $${ing.currentPrice}`);
            });
        } else {
            console.error('❌ Ingredients API failed:', ingredientsData.error);
        }
    } catch (error) {
        console.error('❌ Ingredients API error:', error);
    }

    // 2. Test forecast API
    console.log('\n2️⃣ Testing Forecast API...');

    try {
        const forecastResponse = await fetch('/api/ingredients/forecast?days=14');
        const forecastData = await forecastResponse.json();

        if (forecastData.success) {
            console.log('✅ Forecast API working');
            const forecasts = forecastData.data;

            console.log(`📈 Generated forecasts for ${Object.keys(forecasts).length} ingredients`);

            // Check each forecast for issues
            Object.entries(forecasts).forEach(([name, forecast]) => {
                if (forecast.error) {
                    console.warn(`⚠️  ${name}: ${forecast.error}`);
                } else {
                    console.log(`✅ ${name}: ${forecast.predictions?.length || 0} predictions, ${forecast.historical?.length || 0} historical points`);

                    // Check for missing data
                    if (!forecast.historical || forecast.historical.length === 0) {
                        console.warn(`   ⚠️  No historical data for ${name}`);
                    }
                    if (!forecast.predictions || forecast.predictions.length === 0) {
                        console.warn(`   ⚠️  No predictions for ${name}`);
                    }
                }
            });
        } else {
            console.error('❌ Forecast API failed:', forecastData.error);
        }
    } catch (error) {
        console.error('❌ Forecast API error:', error);
    }

    // 3. Check DOM elements
    console.log('\n3️⃣ Checking DOM Elements...');

    const forecastContainer = document.querySelector('[data-testid="forecast-container"]') ||
        document.querySelector('.forecast-container') ||
        document.querySelector('#forecast');

    if (forecastContainer) {
        console.log('✅ Forecast container found');

        // Check for charts
        const charts = forecastContainer.querySelectorAll('.recharts-wrapper');
        console.log(`📊 Found ${charts.length} chart(s)`);

        // Check for error messages
        const errors = forecastContainer.querySelectorAll('.error, .alert-error, [class*="error"]');
        if (errors.length > 0) {
            console.warn(`⚠️  Found ${errors.length} error element(s):`);
            errors.forEach(error => console.log(`   ${error.textContent}`));
        }

        // Check for loading states
        const loading = forecastContainer.querySelectorAll('.loading, .spinner, [class*="loading"]');
        if (loading.length > 0) {
            console.log(`⏳ Found ${loading.length} loading element(s)`);
        }

    } else {
        console.error('❌ Forecast container not found - component may not be rendered');
    }

    // 4. Check console errors
    console.log('\n4️⃣ Recent Console Errors:');
    if (window.consoleErrors) {
        window.consoleErrors.forEach(error => console.error('   ', error));
    } else {
        console.log('   No stored console errors (try refreshing and running this again)');
    }

    // 5. Check React state (if possible)
    console.log('\n5️⃣ Checking React Components...');

    // Try to find React components
    const reactElements = document.querySelectorAll('[data-reactroot], [data-react-*]');
    console.log(`⚛️  Found ${reactElements.length} React element(s)`);

    // 6. Network requests check
    console.log('\n6️⃣ Checking Network Requests...');
    console.log('   Check Network tab for:');
    console.log('   - Failed API calls to /api/ingredients');
    console.log('   - Failed API calls to /api/ingredients/forecast');
    console.log('   - CORS errors');
    console.log('   - 404 or 500 errors');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 DEBUGGING COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n💡 Quick Fixes to Try:');
    console.log('1. Refresh the page');
    console.log('2. Clear browser cache');
    console.log('3. Check if MongoDB is running');
    console.log('4. Restart the Next.js development server');
    console.log('5. Add sample data using: node test-forecast-api-direct.js');
}

// Store console errors for debugging
window.consoleErrors = [];
const originalError = console.error;
console.error = function (...args) {
    window.consoleErrors.push(args.join(' '));
    originalError.apply(console, args);
};

// Run the debugging
debugForecastIssues().catch(console.error);

// Export for manual use
window.debugForecast = debugForecastIssues;
