export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface CakeRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  basePrice: number; // Cost of ingredients
  currentPrice: number; // Final selling price
  profitMargin: number; // 20% = 0.20
  lastUpdated: string;
  category: string;
}

export interface PriceCalculationResult {
  recipeCost: number;
  profitAmount: number;
  finalPrice: number;
}
