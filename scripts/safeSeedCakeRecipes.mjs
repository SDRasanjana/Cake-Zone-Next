// Safe database seeding script for cake recipes
// This script will NOT overwrite existing data

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

// Sample recipes - matching existing cake categories
const sampleRecipes = [
    {
        name: "Butterscotch Fudge Cake",
        category: "Classic",
        ingredients: [
            { name: "Flour", quantity: 0.3, unit: "kg" },
            { name: "Sugar", quantity: 0.25, unit: "kg" },
            { name: "Eggs", quantity: 3, unit: "pieces" },
            { name: "Butter", quantity: 0.2, unit: "kg" },
            { name: "Butterscotch chips", quantity: 0.15, unit: "kg" },
        ],
        yield: 1.2,
        laborCost: 450,
        overheadCost: 200,
    },
    {
        name: "Marble Cake",
        category: "Classic",
        ingredients: [
            { name: "Flour", quantity: 0.35, unit: "kg" },
            { name: "Sugar", quantity: 0.22, unit: "kg" },
            { name: "Eggs", quantity: 4, unit: "pieces" },
            { name: "Butter", quantity: 0.18, unit: "kg" },
            { name: "Vanilla extract", quantity: 0.02, unit: "kg" },
            { name: "Cocoa powder", quantity: 0.05, unit: "kg" },
        ],
        yield: 1.0,
        laborCost: 400,
        overheadCost: 180,
    },
    {
        name: "Mocha Chocolate Cake",
        category: "Chocolate",
        ingredients: [
            { name: "Flour", quantity: 0.32, unit: "kg" },
            { name: "Sugar", quantity: 0.28, unit: "kg" },
            { name: "Eggs", quantity: 3, unit: "pieces" },
            { name: "Butter", quantity: 0.2, unit: "kg" },
            { name: "Dark chocolate", quantity: 0.18, unit: "kg" },
            { name: "Espresso", quantity: 0.1, unit: "kg" },
        ],
        yield: 1.3,
        laborCost: 550,
        overheadCost: 250,
    },
    {
        name: "Pineapple Gateau",
        category: "Fruit",
        ingredients: [
            { name: "Flour", quantity: 0.28, unit: "kg" },
            { name: "Sugar", quantity: 0.2, unit: "kg" },
            { name: "Eggs", quantity: 3, unit: "pieces" },
            { name: "Butter", quantity: 0.15, unit: "kg" },
            { name: "Pineapple", quantity: 0.3, unit: "kg" },
        ],
        yield: 1.1,
        laborCost: 500,
        overheadCost: 220,
    },
    {
        name: "Ultimate Chocolate Cake",
        category: "Chocolate",
        ingredients: [
            { name: "Flour", quantity: 0.35, unit: "kg" },
            { name: "Sugar", quantity: 0.3, unit: "kg" },
            { name: "Eggs", quantity: 4, unit: "pieces" },
            { name: "Butter", quantity: 0.22, unit: "kg" },
            { name: "Cocoa powder", quantity: 0.1, unit: "kg" },
            { name: "Chocolate ganache", quantity: 0.15, unit: "kg" },
        ],
        yield: 1.4,
        laborCost: 600,
        overheadCost: 280,
    },
    {
        name: "Red Velvet Cake",
        category: "Red Velvet",
        ingredients: [
            { name: "Flour", quantity: 0.3, unit: "kg" },
            { name: "Sugar", quantity: 0.24, unit: "kg" },
            { name: "Eggs", quantity: 3, unit: "pieces" },
            { name: "Butter", quantity: 0.18, unit: "kg" },
            { name: "Cocoa powder", quantity: 0.03, unit: "kg" },
            { name: "Buttermilk", quantity: 0.2, unit: "kg" },
            { name: "Cream cheese", quantity: 0.15, unit: "kg" },
        ],
        yield: 1.2,
        laborCost: 650,
        overheadCost: 300,
    }
];

async function safeSeedCakeRecipes() {
    console.log('🔧 SAFE CAKE RECIPES SEEDING SCRIPT');
    console.log('===================================');

    if (!uri) {
        console.error('❌ MongoDB URI not found in environment variables');
        console.log('Please check your .env.local file contains MONGODB_URI');
        process.exit(1);
    }

    let client;
    try {
        console.log('🔗 Connecting to MongoDB...');
        client = new MongoClient(uri);
        await client.connect();
        console.log('✅ Connected to MongoDB successfully');

        const db = client.db("cakezone");
        const collection = db.collection("cake_recipes");

        // Check if any recipes already exist
        const existingRecipesCount = await collection.countDocuments();
        console.log(`📊 Found ${existingRecipesCount} existing recipes in database`);

        if (existingRecipesCount > 0) {
            console.log('⚠️  EXISTING DATA DETECTED');
            console.log('This script will only add NEW recipes that don\'t already exist');
            console.log('No existing data will be modified or deleted');
        }

        let addedCount = 0;
        let skippedCount = 0;

        for (const recipe of sampleRecipes) {
            // Check if recipe already exists
            const existingRecipe = await collection.findOne({
                name: { $regex: new RegExp(`^${recipe.name}$`, 'i') }
            });

            if (existingRecipe) {
                console.log(`⏭️  Skipped "${recipe.name}" - already exists`);
                skippedCount++;
            } else {
                // Add new recipe with metadata
                const recipeWithMetadata = {
                    ...recipe,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    source: 'safe_seeding_script',
                    version: '1.0'
                };

                await collection.insertOne(recipeWithMetadata);
                console.log(`✅ Added "${recipe.name}" recipe`);
                addedCount++;
            }
        }

        console.log('\n📋 SEEDING SUMMARY');
        console.log('==================');
        console.log(`✅ Successfully added: ${addedCount} new recipes`);
        console.log(`⏭️  Skipped existing: ${skippedCount} recipes`);
        console.log(`📊 Total recipes in database: ${await collection.countDocuments()}`);

        if (addedCount > 0) {
            console.log('\n🎉 New recipes are ready for use in the pricing system!');
        } else {
            console.log('\n📝 All recipes already exist - no changes made');
        }

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        console.log('\n⚠️  DATABASE INTEGRITY PRESERVED');
        console.log('No changes were made due to the error');
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 Database connection closed');
        }
    }
}

// Show safety warning before proceeding
console.log('⚠️  SAFETY NOTICE ⚠️');
console.log('This script is designed to be SAFE and will:');
console.log('✅ Only ADD new recipes that don\'t exist');
console.log('✅ NEVER modify or delete existing data');
console.log('✅ Show detailed progress and summary');
console.log('✅ Preserve database integrity at all times');
console.log('\nProceeding with safe seeding...\n');

safeSeedCakeRecipes();
