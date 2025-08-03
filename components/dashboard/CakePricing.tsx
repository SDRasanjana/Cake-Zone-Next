"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calculator,
  Percent,
  RefreshCw,
  Save,
  AlertTriangle,
  Edit,
  Check,
  X,
  Plus,
} from "lucide-react";

// Interfaces
interface Ingredient {
  _id: string;
  name: string;
  unit: string;
  currentPrice: number;
  priceHistory: Array<{
    date: string;
    price: number;
  }>;
}

interface CakeFromDB {
  _id: string;
  name: string;
  price: number;
  category?: string;
}

interface CakeRecipe {
  _id?: string;
  name: string;
  category: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  yield: number; // kg of final cake
  laborCost: number; // fixed labor cost
  overheadCost: number; // fixed overhead cost
}

interface CakePricing {
  _id?: string;
  cakeId: string;
  cakeName: string;
  category: string;
  costBreakdown: {
    ingredients: number;
    labor: number;
    overhead: number;
    total: number;
  };
  profitMargin: number; // percentage
  finalPrice: number;
  lastUpdated: string;
}

const CakePricing: React.FC = () => {
  // State management
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [cakeRecipes, setCakeRecipes] = useState<CakeRecipe[]>([]);
  const [cakePricings, setCakePricings] = useState<CakePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [defaultProfitMargin, setDefaultProfitMargin] = useState(20);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Load default profit margin from localStorage on component mount
  useEffect(() => {
    const savedMargin = localStorage.getItem("defaultProfitMargin");
    if (savedMargin) {
      const margin = Number(savedMargin);
      if (margin >= 0 && margin <= 100) {
        setDefaultProfitMargin(margin);
      }
    }
  }, []);

  // Save default profit margin to localStorage whenever it changes
  const updateDefaultProfitMargin = (newMargin: number) => {
    setDefaultProfitMargin(newMargin);
    localStorage.setItem("defaultProfitMargin", newMargin.toString());

    // Show saved indicator briefly
    setMarginSaved(true);
    setTimeout(() => setMarginSaved(false), 2000);
  };

  // UI State
  const [activeTab, setActiveTab] = useState<"recipes" | "pricing">("pricing");
  const [editingMargin, setEditingMargin] = useState<string | null>(null);
  const [marginSaved, setMarginSaved] = useState(false);

  // Recipe form state
  const [newRecipe, setNewRecipe] = useState<CakeRecipe>({
    name: "",
    category: "",
    ingredients: [],
    yield: 1,
    laborCost: 0,
    overheadCost: 0,
  });
  const [showRecipeForm, setShowRecipeForm] = useState(false);

  // Fetch data functions
  const fetchIngredients = useCallback(async () => {
    try {
      const response = await fetch("/api/ingredients");
      const data = await response.json();
      if (data.success) {
        setIngredients(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch ingredients");
      }
    } catch (err) {
      console.error("Error fetching ingredients:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch ingredients"
      );
    }
  }, []);

  const fetchCakeRecipes = useCallback(async () => {
    try {
      const response = await fetch("/api/cake-recipes");
      const data = await response.json();
      if (data.success) {
        setCakeRecipes(data.data);
      } else {
        // If endpoint doesn't exist, use sample data
        setCakeRecipes(getSampleRecipes());
      }
    } catch (err) {
      console.error("Error fetching cake recipes:", err);
      // Use sample recipes as fallback
      setCakeRecipes(getSampleRecipes());
    }
  }, []);

  // Sample recipes based on existing cake categories
  const getSampleRecipes = (): CakeRecipe[] => [
    {
      _id: "1",
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
      _id: "2",
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
      _id: "3",
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
      _id: "4",
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
  ];

  // Calculate ingredient cost for a recipe
  const calculateIngredientCost = useCallback(
    (recipe: CakeRecipe): number => {
      let totalCost = 0;

      recipe.ingredients.forEach((recipeIngredient) => {
        const ingredient = ingredients.find(
          (ing) =>
            ing.name.toLowerCase() === recipeIngredient.name.toLowerCase()
        );

        if (ingredient) {
          let cost = 0;

          // Handle different units
          if (ingredient.unit === "1 kg" && recipeIngredient.unit === "kg") {
            cost = ingredient.currentPrice * recipeIngredient.quantity;
          } else if (
            ingredient.unit === "Dozen" &&
            recipeIngredient.unit === "pieces"
          ) {
            cost = (ingredient.currentPrice / 12) * recipeIngredient.quantity;
          } else if (
            ingredient.unit === "250 g" &&
            recipeIngredient.unit === "kg"
          ) {
            cost = (ingredient.currentPrice / 0.25) * recipeIngredient.quantity;
          } else if (
            ingredient.unit === "400 g" &&
            recipeIngredient.unit === "kg"
          ) {
            cost = (ingredient.currentPrice / 0.4) * recipeIngredient.quantity;
          } else if (
            ingredient.unit === "100 g" &&
            recipeIngredient.unit === "kg"
          ) {
            cost = (ingredient.currentPrice / 0.1) * recipeIngredient.quantity;
          } else if (
            ingredient.unit === "10 ml" &&
            recipeIngredient.unit === "kg"
          ) {
            // Assuming 1 kg = 1000 ml for liquid ingredients
            cost = (ingredient.currentPrice / 0.01) * recipeIngredient.quantity;
          } else {
            // Direct unit match or fallback
            cost = ingredient.currentPrice * recipeIngredient.quantity;
          }

          totalCost += cost;
        }
      });

      return totalCost;
    },
    [ingredients]
  );

  // Calculate pricing for all recipes
  const calculateAllPricings = useCallback(() => {
    const newPricings: CakePricing[] = cakeRecipes.map((recipe) => {
      const ingredientCost = calculateIngredientCost(recipe);
      const totalCost = ingredientCost + recipe.laborCost + recipe.overheadCost;
      const finalPrice = totalCost * (1 + defaultProfitMargin / 100);

      return {
        cakeId: recipe._id || "",
        cakeName: recipe.name,
        category: recipe.category,
        costBreakdown: {
          ingredients: Math.round(ingredientCost * 100) / 100,
          labor: recipe.laborCost,
          overhead: recipe.overheadCost,
          total: Math.round(totalCost * 100) / 100,
        },
        profitMargin: defaultProfitMargin,
        finalPrice: Math.ceil(finalPrice), // Round up to nearest integer
        lastUpdated: new Date().toISOString(),
      };
    });

    setCakePricings(newPricings);
    setLastUpdated(new Date().toLocaleString());
  }, [cakeRecipes, calculateIngredientCost, defaultProfitMargin]);

  // Update specific cake pricing with new margin
  const updateCakePricing = (cakeId: string, newMargin: number) => {
    setCakePricings((prev) =>
      prev.map((pricing) => {
        if (pricing.cakeId === cakeId) {
          const finalPrice =
            pricing.costBreakdown.total * (1 + newMargin / 100);
          return {
            ...pricing,
            profitMargin: newMargin,
            finalPrice: Math.ceil(finalPrice), // Round up to nearest integer
            lastUpdated: new Date().toISOString(),
          };
        }
        return pricing;
      })
    );
  };

  // Save pricing to database (update cake prices) - SAFE MODE
  const savePricingToDatabase = async () => {
    try {
      setLoading(true);

      // Show confirmation dialog before updating database
      const confirmUpdate = window.confirm(
        `⚠️ DATABASE UPDATE CONFIRMATION ⚠️\n\n` +
          `This will update prices for ${cakePricings.length} cakes in the database.\n\n` +
          `Updated prices will be immediately visible to customers on the menu.\n\n` +
          `Current pricing summary:\n` +
          cakePricings
            .map((p) => `• ${p.cakeName}: Rs. ${p.finalPrice}`)
            .join("\n") +
          `\n\nDo you want to proceed with the update?`
      );

      if (!confirmUpdate) {
        setLoading(false);
        return;
      }

      // Validate prices before updating
      const invalidPrices = cakePricings.filter(
        (p) => !p.finalPrice || p.finalPrice <= 0 || isNaN(p.finalPrice)
      );

      if (invalidPrices.length > 0) {
        alert(
          `⚠️ Invalid pricing detected for: ${invalidPrices
            .map((p) => p.cakeName)
            .join(", ")}\n\nPlease recalculate prices before saving.`
        );
        setLoading(false);
        return;
      }

      const updateResults = [];
      let successCount = 0;
      let failCount = 0;

      // Update each cake's price in the database with safety checks
      for (const pricing of cakePricings) {
        try {
          // First, verify the cake exists in database
          const checkResponse = await fetch(`/api/cakes`);
          const existingCakes: CakeFromDB[] = await checkResponse.json();
          const cakeExists = existingCakes.some(
            (cake: CakeFromDB) =>
              cake.name.toLowerCase() === pricing.cakeName.toLowerCase()
          );

          if (!cakeExists) {
            console.warn(`Cake not found in database: ${pricing.cakeName}`);
            updateResults.push({ cake: pricing.cakeName, status: "not_found" });
            failCount++;
            continue;
          }

          // Update the cake price with validation
          const response = await fetch(`/api/cakes`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "updatePrice",
              cakeName: pricing.cakeName,
              newPrice: pricing.finalPrice,
              category: pricing.category,
              // Add backup data for safety
              costBreakdown: pricing.costBreakdown,
              profitMargin: pricing.profitMargin,
              lastUpdated: pricing.lastUpdated,
            }),
          });

          if (response.ok) {
            updateResults.push({ cake: pricing.cakeName, status: "success" });
            successCount++;
          } else {
            const errorData = await response.json();
            console.error(`Failed to update ${pricing.cakeName}:`, errorData);
            updateResults.push({
              cake: pricing.cakeName,
              status: "error",
              error: errorData,
            });
            failCount++;
          }
        } catch (err) {
          console.error(`Error updating ${pricing.cakeName}:`, err);
          updateResults.push({
            cake: pricing.cakeName,
            status: "error",
            error: err instanceof Error ? err.message : "Unknown error",
          });
          failCount++;
        }
      }

      // Display results summary
      const resultMessage =
        `✅ PRICING UPDATE COMPLETED\n\n` +
        `Successfully updated: ${successCount} cakes\n` +
        `Failed to update: ${failCount} cakes\n\n` +
        (failCount > 0
          ? `Failed updates:\n${updateResults
              .filter((r) => r.status !== "success")
              .map((r) => `• ${r.cake}: ${r.status}`)
              .join("\n")}\n\n`
          : "") +
        `All successful updates are now live on the customer menu.`;

      alert(resultMessage);

      // Log detailed results for debugging
      console.log("Price Update Results:", updateResults);
    } catch (err) {
      console.error("Error saving pricing:", err);
      alert(
        `❌ CRITICAL ERROR\n\nFailed to complete pricing update: ${
          err instanceof Error ? err.message : "Unknown error"
        }\n\nNo changes have been made to the database.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount with safety checks
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        console.log("🔄 Loading pricing system data...");

        // Load ingredients and recipes with error handling
        const results = await Promise.allSettled([
          fetchIngredients(),
          fetchCakeRecipes(),
        ]);

        // Check for failures
        const ingredientsResult = results[0];
        const recipesResult = results[1];

        if (ingredientsResult.status === "rejected") {
          console.error(
            "Failed to load ingredients:",
            ingredientsResult.reason
          );
          setError(
            "⚠️ Failed to load ingredient data. Using sample data for demonstration."
          );
        }

        if (recipesResult.status === "rejected") {
          console.error("Failed to load recipes:", recipesResult.reason);
          console.log(
            "📝 Using sample recipes. Consider running the safe seeding script."
          );
        }

        // Log successful data loading
        if (
          ingredientsResult.status === "fulfilled" &&
          recipesResult.status === "fulfilled"
        ) {
          console.log("✅ All pricing data loaded successfully");
        }
      } catch (err) {
        console.error("Critical error loading data:", err);
        setError(
          `❌ Critical error: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchIngredients, fetchCakeRecipes]);

  // Calculate pricing when data changes
  useEffect(() => {
    if (ingredients.length > 0 && cakeRecipes.length > 0) {
      calculateAllPricings();
    }
  }, [ingredients, cakeRecipes, calculateAllPricings]);

  // Add new ingredient to recipe
  const addIngredientToRecipe = () => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", quantity: 0, unit: "kg" }],
    }));
  };

  // Remove ingredient from recipe
  const removeIngredientFromRecipe = (index: number) => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  // Update ingredient in recipe
  const updateRecipeIngredient = (
    index: number,
    field: keyof CakeRecipe["ingredients"][0],
    value: string | number
  ) => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  // Save new recipe
  const saveNewRecipe = () => {
    if (
      !newRecipe.name ||
      !newRecipe.category ||
      newRecipe.ingredients.length === 0
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const recipeWithId = {
      ...newRecipe,
      _id: Date.now().toString(),
    };

    setCakeRecipes((prev) => [...prev, recipeWithId]);
    setNewRecipe({
      name: "",
      category: "",
      ingredients: [],
      yield: 1,
      laborCost: 0,
      overheadCost: 0,
    });
    setShowRecipeForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-600">Loading pricing data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-orange-50 via-white to-yellow-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center space-x-4">
          <div className="bg-orange-100 p-3 rounded-lg">
            <Calculator className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cake Pricing Management
            </h1>
            <p className="text-gray-600">
              Automated pricing based on ingredient costs
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated}
            </div>
          )}
          <button
            onClick={calculateAllPricings}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            title="Recalculate all prices based on current ingredient costs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Recalculate</span>
          </button>
          <button
            onClick={savePricingToDatabase}
            disabled={loading || cakePricings.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            title="Save calculated prices to database and update customer menu"
          >
            <Save className="h-4 w-4" />
            <span>Save to Menu</span>
          </button>
        </div>
      </div>

      {/* Default Profit Margin Setting */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Percent className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Default Profit Margin
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={defaultProfitMargin}
              onChange={(e) =>
                updateDefaultProfitMargin(Number(e.target.value))
              }
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-gray-900 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              min="0"
              max="100"
            />
            <span className="text-gray-600 font-medium">%</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          This margin will be applied to all cakes. You can adjust individual
          cake margins below.
          {marginSaved ? (
            <span className="text-green-600 font-medium ml-2">✓ Saved!</span>
          ) : (
            <span className="text-green-600 font-medium ml-2">
              ✓ Auto-saved
            </span>
          )}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("pricing")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pricing"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Cake Pricing
            </button>
            <button
              onClick={() => setActiveTab("recipes")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "recipes"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Recipe Management
            </button>
          </nav>
        </div>

        {/* Pricing Tab */}
        {activeTab === "pricing" && (
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            <div className="grid gap-6">
              {cakePricings.map((pricing) => (
                <div
                  key={pricing.cakeId}
                  className="bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {pricing.cakeName}
                      </h3>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {pricing.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        Rs. {pricing.finalPrice}
                      </div>
                      <div className="text-sm text-gray-500">Final Price</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-sm text-orange-600 font-medium">
                        Ingredients
                      </div>
                      <div className="text-lg font-semibold text-orange-700">
                        Rs. {pricing.costBreakdown.ingredients.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-blue-600 font-medium">
                        Labor
                      </div>
                      <div className="text-lg font-semibold text-blue-700">
                        Rs. {pricing.costBreakdown.labor.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-sm text-purple-600 font-medium">
                        Overhead
                      </div>
                      <div className="text-lg font-semibold text-purple-700">
                        Rs. {pricing.costBreakdown.overhead.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 font-medium">
                        Total Cost
                      </div>
                      <div className="text-lg font-semibold text-gray-700">
                        Rs. {pricing.costBreakdown.total.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        Profit Margin:
                      </span>
                      {editingMargin === pricing.cakeId ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            defaultValue={pricing.profitMargin}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                            min="0"
                            max="100"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                const newMargin = Number(
                                  (e.target as HTMLInputElement).value
                                );
                                updateCakePricing(pricing.cakeId, newMargin);
                                setEditingMargin(null);
                              }
                            }}
                          />
                          <span className="text-sm text-gray-600">%</span>
                          <button
                            onClick={() => setEditingMargin(null)}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {pricing.profitMargin}%
                          </span>
                          <button
                            onClick={() => setEditingMargin(pricing.cakeId)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Updated: {new Date(pricing.lastUpdated).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recipe Management Tab */}
        {activeTab === "recipes" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Cake Recipes
              </h3>
              <button
                onClick={() => setShowRecipeForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Recipe</span>
              </button>
            </div>

            {/* Recipe Form */}
            {showRecipeForm && (
              <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 via-white to-blue-25 rounded-xl border-2 border-blue-200 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Add New Recipe
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Cake Name"
                    value={newRecipe.name}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="px-4 py-3 border-2 border-blue-200 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                  <select
                    value={newRecipe.category}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="px-4 py-3 border-2 border-blue-200 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="" className="text-gray-500">
                      Select Category
                    </option>
                    <option value="Classic" className="text-gray-900">
                      Classic
                    </option>
                    <option value="Chocolate" className="text-gray-900">
                      Chocolate
                    </option>
                    <option value="Fruit" className="text-gray-900">
                      Fruit
                    </option>
                    <option value="Specialty" className="text-gray-900">
                      Specialty
                    </option>
                  </select>
                  <input
                    type="number"
                    placeholder="Yield (kg)"
                    value={newRecipe.yield}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({
                        ...prev,
                        yield: Number(e.target.value),
                      }))
                    }
                    className="px-4 py-3 border-2 border-blue-200 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    step="0.1"
                  />
                  <input
                    type="number"
                    placeholder="Labor Cost (Rs)"
                    value={newRecipe.laborCost}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({
                        ...prev,
                        laborCost: Number(e.target.value),
                      }))
                    }
                    className="px-4 py-3 border-2 border-blue-200 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Overhead Cost (Rs)"
                  value={newRecipe.overheadCost}
                  onChange={(e) =>
                    setNewRecipe((prev) => ({
                      ...prev,
                      overheadCost: Number(e.target.value),
                    }))
                  }
                  className="px-4 py-3 border-2 border-blue-200 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all mb-4 w-full md:w-auto"
                />

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-semibold text-gray-900 text-lg">
                      Ingredients
                    </h5>
                    <button
                      onClick={addIngredientToRecipe}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Ingredient</span>
                    </button>
                  </div>
                  {newRecipe.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 mb-3 p-3 bg-blue-25 rounded-lg border border-blue-100"
                    >
                      <select
                        value={ingredient.name}
                        onChange={(e) =>
                          updateRecipeIngredient(index, "name", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border-2 border-blue-200 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      >
                        <option value="" className="text-gray-500">
                          Select Ingredient
                        </option>
                        {ingredients.map((ing) => (
                          <option
                            key={ing._id}
                            value={ing.name}
                            className="text-gray-900"
                          >
                            {ing.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          updateRecipeIngredient(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        className="w-24 px-3 py-2 border-2 border-blue-200 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-center font-medium"
                        step="0.01"
                      />
                      <select
                        value={ingredient.unit}
                        onChange={(e) =>
                          updateRecipeIngredient(index, "unit", e.target.value)
                        }
                        className="w-24 px-3 py-2 border-2 border-blue-200 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-center font-medium"
                      >
                        <option value="kg" className="text-gray-900">
                          kg
                        </option>
                        <option value="pieces" className="text-gray-900">
                          pieces
                        </option>
                        <option value="ml" className="text-gray-900">
                          ml
                        </option>
                      </select>
                      <button
                        onClick={() => removeIngredientFromRecipe(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove ingredient"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3 pt-4 border-t border-blue-200">
                  <button
                    onClick={saveNewRecipe}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm font-medium"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save Recipe</span>
                  </button>
                  <button
                    onClick={() => setShowRecipeForm(false)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-sm font-medium"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {/* Recipe List */}
            <div className="grid gap-4">
              {cakeRecipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-md font-semibold text-gray-900">
                        {recipe.name}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {recipe.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        Yield: {recipe.yield} kg
                      </div>
                      <div className="text-sm text-gray-600">
                        Labor: Rs. {recipe.laborCost} | Overhead: Rs.{" "}
                        {recipe.overheadCost}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Ingredients:</strong>{" "}
                    {recipe.ingredients
                      .map((ing) => `${ing.name} (${ing.quantity} ${ing.unit})`)
                      .join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CakePricing;
