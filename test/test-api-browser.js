// Simple test for API endpoint
// Run this in browser console to test the API

// Test 1: Check if API is reachable
fetch('/api/expenses')
    .then(response => {
        console.log('GET Status:', response.status);
        return response.json();
    })
    .then(data => console.log('GET Response:', data))
    .catch(error => console.error('GET Error:', error));

// Test 2: Test POST with valid data
fetch('/api/expenses', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        category: 'Labour',
        amount: 1000,
        description: 'Test expense from browser console'
    })
})
    .then(response => {
        console.log('POST Status:', response.status);
        return response.json();
    })
    .then(data => console.log('POST Response:', data))
    .catch(error => console.error('POST Error:', error));
