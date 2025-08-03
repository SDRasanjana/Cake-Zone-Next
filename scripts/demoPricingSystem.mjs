// Demo: Automated Cake Pricing System in Action
// This shows how the system automatically calculates prices when ingredient costs change

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

// Pricing calculation function (matches the component logic)
function calculateIngredientCost(recipe, ingredients) {
  let totalCost = 0;
  
  recipe.ingredients.forEach((recipeIngredient) => {
    const ingredient = ingredients.find(
      (ing) => ing.name.toLowerCase().includes(recipeIngredient.name.toLowerCase()) ||
               recipeIngredient.name.toLowerCase().includes(ing.name.toLowerCase())
    );
    
    if (ingredient) {
      let cost = 0;
      
      // Handle different units
      if (ingredient.unit === "1 kg" && recipeIngredient.unit === "kg") {
        cost = ingredient.currentPrice * recipeIngredient.quantity;
      } else if (ingredient.unit === "Dozen" && recipeIngredient.unit === "pieces") {
        cost = (ingredient.currentPrice / 12) * recipeIngredient.quantity;
      } else if (ingredient.unit === "250 g" && recipeIngredient.unit === "kg") {
        cost = (ingredient.currentPrice / 0.25) * recipeIngredient.quantity;
      } else if (ingredient.unit === "400 g" && recipeIngredient.unit === "kg") {
        cost = (ingredient.currentPrice / 0.4) * recipeIngredient.quantity;
      } else if (ingredient.unit === "100 g" && recipeIngredient.unit === "kg") {
        cost = (ingredient.currentPrice / 0.1) * recipeIngredient.quantity;
      } else {
        cost = ingredient.currentPrice * recipeIngredient.quantity;
      }
      
      totalCost += cost;
    }
  });
  
  return totalCost;
}

async function demonstratePricingSystem() {
  console.log('🚀 AUTOMATED CAKE PRICING SYSTEM DEMO');
  console.log('====================================');
  console.log('This demo shows how prices automatically update when ingredient costs change\n');

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db("cakezone");

    // Get current data
    const [recipes, ingredients, cakes] = await Promise.all([
      db.collection("cake_recipes").find({}).toArray(),
      db.collection("ingredients").find({}).toArray(),
      db.collection("cakes").find({}).toArray()
    ]);

    console.log('📊 CURRENT SYSTEM STATUS');
    console.log('========================');
    console.log(`Recipes loaded: ${recipes.length}`);
    console.log(`Ingredients tracked: ${ingredients.length}`);
    console.log(`Cakes in menu: ${cakes.length}\n`);

    // Scenario 1: Current pricing
    console.log('📈 SCENARIO 1: Current Automated Pricing');
    console.log('========================================');
    
    const profitMargin = 20; // 20% profit margin
    
    recipes.forEach(recipe => {
      const ingredientCost = calculateIngredientCost(recipe, ingredients);
      const totalCost = ingredientCost + recipe.laborCost + recipe.overheadCost;
      const finalPrice = totalCost * (1 + profitMargin / 100);
      
      // Find current menu price
      const currentCake = cakes.find(cake => 
        cake.name.toLowerCase() === recipe.name.toLowerCase()
      );
      
      console.log(`🍰 ${recipe.name}`);
      console.log(`   Current menu price: Rs. ${currentCake ? currentCake.price : 'N/A'}`);
      console.log(`   Calculated price: Rs. ${finalPrice.toFixed(2)}`);
      console.log(`   Cost breakdown:`);
      console.log(`     - Ingredients: Rs. ${ingredientCost.toFixed(2)}`);
      console.log(`     - Labor: Rs. ${recipe.laborCost}`);
      console.log(`     - Overhead: Rs. ${recipe.overheadCost}`);
      console.log(`     - Profit (${profitMargin}%): Rs. ${(finalPrice - totalCost).toFixed(2)}`);
      
      if (currentCake) {
        const difference = finalPrice - currentCake.price;
        if (Math.abs(difference) > 10) {
          console.log(`   ⚠️ Price difference: Rs. ${difference.toFixed(2)} - Consider updating!`);
        } else {
          console.log(`   ✅ Price is up to date`);
        }
      }
      console.log('');
    });

    // Scenario 2: What happens when flour price increases
    console.log('📈 SCENARIO 2: Ingredient Price Change Impact');
    console.log('===========================================');
    console.log('Simulating: Flour price increases from Rs. 230/kg to Rs. 280/kg (+21.7%)\n');

    // Simulate flour price increase
    const updatedIngredients = ingredients.map(ing => {
      if (ing.name.toLowerCase().includes('flour')) {
        return { ...ing, currentPrice: 280 };
      }
      return ing;
    });

    recipes.forEach(recipe => {
      const oldIngredientCost = calculateIngredientCost(recipe, ingredients);
      const newIngredientCost = calculateIngredientCost(recipe, updatedIngredients);
      
      const oldTotalCost = oldIngredientCost + recipe.laborCost + recipe.overheadCost;
      const newTotalCost = newIngredientCost + recipe.laborCost + recipe.overheadCost;
      
      const oldFinalPrice = oldTotalCost * (1 + profitMargin / 100);
      const newFinalPrice = newTotalCost * (1 + profitMargin / 100);
      
      const priceIncrease = newFinalPrice - oldFinalPrice;
      const percentageIncrease = (priceIncrease / oldFinalPrice) * 100;
      
      console.log(`🍰 ${recipe.name}`);
      console.log(`   Old price: Rs. ${oldFinalPrice.toFixed(2)}`);
      console.log(`   New price: Rs. ${newFinalPrice.toFixed(2)}`);
      console.log(`   Increase: Rs. ${priceIncrease.toFixed(2)} (+${percentageIncrease.toFixed(1)}%)`);
      console.log('');
    });

    console.log('💡 KEY BENEFITS OF AUTOMATED PRICING');
    console.log('===================================');
    console.log('✅ Real-time cost tracking');
    console.log('✅ Consistent profit margins');
    console.log('✅ Quick response to market changes');
    console.log('✅ Accurate pricing across all products');
    console.log('✅ Easy profit margin adjustments');
    console.log('✅ Cost transparency and control');
    console.log('✅ Database safety with audit trails');

    console.log('\n🎯 NEXT STEPS FOR OWNER');
    console.log('=======================');
    console.log('1. 🖥️  Access Owner Dashboard → Cake Pricing');
    console.log('2. 📊 Review current pricing calculations');
    console.log('3. ⚙️  Adjust profit margins per cake category');
    console.log('4. 💾 Save prices to update customer menu');
    console.log('5. 📈 Monitor ingredient price changes regularly');
    console.log('6. 🔄 Recalculate when suppliers update prices');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

demonstratePricingSystem();
