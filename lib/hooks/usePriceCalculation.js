"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * @typedef {Object} InventoryItem
 * @property {string} id
 * @property {string} name
 * @property {number} costPerUnit
 * @property {string} unit
 * @property {number} quantity
 */

export function usePriceCalculation() {
  const [cakeRecipes, setCakeRecipes] = useState([]);

  // Sample cake recipes with default ingredients
  const defaultRecipes = useMemo(() => [
    {
      id: "recipe_1",
      name: "Vanilla Sponge Cake",
      description: "Classic vanilla sponge cake (1kg)",
      category: "Sponge Cakes",
      profitMargin: 0.20, // 20%
      basePrice: 0,
      currentPrice: 0,
      lastUpdated: new Date().toISOString(),
      ingredients: [
        { ingredientId: "1", ingredientName: "All-Purpose Flour", quantity: 0.5, unit: "kg" },
        { ingredientId: "2", ingredientName: "Granulated Sugar", quantity: 0.3, unit: "kg" },
        { ingredientId: "3", ingredientName: "Unsalted Butter", quantity: 0.2, unit: "kg" },
        { ingredientId: "4", ingredientName: "Fresh Eggs", quantity: 0.5, unit: "dozen" },
        { ingredientId: "5", ingredientName: "Baking Powder", quantity: 0.02, unit: "packages" },
        { ingredientId: "6", ingredientName: "Vanilla Extract", quantity: 0.05, unit: "liters" },
      ]
    },
    {
      id: "recipe_2",
      name: "Chocolate Fudge Cake",
      description: "Rich chocolate cake with cocoa (1kg)",
      category: "Chocolate Cakes",
      profitMargin: 0.20,
      basePrice: 0,
      currentPrice: 0,
      lastUpdated: new Date().toISOString(),
      ingredients: [
        { ingredientId: "1", ingredientName: "All-Purpose Flour", quantity: 0.4, unit: "kg" },
        { ingredientId: "2", ingredientName: "Granulated Sugar", quantity: 0.3, unit: "kg" },
        { ingredientId: "3", ingredientName: "Unsalted Butter", quantity: 0.15, unit: "kg" },
        { ingredientId: "4", ingredientName: "Fresh Eggs", quantity: 0.4, unit: "dozen" },
        { ingredientId: "5", ingredientName: "Baking Powder", quantity: 0.015, unit: "packages" },
        { ingredientId: "7", ingredientName: "Cocoa Powder", quantity: 0.1, unit: "kg" },
      ]
    },
    {
      id: "recipe_3",
      name: "Butter Cake",
      description: "Rich butter cake (1kg)",
      category: "Butter Cakes",
      profitMargin: 0.20,
      basePrice: 0,
      currentPrice: 0,
      lastUpdated: new Date().toISOString(),
      ingredients: [
        { ingredientId: "1", ingredientName: "All-Purpose Flour", quantity: 0.6, unit: "kg" },
        { ingredientId: "2", ingredientName: "Granulated Sugar", quantity: 0.4, unit: "kg" },
        { ingredientId: "3", ingredientName: "Unsalted Butter", quantity: 0.3, unit: "kg" },
        { ingredientId: "4", ingredientName: "Fresh Eggs", quantity: 0.6, unit: "dozen" },
        { ingredientId: "5", ingredientName: "Baking Powder", quantity: 0.025, unit: "packages" },
        { ingredientId: "6", ingredientName: "Vanilla Extract", quantity: 0.03, unit: "liters" },
      ]
    }
  ], []); // Empty dependency array since this data is static
  // Calculate cost for a single recipe
  /**
   * @param {Object} recipe
   * @param {Array<InventoryItem>} inventory
   * @returns {{recipeCost: number, profitAmount: number, finalPrice: number}}
   */
  const calculateRecipeCost = useCallback((recipe, inventory) => {
    let totalCost = 0;

    recipe.ingredients.forEach(recipeIngredient => {
      const inventoryItem = inventory.find(item =>
        item.id === recipeIngredient.ingredientId ||
        item.name === recipeIngredient.ingredientName
      );

      if (inventoryItem) {
        // Calculate cost for this ingredient
        const cost = recipeIngredient.quantity * inventoryItem.costPerUnit;
        totalCost += cost;
      }
    });

    const profitAmount = totalCost * recipe.profitMargin;
    const finalPrice = totalCost + profitAmount;

    return {
      recipeCost: totalCost,
      profitAmount: profitAmount,
      finalPrice: finalPrice
    };
  }, []);

  // Update all cake prices based on current inventory
  /**
   * @param {Array<InventoryItem>} inventory
   */
  const updateCakePrices = useCallback((inventory) => {
    setCakeRecipes(currentRecipes => {
      const updatedRecipes = currentRecipes.map(recipe => {
        const calculation = calculateRecipeCost(recipe, inventory);

        return {
          ...recipe,
          basePrice: calculation.recipeCost,
          currentPrice: calculation.finalPrice,
          lastUpdated: new Date().toISOString()
        };
      });

      // Save to localStorage
      localStorage.setItem('cakeRecipes', JSON.stringify(updatedRecipes));

      // Sync with database
      const priceUpdates = updatedRecipes.map(recipe => ({
        name: recipe.name,
        newPrice: recipe.currentPrice
      }));

      // Update database prices asynchronously
      fetch('/api/cakes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceUpdates })
      }).catch(error => {
        console.error('Failed to sync cake prices with database:', error);
      });

      return updatedRecipes;
    });
  }, [calculateRecipeCost]);  // Initialize recipes
  useEffect(() => {
    const savedRecipes = localStorage.getItem('cakeRecipes');
    if (savedRecipes) {
      try {
        setCakeRecipes(JSON.parse(savedRecipes));
      } catch (error) {
        console.error('Error parsing saved recipes:', error);
        setCakeRecipes(defaultRecipes);
      }
    } else {
      setCakeRecipes(defaultRecipes);
      localStorage.setItem('cakeRecipes', JSON.stringify(defaultRecipes));
    }
  }, [defaultRecipes]);

  return {
    cakeRecipes,
    setCakeRecipes,
    calculateRecipeCost,
    updateCakePrices,
    defaultRecipes
  };
}

// Helper function to get total cake count from database
export async function getCakeCount() {
  try {
    const response = await fetch('/api/cakes');
    if (response.ok) {
      const cakes = await response.json();
      return cakes.length;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching cake count:', error);
    return 0;
  }
}
