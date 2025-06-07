"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Plus,
  Lightbulb,
  Target,
} from "lucide-react";
import { useIngredients } from "@/lib/hooks/useIngredients";

// Define TypeScript interfaces
interface ForecastData {
  historical: Array<{
    date: string;
    price: number;
    confidence?: number;
  }>;
  predictions: Array<{
    date: string;
    predictedPrice: number;
    confidence: number;
  }>;
  insights: Array<{
    type: string;
    title: string;
    message: string;
    priority: string;
  }>;
  statistics: {
    average: number;
    trend: {
      direction: "increasing" | "decreasing" | "stable";
      percentage: number;
    };
    dataPoints: number;
  };
  currentPrice: number;
  historicalData?: Array<{
    date: string;
    actualPrice: number;
    trendPrice: number;
  }>;
}

interface NewIngredient {
  name: string;
  category: string;
  price: string;
  unit: string;
  source: string;
}

interface ForecastsMap {
  [key: string]: ForecastData;
}

export default function Forecast() {
  const {
    ingredients,
    forecasts,
    loading,
    forecastLoading,
    error,
    fetchIngredients,
    addIngredientPrice,
    fetchForecasts,
    getPriceAlerts,
  } = useIngredients();

  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [forecastDays, setForecastDays] = useState<number>(30);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newIngredient, setNewIngredient] = useState<NewIngredient>({
    name: "",
    category: "Flour",
    price: "",
    unit: "kg",
    source: "manual",
  });
  // Type the hook returns properly
  const typedForecasts = forecasts as ForecastsMap;

  const ingredientCategories = [
    "Flour",
    "Sugar",
    "Dairy",
    "Eggs",
    "Fats",
    "Flavoring",
    "Other",
  ];
  const units = ["kg", "liter", "piece", "gram", "pound"];

  // Fetch forecasts when component mounts or when forecast parameters change
  useEffect(() => {
    if (ingredients.length > 0) {
      (
        fetchForecasts as (
          ingredient?: string | null,
          days?: number
        ) => Promise<unknown>
      )(selectedIngredient, forecastDays);
    }
  }, [fetchForecasts, selectedIngredient, forecastDays, ingredients.length]);

  // Handle adding new ingredient price
  const handleAddIngredientPrice = async () => {
    if (
      !newIngredient.name ||
      !newIngredient.price ||
      parseFloat(newIngredient.price) <= 0
    ) {
      alert("Please fill in all required fields with valid values");
      return;
    }

    try {
      await addIngredientPrice({
        name: newIngredient.name,
        category: newIngredient.category,
        price: parseFloat(newIngredient.price),
        unit: newIngredient.unit,
        source: newIngredient.source,
      });

      setNewIngredient({
        name: "",
        category: "Flour",
        price: "",
        unit: "kg",
        source: "manual",
      });
      setShowAddForm(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      alert(`Error adding ingredient price: ${errorMessage}`);
    }
  }; // Prepare chart data for selected ingredient
  const getChartData = () => {
    if (!selectedIngredient || !typedForecasts[selectedIngredient]) {
      return [];
    }

    const forecast = typedForecasts[selectedIngredient];
    const historical = forecast.historicalData || [];
    const predictions = forecast.predictions || [];

    return [
      ...historical.map((item) => ({
        date: item.date,
        actual: item.actualPrice,
        trend: item.trendPrice,
        type: "historical",
      })),
      ...predictions.map((item) => ({
        date: item.date,
        predicted: item.predictedPrice,
        confidence: item.confidence,
        type: "prediction",
      })),
    ];
  };

  // Get price alerts
  const priceAlerts = getPriceAlerts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading ingredient data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => fetchIngredients()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Ingredient Price Forecasting
          </h1>
          <p className="text-purple-200">
            AI-powered price predictions to optimize your purchasing decisions
          </p>
        </div>
        {/* Price Alerts */}
        {priceAlerts.length > 0 && (
          <div className="bg-red-500/10 backdrop-blur-md rounded-xl p-6 border border-red-500/20 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="text-red-400 w-5 h-5" />
              Price Alerts
            </h2>{" "}
            <div className="grid gap-3">
              {priceAlerts.map(
                (
                  alert: {
                    ingredient: string;
                    title: string;
                    message: string;
                    type: string;
                    priority: string;
                  },
                  index: number
                ) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white">
                          {alert.ingredient}
                        </h3>
                        <p className="text-sm text-purple-200">{alert.title}</p>
                        <p className="text-xs text-purple-300 mt-1">
                          {alert.message}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.priority === "high"
                            ? "bg-red-500 text-white"
                            : alert.priority === "medium"
                            ? "bg-yellow-500 text-black"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {alert.priority}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Select Ingredient
                </label>
                <select
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" className="bg-slate-800 text-white">
                    All Ingredients{" "}
                  </option>
                  {ingredients.map(
                    (ingredient: {
                      _id?: string;
                      name: string;
                      currentPrice: number;
                      unit: string;
                    }) => (
                      <option
                        key={ingredient._id}
                        value={ingredient.name}
                        className="bg-slate-800 text-white"
                      >
                        {ingredient.name} (Rs. {ingredient.currentPrice}/
                        {ingredient.unit})
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Forecast Period
                </label>
                <select
                  value={forecastDays}
                  onChange={(e) => setForecastDays(parseInt(e.target.value))}
                  className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={7} className="bg-slate-800 text-white">
                    1 Week
                  </option>
                  <option value={30} className="bg-slate-800 text-white">
                    1 Month
                  </option>
                  <option value={60} className="bg-slate-800 text-white">
                    2 Months
                  </option>
                  <option value={90} className="bg-slate-800 text-white">
                    3 Months
                  </option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              {" "}
              <button
                onClick={() =>
                  (
                    fetchForecasts as (
                      ingredient?: string | null,
                      days?: number
                    ) => Promise<unknown>
                  )(selectedIngredient, forecastDays)
                }
                disabled={forecastLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
              >
                {forecastLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh Forecast
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Price Data
              </button>
            </div>
          </div>
        </div>
        {/* Add Price Form */}
        {showAddForm && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Add New Price Entry
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Ingredient name"
                value={newIngredient.name}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, name: e.target.value })
                }
                className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <select
                value={newIngredient.category}
                onChange={(e) =>
                  setNewIngredient({
                    ...newIngredient,
                    category: e.target.value,
                  })
                }
                className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {ingredientCategories.map((category) => (
                  <option
                    key={category}
                    value={category}
                    className="bg-slate-800 text-white"
                  >
                    {category}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Price"
                value={newIngredient.price}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, price: e.target.value })
                }
                className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <select
                value={newIngredient.unit}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, unit: e.target.value })
                }
                className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {units.map((unit) => (
                  <option
                    key={unit}
                    value={unit}
                    className="bg-slate-800 text-white"
                  >
                    {unit}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddIngredientPrice}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        )}{" "}
        {/* Price Forecast Chart */}
        {selectedIngredient && typedForecasts[selectedIngredient] && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Price Forecast: {selectedIngredient}
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={getChartData()}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="date" tick={{ fill: "white" }} />
                <YAxis tick={{ fill: "white" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  formatter={(value: number | string, name: string) => [
                    `Rs. ${
                      typeof value === "number" ? value.toFixed(2) : "N/A"
                    }`,
                    name === "actual"
                      ? "Actual Price"
                      : name === "predicted"
                      ? "Predicted Price"
                      : "Trend",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Actual"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke="#10b981"
                  strokeWidth={1}
                  name="Trend"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}{" "}
        {/* Insights and Recommendations */}
        {selectedIngredient &&
          typedForecasts[selectedIngredient] &&
          typedForecasts[selectedIngredient].insights && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="text-yellow-400 w-5 h-5" />
                AI Insights & Recommendations
              </h2>{" "}
              <div className="grid gap-4">
                {typedForecasts[selectedIngredient].insights.map(
                  (
                    insight: {
                      type: string;
                      title: string;
                      message: string;
                      priority: string;
                    },
                    index: number
                  ) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.type === "warning"
                          ? "bg-yellow-500/10 border-yellow-500"
                          : insight.type === "alert"
                          ? "bg-red-500/10 border-red-500"
                          : insight.type === "opportunity"
                          ? "bg-green-500/10 border-green-500"
                          : "bg-blue-500/10 border-blue-500"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white">
                            {insight.title}
                          </h3>
                          <p className="text-sm text-purple-200 mt-1">
                            {insight.message}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            insight.priority === "high"
                              ? "bg-red-500 text-white"
                              : insight.priority === "medium"
                              ? "bg-yellow-500 text-black"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {insight.priority}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        {/* Summary Statistics */}{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(typedForecasts).map(
            ([name, forecast]: [string, ForecastData]) =>
              forecast.statistics && (
                <div
                  key={name}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {name}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-200">Current:</span>
                      <span className="text-white font-medium">
                        Rs. {forecast.currentPrice}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Average:</span>
                      <span className="text-white font-medium">
                        Rs. {forecast.statistics.average}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Trend:</span>
                      <span
                        className={`font-medium flex items-center gap-1 ${
                          forecast.statistics.trend.direction === "increasing"
                            ? "text-red-400"
                            : forecast.statistics.trend.direction ===
                              "decreasing"
                            ? "text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        {forecast.statistics.trend.direction ===
                        "increasing" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : forecast.statistics.trend.direction ===
                          "decreasing" ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <Target className="w-4 h-4" />
                        )}
                        {forecast.statistics.trend.percentage}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Data Points:</span>
                      <span className="text-white font-medium">
                        {forecast.statistics.dataPoints}
                      </span>
                    </div>
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}
