// Test script to verify the cakes API
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

async function testCakesAPI() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error("MongoDB URI is not defined");
        return;
    }

    let client;
    try {
        console.log("Testing database connection...");
        client = new MongoClient(uri);
        await client.connect();

        const db = client.db();
        const collection = db.collection("cakes");

        const cakes = await collection.find({}).toArray();

        console.log(`\nFound ${cakes.length} cakes in database:`);
        cakes.forEach((cake, index) => {
            console.log(`${index + 1}. ${cake.name} - ${cake.image} - $${cake.price}`);
        });

        console.log("\nImage paths verification:");
        cakes.forEach(cake => {
            console.log(`- ${cake.name}: ${cake.image}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

testCakesAPI();
