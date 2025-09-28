// Test script to add sample ingredient data via API
async function addTestIngredients() {
    const baseUrl = 'http://localhost:3000/api/ingredients';

    const sampleIngredients = [
        { name: "All-Purpose Flour", category: "Flour", price: 45, unit: "kg", source: "manual" },
        { name: "Granulated Sugar", category: "Sugar", price: 55, unit: "kg", source: "manual" },
        { name: "Unsalted Butter", category: "Fats", price: 320, unit: "kg", source: "manual" },
        { name: "Fresh Eggs", category: "Eggs", price: 12, unit: "dozen", source: "manual" },
        { name: "Vanilla Extract", category: "Flavoring", price: 850, unit: "liter", source: "manual" }
    ];

    for (const ingredient of sampleIngredients) {
        try {
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ingredient)
            });

            const result = await response.json();

            if (result.success) {
                console.log(`✅ Added: ${ingredient.name} - Rs. ${ingredient.price}/${ingredient.unit}`);

                // Add some additional price history entries
                const priceVariations = [
                    ingredient.price * 0.9,   // 10% lower
                    ingredient.price * 0.95,  // 5% lower  
                    ingredient.price * 1.02,  // 2% higher
                    ingredient.price * 0.98,  // 2% lower
                    ingredient.price * 1.01   // 1% higher
                ];

                for (let i = 0; i < priceVariations.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay

                    const historyResponse = await fetch(baseUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...ingredient,
                            price: Math.round(priceVariations[i] * 100) / 100
                        })
                    });

                    if (historyResponse.ok) {
                        console.log(`  📊 Added price history: Rs. ${Math.round(priceVariations[i] * 100) / 100}`);
                    }
                }
            } else {
                console.log(`ℹ️  ${ingredient.name}: ${result.error || 'Already exists'}`);
            }
        } catch (error) {
            console.error(`❌ Failed to add ${ingredient.name}:`, error.message);
        }
    }

    console.log('\n🎉 Test data setup complete! You can now test the price forecasting feature.');
    console.log('💡 Go to the Price Forecasting tab in the Owner dashboard to see the forecasts.');
}

// Run the script
addTestIngredients().catch(console.error);
