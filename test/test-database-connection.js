// Test MongoDB connection directly
console.log('🔧 Testing MongoDB Connection...\n');

async function testDatabaseConnection() {
    try {
        // Test the connection by making a simple API call
        const response = await fetch('http://localhost:3000/api/test');
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Database connection successful!');
            console.log(`📊 Found ${Array.isArray(data) ? data.length : 'unknown'} records in test collection`);
        } else {
            console.log('❌ Database connection failed - Response not OK');
            console.log('Response status:', response.status);
            const text = await response.text();
            console.log('Response body:', text);
        }
    } catch (error) {
        console.log('❌ Database connection error:', error.message);
        console.log('\n💡 Troubleshooting steps:');
        console.log('1. Make sure MongoDB Atlas cluster is running');
        console.log('2. Check your network connection');
        console.log('3. Verify the MongoDB URI in .env.local');
        console.log('4. Restart the Next.js server: npm run dev');
    }
}

async function testIngredientsAPI() {
    console.log('\n🧪 Testing Ingredients API...');
    
    try {
        const response = await fetch('http://localhost:3000/api/ingredients');
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Ingredients API working!');
            console.log(`📦 Found ${result.data?.length || 0} ingredients`);
            
            if (result.data && result.data.length > 0) {
                result.data.forEach(ingredient => {
                    console.log(`   - ${ingredient.name}: $${ingredient.currentPrice} (${ingredient.priceHistory?.length || 0} price points)`);
                });
            } else {
                console.log('   No ingredients found - this is normal for a fresh database');
            }
        } else {
            console.log('❌ Ingredients API failed');
            const text = await response.text();
            console.log('Error response:', text);
        }
    } catch (error) {
        console.log('❌ Ingredients API error:', error.message);
    }
}

async function runConnectionTest() {
    console.log('🚀 Database Connection Test');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await testDatabaseConnection();
    await testIngredientsAPI();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 Next steps:');
    console.log('1. If tests pass, run: node test-forecast-api-direct.js');
    console.log('2. If tests fail, restart Next.js server: npm run dev');
    console.log('3. Check MongoDB Atlas dashboard for cluster status');
}

runConnectionTest().catch(console.error);
