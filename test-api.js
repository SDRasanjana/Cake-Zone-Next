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

// Instructions for testing
console.log(`
API Testing Instructions:
1. Start your Next.js development server: npm run dev
2. Open your browser to http://localhost:3000
3. Open Developer Tools (F12) and go to Console tab
4. Test GET request: fetch('/api/expenses').then(r => r.json()).then(console.log)
5. Test POST request:
   fetch('/api/expenses', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({category: 'Labour', amount: 1000, description: 'Test'})
   }).then(r => r.json()).then(console.log)
`);
