// Simple test to verify dashboard API works
// Run this in the browser console when the dashboard page is open

async function testDashboardAPI() {
    try {
        console.log('Testing dashboard API...');

        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();

        console.log('API Response:', data);

        if (data.success) {
            console.log('✅ API working with real data');
            console.log('Total Sales:', data.data.totalSales);
            console.log('Total Orders:', data.data.totalOrders);
            console.log('Weekly Data:', data.data.weeklyData);
        } else {
            console.log('⚠️ API working with fallback data');
            console.log('Error:', data.error);
            console.log('Fallback Data:', data.data);
        }

        return data;
    } catch (error) {
        console.error('❌ API Error:', error);
        return null;
    }
}

// Call the test function
testDashboardAPI();
