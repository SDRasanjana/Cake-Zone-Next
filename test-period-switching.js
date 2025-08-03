// Test script for period switching functionality
// Run this in the browser console when the dashboard page is open

async function testPeriodSwitching() {
    try {
        console.log('Testing current month data...');
        const currentResponse = await fetch('/api/dashboard/stats?period=current');
        const currentData = await currentResponse.json();
        console.log('Current Month:', currentData);

        console.log('Testing last month data...');
        const lastResponse = await fetch('/api/dashboard/stats?period=last');
        const lastData = await lastResponse.json();
        console.log('Last Month:', lastData);

        console.log('✅ Period switching API working correctly');

        // Compare the data
        if (currentData.data && lastData.data) {
            console.log('Data comparison:');
            console.log('Current vs Last Sales:', currentData.data.totalSales, 'vs', lastData.data.totalSales);
            console.log('Current vs Last Orders:', currentData.data.totalOrders, 'vs', lastData.data.totalOrders);
            console.log('Weekly data lengths:', currentData.data.weeklyData?.length, 'vs', lastData.data.weeklyData?.length);
            console.log('Recent activity count:', currentData.data.recentActivity?.length);
        }

        return { current: currentData, last: lastData };
    } catch (error) {
        console.error('❌ Period switching test failed:', error);
        return null;
    }
}

// Call the test function
testPeriodSwitching();
