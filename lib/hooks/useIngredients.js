import { useState, useEffect, useCallback } from 'react';

export function useIngredients() {
    const [ingredients, setIngredients] = useState([]);
    const [forecasts, setForecasts] = useState({});
    const [loading, setLoading] = useState(true);
    const [forecastLoading, setForecastLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all ingredients
    const fetchIngredients = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ingredients');
            const result = await res.json();

            if (result.success) {
                // Filter out any invalid ingredients before setting state
                const validIngredients = Array.isArray(result.data)
                    ? result.data.filter(ingredient =>
                        ingredient &&
                        ingredient.name &&
                        typeof ingredient.name === 'string'
                    )
                    : [];
                setIngredients(validIngredients);
                setError(null);
            } else {
                setError(result.error || 'Failed to fetch ingredients');
            }
        } catch (err) {
            console.error('Fetch ingredients error:', err);
            setError('Failed to fetch ingredients');
        } finally {
            setLoading(false);
        }
    }, []);

    // Add new ingredient price entry
    const addIngredientPrice = useCallback(async (ingredientData) => {
        // Validate input data
        if (!ingredientData || !ingredientData.name || typeof ingredientData.name !== 'string') {
            const error = 'Invalid ingredient data: name is required';
            setError(error);
            throw new Error(error);
        }

        try {
            console.log('Sending ingredient data:', ingredientData);
            const res = await fetch('/api/ingredients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ingredientData),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json();
            console.log('API Response:', result);

            if (result.success && result.data && result.data.name) {
                // Update or add ingredient in the state
                try {
                    setIngredients((prev) => {
                        // Ensure prev is always an array
                        const prevArray = Array.isArray(prev) ? prev : [];

                        // Filter out any undefined or invalid entries and find existing ingredient
                        const validIngredients = prevArray.filter(ing =>
                            ing &&
                            ing.name &&
                            typeof ing.name === 'string'
                        );

                        const existingIndex = validIngredients.findIndex(ing =>
                            ing &&
                            ing.name &&
                            ing.name === result.data.name
                        );

                        if (existingIndex >= 0) {
                            // Update existing ingredient
                            const updated = [...validIngredients];
                            updated[existingIndex] = result.data;
                            return updated;
                        } else {
                            // Add new ingredient
                            return [result.data, ...validIngredients];
                        }
                    });
                } catch (stateError) {
                    console.error('Error updating ingredients state:', stateError);
                    setError('Failed to update ingredient state');
                    throw stateError;
                }
                setError(null);
                return result.data;
            } else {
                const errorMessage = result.error || 'Unknown API error occurred';
                console.error('API Error:', errorMessage);
                console.error('Full API response:', result);
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        } catch (err) {
            console.error('Add ingredient error:', err);
            const errorMessage = err.message || 'Failed to add ingredient price';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // Fetch forecasts for all ingredients or specific ingredient
    const fetchForecasts = useCallback(async (ingredientName = null, days = 30) => {
        setForecastLoading(true);
        try {
            const params = new URLSearchParams();
            if (ingredientName) params.append('ingredient', ingredientName);
            params.append('days', days.toString());

            const res = await fetch(`/api/ingredients/forecast?${params}`);
            const result = await res.json();

            if (result.success) {
                setForecasts(result.data);
                setError(null);
                return result.data;
            } else {
                setError(result.error || 'Failed to fetch forecasts');
                throw new Error(result.error || 'Failed to fetch forecasts');
            }
        } catch (err) {
            console.error('Fetch forecasts error:', err);
            setError('Failed to fetch forecasts');
            throw err;
        } finally {
            setForecastLoading(false);
        }
    }, []);

    // Get ingredient by name
    const getIngredient = useCallback((name) => {
        if (!name || typeof name !== 'string') return null;
        return ingredients.find(ingredient =>
            ingredient &&
            ingredient.name &&
            typeof ingredient.name === 'string' &&
            ingredient.name === name
        );
    }, [ingredients]);

    // Get forecast for specific ingredient
    const getForecast = useCallback((name) => {
        return forecasts[name];
    }, [forecasts]);

    // Get all ingredients with their current prices
    const getIngredientPrices = useCallback(() => {
        return ingredients
            .filter(ingredient => ingredient && ingredient.name)
            .map(ingredient => ({
                name: ingredient.name,
                currentPrice: ingredient.currentPrice,
                unit: ingredient.unit,
                category: ingredient.category,
                lastUpdated: ingredient.updatedAt
            }));
    }, [ingredients]);

    // Get ingredients by category
    const getIngredientsByCategory = useCallback((category) => {
        if (!category || typeof category !== 'string') return [];
        return ingredients.filter(ingredient =>
            ingredient &&
            ingredient.category &&
            typeof ingredient.category === 'string' &&
            ingredient.category === category
        );
    }, [ingredients]);

    // Calculate total inventory value (if you have quantities)
    const getTotalInventoryValue = useCallback(() => {
        return ingredients
            .filter(ingredient => ingredient && ingredient.currentPrice)
            .reduce((total, ingredient) => {
                // This would need quantity data to be meaningful
                return total + (ingredient.currentPrice || 0);
            }, 0);
    }, [ingredients]);

    // Get price alerts (ingredients with significant price changes)
    const getPriceAlerts = useCallback(() => {
        const alerts = [];

        Object.entries(forecasts).forEach(([name, forecast]) => {
            if (forecast.insights) {
                forecast.insights
                    .filter(insight => insight.priority === 'high')
                    .forEach(insight => {
                        alerts.push({
                            ingredient: name,
                            type: insight.type,
                            title: insight.title,
                            message: insight.message,
                            priority: insight.priority
                        });
                    });
            }
        });

        return alerts;
    }, [forecasts]);

    useEffect(() => {
        fetchIngredients();
    }, [fetchIngredients]);

    return {
        ingredients,
        forecasts,
        loading,
        forecastLoading,
        error,
        fetchIngredients,
        addIngredientPrice,
        fetchForecasts,
        getIngredient,
        getForecast,
        getIngredientPrices,
        getIngredientsByCategory,
        getTotalInventoryValue,
        getPriceAlerts,
    };
}
