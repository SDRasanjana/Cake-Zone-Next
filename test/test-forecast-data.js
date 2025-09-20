// Test script to add sample ingredient data for forecasting
const { MongoClient } = "@/lib/mongodb";
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function addTestData() {
    try {
        await client.connect();
        const db = client.db("cakezone");
        const collection = db.collection("ingredients");

        // Sample ingredients with price history for testing forecasting
        const sampleIngredients = [
            {
                name: "All-Purpose Flour",
                category: "Flour",
                unit: "kg",
                currentPrice: 45,
                priceHistory: [
                    { price: 40, date: new Date('2024-11-01'), source: 'manual' },
                    { price: 42, date: new Date('2024-11-05'), source: 'manual' },
                    { price: 41, date: new Date('2024-11-10'), source: 'manual' },
                    { price: 43, date: new Date('2024-11-15'), source: 'manual' },
                    { price: 44, date: new Date('2024-11-20'), source: 'manual' },
                    { price: 45, date: new Date('2024-11-25'), source: 'manual' },
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Granulated Sugar",
                category: "Sugar",
                unit: "kg",
                currentPrice: 55,
                priceHistory: [
                    { price: 50, date: new Date('2024-11-01'), source: 'manual' },
                    { price: 52, date: new Date('2024-11-05'), source: 'manual' },
                    { price: 54, date: new Date('2024-11-10'), source: 'manual' },
                    { price: 53, date: new Date('2024-11-15'), source: 'manual' },
                    { price: 55, date: new Date('2024-11-20'), source: 'manual' },
                    { price: 55, date: new Date('2024-11-25'), source: 'manual' },
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Unsalted Butter",
                category: "Fats",
                unit: "kg",
                currentPrice: 320,
                priceHistory: [
                    { price: 300, date: new Date('2024-11-01'), source: 'manual' },
                    { price: 305, date: new Date('2024-11-05'), source: 'manual' },
                    { price: 310, date: new Date('2024-11-10'), source: 'manual' },
                    { price: 315, date: new Date('2024-11-15'), source: 'manual' },
                    { price: 318, date: new Date('2024-11-20'), source: 'manual' },
                    { price: 320, date: new Date('2024-11-25'), source: 'manual' },
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Fresh Eggs",
                category: "Eggs",
                unit: "dozen",
                currentPrice: 12,
                priceHistory: [
                    { price: 10, date: new Date('2024-11-01'), source: 'manual' },
                    { price: 11, date: new Date('2024-11-05'), source: 'manual' },
                    { price: 11.5, date: new Date('2024-11-10'), source: 'manual' },
                    { price: 12, date: new Date('2024-11-15'), source: 'manual' },
                    { price: 12.5, date: new Date('2024-11-20'), source: 'manual' },
                    { price: 12, date: new Date('2024-11-25'), source: 'manual' },
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Vanilla Extract",
                category: "Flavoring",
                unit: "liter",
                currentPrice: 850,
                priceHistory: [
                    { price: 800, date: new Date('2024-11-01'), source: 'manual' },
                    { price: 820, date: new Date('2024-11-05'), source: 'manual' },
                    { price: 830, date: new Date('2024-11-10'), source: 'manual' },
                    { price: 840, date: new Date('2024-11-15'), source: 'manual' },
                    { price: 845, date: new Date('2024-11-20'), source: 'manual' },
                    { price: 850, date: new Date('2024-11-25'), source: 'manual' },
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        // Clear existing ingredients (optional - comment out if you want to keep existing data)
        // await collection.deleteMany({});

        // Insert sample ingredients
        for (const ingredient of sampleIngredients) {
            const existing = await collection.findOne({ name: ingredient.name });
            if (!existing) {
                await collection.insertOne(ingredient);
                console.log(`Added ingredient: ${ingredient.name}`);
            } else {
                console.log(`Ingredient already exists: ${ingredient.name}`);
            }
        }

        console.log("Sample ingredient data added successfully!");
    } catch (error) {
        console.error("Error adding sample data:", error);
    } finally {
        await client.close();
    }
}

addTestData();
