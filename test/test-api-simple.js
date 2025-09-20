// Simple test to check if the API works
const testAPI = async () => {
    try {
        console.log('Testing API connection...');

        // Test the simple endpoint first
        const response = await fetch('/api/test-simple', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Simple API Response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('Simple API working! Got', data.length, 'items');
        }

        // Now test the main cakes endpoint
        const cakesResponse = await fetch('/api/cakes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Cakes API Response status:', cakesResponse.status);
        console.log('Cakes API Response headers:', [...cakesResponse.headers.entries()]);

        if (cakesResponse.ok) {
            const data = await cakesResponse.json();
            console.log('Cakes API working! Got', data.length, 'cakes');
            console.log('First cake:', data[0]);
            return true;
        } else {
            console.error('Cakes API error:', cakesResponse.status, cakesResponse.statusText);
            const errorText = await cakesResponse.text();
            console.error('Error response:', errorText);
            return false;
        }
    } catch (error) {
        console.error('Test failed:', error);
        return false;
    }
};

// Test the health endpoint too
const testHealth = async () => {
    try {
        console.log('Testing health endpoint...');
        const response = await fetch('/api/health');
        console.log('Health status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('Health check:', data);
        }
    } catch (error) {
        console.error('Health test failed:', error);
    }
};

// Run both tests
const runTests = async () => {
    console.log('=== Running API Tests ===');
    await testHealth();
    console.log('---');
    await testAPI();
};

// Export for manual testing
if (typeof window !== 'undefined') {
    window.testAPI = testAPI;
    window.testHealth = testHealth;
    window.runTests = runTests;
}

// Run tests if in Node.js environment
if (typeof window === 'undefined') {
    runTests();
}
