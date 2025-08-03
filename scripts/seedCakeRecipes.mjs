import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

const cakeRecipes = [
  {
    name: "Classic Chocolate Cake",
    category: "Chocolate",
    ingredients: [
      { name: "Flour", quantity: 0.3, unit: "kg" },
      { name: "Sugar", quantity: 0.25, unit: "kg" },
      { name: "Eggs", quantity: 3, unit: "pieces" },
      { name: "Butter", quantity: 0.2, unit: "kg" },
      { name: "Chocolate", quantity: 0.15, unit: "kg" },
    ],
    yield: 1.0,
    laborCost: 500,
    overheadCost: 200,
  },
  {
    name: "Vanilla Sponge Cake",
    category: "Classic",
    ingredients: [
      { name: "Flour", quantity: 0.35, unit: "kg" },
      { name: "Sugar", quantity: 0.2, unit: "kg" },
      { name: "Eggs", quantity: 4, unit: "pieces" },
      { name: "Butter", quantity: 0.15, unit: "kg" },
      { name: "Vanilla", quantity: 0.02, unit: "kg" },
    ],
    yield: 1.0,
    laborCost: 400,
    overheadCost: 150,
  },
  {
    name: "Red Velvet Cake",
    category: "Specialty",
    ingredients: [
      { name: "Flour", quantity: 0.3, unit: "kg" },
      { name: "Sugar", quantity: 0.22, unit: "kg" },
      { name: "Eggs", quantity: 3, unit: "pieces" },
      { name: "Butter", quantity: 0.18, unit: "kg" },
    ],
    yield: 1.0,
    laborCost: 600,
    overheadCost: 250,
  },
  {
    name: "Fruit Cake",
    category: "Fruit",
    ingredients: [
      { name: "Flour", quantity: 0.28, unit: "kg" },
      { name: "Sugar", quantity: 0.2, unit: "kg" },
      { name: "Eggs", quantity: 3, unit: "pieces" },
      { name: "Butter", quantity: 0.16, unit: "kg" },
    ],
    yield: 1.0,
    laborCost: 450,
    overheadCost: 180,
  },
  {
    name: "Butterscotch Fudge Cake",
    category: "Classic",
    ingredients: [
      { name: "Flour", quantity: 0.32, unit: "kg" },
      { name: "Sugar", quantity: 0.24, unit: "kg" },
      { name: "Eggs", quantity: 3, unit: "pieces" },
      { name: "Butter", quantity: 0.22, unit: "kg" },
    ],
    yield: 1.2,
    laborCost: 550,
    overheadCost: 220,
  },
  {
    name: "Marble Cake",
    category: "Classic",
    ingredients: [
      { name: "Flour", quantity: 0.33, unit: "kg" },
      { name: "Sugar", quantity: 0.21, unit: "kg" },
      { name: "Eggs", quantity: 3, unit: "pieces" },
      { name: "Butter", quantity: 0.17, unit: "kg" },
      { name: "Chocolate", quantity: 0.08, unit: "kg" },
    ],
    yield: 1.0,
    laborCost: 480,
    overheadCost: 190,
  },
  {
    name: "Mocha Chocolate Cake",
    category: "Chocolate",
    ingredients: [
      { name: "Flour", quantity: 0.29, unit: "kg" },
      { name: "Sugar", quantity: 0.26, unit: "kg" },
      { name: "Eggs", quantity: 3, unit: "pieces" },
      { name: "Butter", quantity: 0.19, unit: "kg" },
      { name: "Chocolate", quantity: 0.16, unit: "kg" },
    ],
    yield: 1.3,
    laborCost: 580,
    overheadCost: 230,
  },
  {
    name: "Pineapple Gateau",
    category: "Fruit",
    ingredients: [
      { name: "Flour", quantity: 0.31, unit: "kg" },
      { name: "Sugar", quantity: 0.19, unit: "kg" },
      { name: "Eggs", quantity: 3, unit: "pieces" },
      { name: "Butter", quantity: 0.15, unit: "kg" },
    ],
    yield: 1.1,
    laborCost: 520,
    overheadCost: 210,
  },
  {
    name: "Ultimate Chocolate Cake",
    category: "Chocolate",
    ingredients: [
      { name: "Flour", quantity: 0.27, unit: "kg" },
      { name: "Sugar", quantity: 0.28, unit: "kg" },
      { name: "Eggs", quantity: 4, unit: "pieces" },
      { name: "Butter", quantity: 0.21, unit: "kg" },
      { name: "Chocolate", quantity: 0.18, unit: "kg" },
    ],
    yield: 1.4,
    laborCost: 650,
    overheadCost: 280,
  },
];

async function seedCakeRecipes() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("cakezone");
    const collection = db.collection("cake_recipes");

    // Clear existing recipes
    await collection.deleteMany({});
    console.log("Cleared existing cake recipes");

    // Insert new recipes
    const result = await collection.insertMany(
      cakeRecipes.map((recipe) => ({
        ...recipe,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    console.log(`✅ Successfully seeded ${result.insertedCount} cake recipes!`);
    
    // Log the inserted recipes
    cakeRecipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name} (${recipe.category})`);
      console.log(`   - Ingredients: ${recipe.ingredients.length} items`);
      console.log(`   - Yield: ${recipe.yield} kg`);
      console.log(`   - Labor Cost: Rs. ${recipe.laborCost}`);
      console.log(`   - Overhead Cost: Rs. ${recipe.overheadCost}`);
    });

    console.log("\n🎂 Cake recipes are ready for the pricing system!");
  } catch (error) {
    console.error("❌ Error seeding cake recipes:", error);
  } finally {
    await client.close();
  }
}

// Run the seeder
seedCakeRecipes().catch(console.error);
