// Test script to verify API endpoints
console.log('Testing API endpoints...');

// Test function for browser console
function testAPI() {
    // Test GET request
    fetch('/api/expenses')
        .then(response => response.json())
        .then(data => {
            console.log('GET /api/expenses:', data);

            // Test POST request
            return fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category: 'Labour',
                    amount: 1000,
                    description: 'Test expense'
                })
            });
        })
        .then(response => response.json())
        .then(data => {
            console.log('POST /api/expenses:', data);
        })
        .catch(error => {
            console.error('API Test Error:', error);
        });
}

// Test ingredients API
function testIngredientsAPI() {
    console.log('Testing ingredients API...');

    // Test GET ingredients
    fetch('/api/ingredients')
        .then(response => response.json())
        .then(data => {
            console.log('GET /api/ingredients:', data);

            // Test forecast API
            return fetch('/api/ingredients/forecast?days=30');
        })
        .then(response => response.json())
        .then(data => {
            console.log('GET /api/ingredients/forecast:', data);
        })
        .catch(error => {
            console.error('Ingredients API Test Error:', error);
        });
}

// Export functions for browser console use
if (typeof window !== 'undefined') {
    window.testAPI = testAPI;
    window.testIngredientsAPI = testIngredientsAPI;
}

// Auto-run tests if this script is executed directly
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.log('Running API tests automatically...');
    // Note: These will only work when run in browser context
}

// Instructions for testing
console.log(`
API Testing Instructions:
1. Start your Next.js development server: npm run dev
2. Open your browser to http://localhost:3000
3. Open Developer Tools (F12) and go to Console tab
4. Test Expenses API: testAPI()
5. Test Ingredients API: testIngredientsAPI()

Manual Testing Examples:
- Test GET expenses: fetch('/api/expenses').then(r => r.json()).then(console.log)
- Test POST expense:
  fetch('/api/expenses', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({category: 'Labour', amount: 1000, description: 'Test'})
  }).then(r => r.json()).then(console.log)
- Test GET ingredients: fetch('/api/ingredients').then(r => r.json()).then(console.log)
- Test forecast API: fetch('/api/ingredients/forecast?days=30').then(r => r.json()).then(console.log)
`);
