import { useState, useEffect, useCallback } from 'react';

// Types
export interface ForecastData {
  date: string;
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
  confidence_interval: string;
  days_from_now: number;
}

export interface ForecastInsights {
  trend: 'increasing' | 'decreasing' | 'stable';
  trend_strength: 'stable' | 'moderate' | 'significant';
  price_change_amount: number;
  price_change_percentage: number;
  average_price: number;
  highest_price: number;
  lowest_price: number;
  price_volatility: number;
  recommendation: string;
  confidence_level: 'high' | 'medium' | 'low';
}

export interface ForecastMetadata {
  generated_at: string;
  model_type: string;
  data_points_used: number;
  confidence_interval: string;
  processing_time_seconds: number;
}

export interface ForecastResult {
  ingredient: string;
  forecast_period: {
    start_date: string;
    days: number;
    end_date: string | null;
  };
  forecast_data: ForecastData[];
  insights: ForecastInsights;
  metadata: ForecastMetadata;
}

export interface ApiResponse {
  success: boolean;
  data?: ForecastResult;
  error?: string;
  generated_at?: string;
  processing_time?: string | null;
  timestamp?: string;
}

export interface UsePriceForecastOptions {
  days?: number;
  startDate?: string | null;
  autoFetch?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface UsePriceForecastReturn {
  forecast: ForecastResult | null;
  loading: boolean;
  error: string | null;
  refetch: (options?: { days?: number; startDate?: string }) => Promise<void>;
  clearError: () => void;
  isStale: boolean;
  lastUpdated: Date | null;
}

// Custom hook for price forecasting
export const usePriceForecast = (
  ingredient: string,
  options: UsePriceForecastOptions = {}
): UsePriceForecastReturn => {
  const {
    days = 7,
    startDate = null,
    autoFetch = true,
    refreshInterval
  } = options;

  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchForecast = useCallback(async (fetchOptions?: { days?: number; startDate?: string }) => {
    if (!ingredient?.trim()) {
      setError('Ingredient name is required');
      return;
    }

    const fetchDays = fetchOptions?.days ?? days;
    const fetchStartDate = fetchOptions?.startDate ?? startDate;

    setLoading(true);
    setError(null);

    try {
      console.log(`🔮 Fetching forecast for ${ingredient} (${fetchDays} days)`);

      // Build query parameters
      const searchParams = new URLSearchParams({
        days: fetchDays.toString(),
      });

      if (fetchStartDate) {
        searchParams.append('startDate', fetchStartDate);
      }

      // Make API request
      const response = await fetch(`/api/forecast/${encodeURIComponent(ingredient)}?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        setForecast(result.data);
        setLastUpdated(new Date());
        console.log(`✅ Successfully fetched forecast for ${ingredient}`);
      } else {
        throw new Error(result.error || 'Failed to fetch forecast data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch forecast';
      console.error(`❌ Error fetching forecast for ${ingredient}:`, errorMessage);
      setError(errorMessage);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  }, [ingredient, days, startDate]);

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (autoFetch && ingredient?.trim()) {
      fetchForecast();
    }
  }, [ingredient, days, startDate, autoFetch, fetchForecast]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!refreshInterval || !autoFetch) return;

    const intervalId = setInterval(() => {
      if (ingredient?.trim() && !loading) {
        console.log(`🔄 Auto-refreshing forecast for ${ingredient}`);
        fetchForecast();
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, autoFetch, ingredient, loading, fetchForecast]);

  // Calculate if data is stale (older than 30 minutes)
  const isStale = lastUpdated ? (Date.now() - lastUpdated.getTime()) > 30 * 60 * 1000 : true;

  const refetch = useCallback(async (refetchOptions?: { days?: number; startDate?: string }) => {
    await fetchForecast(refetchOptions);
  }, [fetchForecast]);

  return {
    forecast,
    loading,
    error,
    refetch,
    clearError,
    isStale,
    lastUpdated
  };
};

// Hook for multiple ingredients
export const useMultiplePriceForecasts = (
  ingredients: string[],
  options: UsePriceForecastOptions = {}
) => {
  const [forecasts, setForecasts] = useState<Record<string, ForecastResult>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchMultipleForecasts = useCallback(async () => {
    if (!ingredients.length) return;

    setLoading(true);
    const newForecasts: Record<string, ForecastResult> = {};
    const newErrors: Record<string, string> = {};

    await Promise.all(
      ingredients.map(async (ingredient) => {
        try {
          const searchParams = new URLSearchParams({
            days: (options.days || 7).toString(),
          });

          if (options.startDate) {
            searchParams.append('startDate', options.startDate);
          }

          const response = await fetch(`/api/forecast/${encodeURIComponent(ingredient)}?${searchParams}`);
          const result: ApiResponse = await response.json();

          if (result.success && result.data) {
            newForecasts[ingredient] = result.data;
          } else {
            newErrors[ingredient] = result.error || 'Failed to fetch forecast';
          }
        } catch (err) {
          newErrors[ingredient] = err instanceof Error ? err.message : 'Network error';
        }
      })
    );

    setForecasts(newForecasts);
    setErrors(newErrors);
    setLoading(false);
  }, [ingredients, options.days, options.startDate]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchMultipleForecasts();
    }
  }, [fetchMultipleForecasts, options.autoFetch]);

  return {
    forecasts,
    loading,
    errors,
    refetch: fetchMultipleForecasts
  };
};

// Hook for recipe cost forecasting
export interface RecipeIngredient {
  name: string;
  quantity: number; // in kg or appropriate unit
  unit?: string;
}

export interface RecipeData {
  name: string;
  ingredients: RecipeIngredient[];
}

export interface RecipeCostForecast {
  date: string;
  total_cost: number;
  ingredient_costs: Record<string, {
    unit_price: number;
    quantity: number;
    total_cost: number;
  }>;
  days_from_now: number;
}

export interface RecipeForecastResult {
  recipe_name: string;
  total_cost_forecast: RecipeCostForecast[];
  ingredient_forecasts: Record<string, ForecastResult>;
  generated_at: string;
}

export const useRecipeCostForecast = (
  recipe: RecipeData | null,
  options: UsePriceForecastOptions = {}
) => {
  const [forecast, setForecast] = useState<RecipeForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipeForecast = useCallback(async () => {
    if (!recipe || !recipe.ingredients.length) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/forecast/recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeData: recipe,
          days: options.days || 7,
          startDate: options.startDate
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        setForecast(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch recipe forecast');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipe forecast');
    } finally {
      setLoading(false);
    }
  }, [recipe, options.days, options.startDate]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchRecipeForecast();
    }
  }, [fetchRecipeForecast, options.autoFetch]);

  return {
    forecast,
    loading,
    error,
    refetch: fetchRecipeForecast
  };
};