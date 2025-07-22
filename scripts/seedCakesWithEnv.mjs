// Load environment variables from .env.local
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

const cakes = [
    {
        name: "Butterscotch Fudge Cake",
        price: 95.0,
        image: "/Butterscoch-Fudge-Cake.jpg",
        rating: 4.8,
        description:
            "A rich, moist cake layered with creamy butterscotch fudge and topped with caramel drizzle. Perfect for those who love a sweet and buttery treat.",
        category: "Classic",
        stock: 10,
        ingredients: [
            "Butterscotch chips",
            "Brown sugar",
            "Butter",
            "Eggs",
            "Flour",
            "Caramel sauce",
        ],
        weight: "1.2 kg",
    },
    {
        name: "Marble Cake",
        price: 95.0,
        image: "/Marble-Cake-1.jpg",
        rating: 4.5,
        description:
            "Classic vanilla and chocolate cake batters swirled together for a beautiful marbled effect. Soft, fluffy, and visually stunning.",
        category: "Classic",
        stock: 10,
        ingredients: [
            "Vanilla extract",
            "Cocoa powder",
            "Butter",
            "Sugar",
            "Eggs",
            "Flour",
        ],
        weight: "1.0 kg",
    },
    {
        name: "Mocha Chocolate Cake",
        price: 95.0,
        image: "/Mocha-Chocolate-Cake.jpg",
        rating: 4.9,
        description:
            "A decadent dark chocolate cake infused with espresso, layered with mocha cream, and finished with chocolate shavings.",
        category: "Chocolate",
        stock: 10,
        ingredients: [
            "Dark chocolate",
            "Espresso",
            "Cocoa powder",
            "Butter",
            "Eggs",
            "Sugar",
        ],
        weight: "1.3 kg",
    },
    {
        name: "Pineapple Gateau",
        price: 105.0,
        image: "/Pineapple-Gateaux.jpg",
        rating: 4.7,
        description:
            "A light and airy sponge cake layered with whipped cream and juicy pineapple chunks, finished with a pineapple glaze.",
        category: "Fruit",
        stock: 10,
        ingredients: [
            "Pineapple",
            "Whipped cream",
            "Sponge cake",
            "Sugar",
            "Eggs",
            "Pineapple glaze",
        ],
        weight: "1.1 kg",
    },
    {
        name: "Ultimate Chocolate Cake",
        price: 89.0,
        image: "/Ultimate-Chocolate-Cake.jpg",
        rating: 4.6,
        description:
            "An ultra-rich chocolate cake with layers of chocolate ganache and fudge, perfect for true chocolate lovers.",
        category: "Chocolate",
        stock: 10,
        ingredients: [
            "Cocoa powder",
            "Chocolate ganache",
            "Butter",
            "Eggs",
            "Sugar",
            "Flour",
        ],
        weight: "1.4 kg",
    },
    {
        name: "Red Velvet Cake",
        price: 99.0,
        image: "/Red-velvet-cake-1-1.jpg",
        rating: 4.8,
        description:
            "A classic red velvet cake with a hint of cocoa, layered with smooth cream cheese frosting and finished with red velvet crumbs.",
        category: "Red Velvet",
        stock: 10,
        ingredients: [
            "Cocoa powder",
            "Buttermilk",
            "Cream cheese",
            "Butter",
            "Eggs",
            "Red food coloring",
        ],
        weight: "1.2 kg",
    },
];

async function seedCakes() {
    console.log("MongoDB URI:", uri ? "Found" : "Not found");

    if (!uri) {
        console.error("MongoDB URI is not defined in environment variables");
        console.log("Please check your .env.local file");
        process.exit(1);
    }

    let client;
    try {
        console.log("Connecting to MongoDB...");
        client = new MongoClient(uri);
        await client.connect();

        const db = client.db();
        const collection = db.collection("cakes");

        console.log("Clearing existing cakes...");
        await collection.deleteMany({});

        console.log("Inserting new cakes...");
        const result = await collection.insertMany(cakes);
        console.log(`Successfully inserted ${result.insertedCount} cakes`);

        // Verify the insertion
        const count = await collection.countDocuments();
        console.log(`Total cakes in database: ${count}`);

    } catch (error) {
        console.error("Error seeding cakes:", error);
    } finally {
        if (client) {
            await client.close();
            console.log("MongoDB connection closed");
        }
    }
}

seedCakes();
