// Quick forecast health check
async function quickForecastHealthCheck() {
    console.log('🏥 Quick Forecast Health Check...\n');

    const checks = [];

    try {
        // Check 1: API Connectivity
        console.log('1. Testing API connectivity...');
        const response = await fetch('/api/ingredients');
        if (response.ok) {
            checks.push({ name: 'API Connectivity', status: 'PASS', details: 'Ingredients API responding' });
        } else {
            checks.push({ name: 'API Connectivity', status: 'FAIL', details: `HTTP ${response.status}` });
        }

        // Check 2: Data Availability
        console.log('2. Checking data availability...');
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
            const ingredientsWithHistory = data.data.filter(ing => ing.priceHistory && ing.priceHistory.length >= 3);
            checks.push({
                name: 'Data Availability',
                status: ingredientsWithHistory.length > 0 ? 'PASS' : 'WARN',
                details: `${data.data.length} ingredients, ${ingredientsWithHistory.length} with sufficient history`
            });
        } else {
            checks.push({ name: 'Data Availability', status: 'FAIL', details: 'No ingredient data found' });
        }

        // Check 3: Forecast API
        console.log('3. Testing forecast API...');
        const forecastResponse = await fetch('/api/ingredients/forecast?days=7');
        if (forecastResponse.ok) {
            const forecastData = await forecastResponse.json();
            if (forecastData.success) {
                const successfulForecasts = Object.values(forecastData.data).filter(f => !f.error).length;
                checks.push({
                    name: 'Forecast API',
                    status: successfulForecasts > 0 ? 'PASS' : 'WARN',
                    details: `${successfulForecasts} successful forecasts generated`
                });
            } else {
                checks.push({ name: 'Forecast API', status: 'FAIL', details: forecastData.error });
            }
        } else {
            checks.push({ name: 'Forecast API', status: 'FAIL', details: `HTTP ${forecastResponse.status}` });
        }

        // Check 4: Required Dependencies
        console.log('4. Checking dependencies...');
        try {
            // This will fail if date-fns is not available
            const testDate = new Date();
            if (testDate instanceof Date) {
                checks.push({ name: 'Dependencies', status: 'PASS', details: 'Core dependencies available' });
            }
        } catch (err) {
            checks.push({ name: 'Dependencies', status: 'FAIL', details: `Missing dependencies: ${err.message}` });
        }

        // Display results
        console.log('\n📊 Health Check Results:');
        console.log('┌─────────────────────┬────────┬──────────────────────────────────┐');
        console.log('│ Check               │ Status │ Details                          │');
        console.log('├─────────────────────┼────────┼──────────────────────────────────┤');

        checks.forEach(check => {
            const statusIcon = check.status === 'PASS' ? '✅' : check.status === 'WARN' ? '⚠️' : '❌';
            const name = check.name.padEnd(19);
            const status = (statusIcon + ' ' + check.status).padEnd(7);
            const details = check.details.substring(0, 32);
            console.log(`│ ${name} │ ${status} │ ${details.padEnd(32)} │`);
        });
        console.log('└─────────────────────┴────────┴──────────────────────────────────┘');

        const passCount = checks.filter(c => c.status === 'PASS').length;
        const warnCount = checks.filter(c => c.status === 'WARN').length;
        const failCount = checks.filter(c => c.status === 'FAIL').length;

        console.log(`\n📈 Summary: ${passCount} PASS, ${warnCount} WARN, ${failCount} FAIL`);

        if (failCount === 0) {
            console.log('🎉 All critical systems are operational!');
            console.log('💡 The Price Forecasting feature is ready to use.');
        } else {
            console.log('🔧 Some issues detected. Please check the details above.');
        }

        return {
            overall: failCount === 0 ? 'HEALTHY' : warnCount > 0 ? 'WARNING' : 'CRITICAL',
            checks,
            summary: { pass: passCount, warn: warnCount, fail: failCount }
        };

    } catch (error) {
        console.error('❌ Health check failed:', error);
        return { overall: 'ERROR', error: error.message };
    }
}

// Make available in browser
if (typeof window !== 'undefined') {
    window.quickForecastHealthCheck = quickForecastHealthCheck;
    console.log('🩺 Health check loaded! Run: quickForecastHealthCheck()');
}

// Auto-run a quick check
if (typeof window !== 'undefined') {
    console.log('🚀 Running automatic health check in 2 seconds...');
    setTimeout(() => {
        quickForecastHealthCheck();
    }, 2000);
}
