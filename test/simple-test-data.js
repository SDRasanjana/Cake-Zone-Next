// Simple script to add forecast test data via API
// Make sure your Next.js server is running first

async function addMinimalTestData() {
    console.log('🚀 Adding minimal test data for forecasting...\n');

    const testIngredient = {
        name: "Test Flour",
        category: "Flour",
        unit: "kg",
        currentPrice: 50,
        priceHistory: [
            { price: 45, date: new Date('2024-11-01').toISOString(), source: 'manual' },
            { price: 47, date: new Date('2024-11-10').toISOString(), source: 'manual' },
            { price: 49, date: new Date('2024-11-20').toISOString(), source: 'manual' },
            { price: 50, date: new Date('2024-11-30').toISOString(), source: 'manual' },
        ]
    };

    try {
        console.log('📦 Adding test ingredient...');
        const response = await fetch('http://localhost:3000/api/ingredients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testIngredient)
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Test ingredient added successfully!');

            // Now test forecast generation
            console.log('📊 Testing forecast generation...');
            const forecastResponse = await fetch('http://localhost:3000/api/ingredients/forecast?ingredient=Test Flour&days=7');
            const forecastResult = await forecastResponse.json();

            if (forecastResult.success) {
                console.log('✅ Forecast generated successfully!');
                console.log('📈 Forecast data:', forecastResult.data);
            } else {
                console.error('❌ Forecast generation failed:', forecastResult.error);
            }
        } else {
            console.log('⚠️ Ingredient may already exist:', result.message);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure:');
        console.log('1. Next.js server is running (npm run dev)');
        console.log('2. MongoDB is running');
        console.log('3. No firewall blocking localhost:3000');
    }
}

// Auto-run if in Node.js environment
if (typeof window === 'undefined') {
    addMinimalTestData();
} else {
    // In browser - make function available globally
    window.addMinimalTestData = addMinimalTestData;
    console.log('Run addMinimalTestData() to add test data');
}
