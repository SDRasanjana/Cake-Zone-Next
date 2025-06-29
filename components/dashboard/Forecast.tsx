"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Wheat,
  Egg,
  Milk,
  Cookie,
  Activity,
  Calendar,
  Target,
} from "lucide-react";

// Define TypeScript interfaces for the forecast data
interface ForecastDataPoint {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

interface InsightData {
  trend: string;
  percentage_change: number;
  highest_price: number;
  lowest_price: number;
  average_price: number;
  forecast_date: string;
}

interface IngredientData {
  data: ForecastDataPoint[] | null;
  insights: InsightData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string;
}

type IngredientType = "flour" | "sugar" | "eggs" | "butter";

export default function Forecast() {
  const [selectedIngredient, setSelectedIngredient] =
    useState<IngredientType>("flour");
  const [ingredientsData, setIngredientsData] = useState<
    Record<IngredientType, IngredientData>
  >({
    flour: {
      data: null,
      insights: null,
      loading: false,
      error: null,
      lastUpdated: "",
    },
    sugar: {
      data: null,
      insights: null,
      loading: false,
      error: null,
      lastUpdated: "",
    },
    eggs: {
      data: null,
      insights: null,
      loading: false,
      error: null,
      lastUpdated: "",
    },
    butter: {
      data: null,
      insights: null,
      loading: false,
      error: null,
      lastUpdated: "",
    },
  });

  const ingredientConfig = {
    flour: {
      name: "Flour",
      icon: Wheat,
      color: "amber",
      gradient: "from-amber-50 to-white",
      bgColor: "bg-amber-100",
      textColor: "text-amber-600",
      borderColor: "border-amber-200",
      hoverColor: "hover:bg-amber-50",
    },
    sugar: {
      name: "Sugar",
      icon: Cookie,
      color: "pink",
      gradient: "from-pink-50 to-white",
      bgColor: "bg-pink-100",
      textColor: "text-pink-600",
      borderColor: "border-pink-200",
      hoverColor: "hover:bg-pink-50",
    },
    eggs: {
      name: "Eggs",
      icon: Egg,
      color: "yellow",
      gradient: "from-yellow-50 to-white",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-200",
      hoverColor: "hover:bg-yellow-50",
    },
    butter: {
      name: "Butter",
      icon: Milk,
      color: "orange",
      gradient: "from-orange-50 to-white",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      borderColor: "border-orange-200",
      hoverColor: "hover:bg-orange-50",
    },
  };

  // Function to run Python forecast script for specific ingredient
  const runPythonForecast = async (ingredient: IngredientType) => {
    setIngredientsData((prev) => ({
      ...prev,
      [ingredient]: { ...prev[ingredient], loading: true, error: null },
    }));

    try {
      const response = await fetch(
        `/api/forecast/run-python?ingredient=${ingredient}`
      );
      const data = await response.json();

      if (data.success) {
        if (data.forecastData && Array.isArray(data.forecastData)) {
          setIngredientsData((prev) => ({
            ...prev,
            [ingredient]: {
              ...prev[ingredient],
              data: data.forecastData,
              insights: data.insights || null,
              loading: false,
              lastUpdated: new Date().toLocaleString(),
            },
          }));
        } else {
          setIngredientsData((prev) => ({
            ...prev,
            [ingredient]: {
              ...prev[ingredient],
              loading: false,
              error: "Received invalid forecast data format",
            },
          }));
        }
      } else {
        setIngredientsData((prev) => ({
          ...prev,
          [ingredient]: {
            ...prev[ingredient],
            loading: false,
            error: data.error || "Failed to generate forecast",
          },
        }));
      }
    } catch (err) {
      setIngredientsData((prev) => ({
        ...prev,
        [ingredient]: {
          ...prev[ingredient],
          loading: false,
          error:
            "Error running forecast: " +
            (err instanceof Error ? err.message : "Unknown error"),
        },
      }));
    }
  };

  // Function to run all forecasts
  const runAllForecasts = async () => {
    const ingredients: IngredientType[] = ["flour", "sugar", "eggs", "butter"];
    await Promise.all(
      ingredients.map((ingredient) => runPythonForecast(ingredient))
    );
  };

  // Load all forecast data on initial component mount
  useEffect(() => {
    const loadInitialData = async () => {
      const ingredients: IngredientType[] = [
        "flour",
        "sugar",
        "eggs",
        "butter",
      ];
      await Promise.all(
        ingredients.map((ingredient) => runPythonForecast(ingredient))
      );
    };
    loadInitialData();
  }, []);

  const currentData = ingredientsData[selectedIngredient];
  const config = ingredientConfig[selectedIngredient];
  const IconComponent = config.icon;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Price Forecasting
            </h1>
            <p className="text-gray-500">
              Machine learning predictions for ingredient prices
            </p>
          </div>
        </div>
        <button
          onClick={runAllForecasts}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh All</span>
        </button>
      </div>

      {/* Ingredient Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        <div className="grid grid-cols-4 gap-1">
          {(Object.keys(ingredientConfig) as IngredientType[]).map(
            (ingredient) => {
              const isSelected = selectedIngredient === ingredient;
              const ingredientConf = ingredientConfig[ingredient];
              const IngredientIcon = ingredientConf.icon;
              const ingredientData = ingredientsData[ingredient];

              return (
                <button
                  key={ingredient}
                  onClick={() => setSelectedIngredient(ingredient)}
                  className={`
                  flex flex-col items-center p-4 rounded-lg transition-all duration-200 relative
                  ${
                    isSelected
                      ? `${ingredientConf.bgColor} ${ingredientConf.textColor} shadow-sm`
                      : `text-gray-500 ${ingredientConf.hoverColor}`
                  }
                `}
                >
                  {ingredientData.loading && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                  <IngredientIcon
                    className={`h-6 w-6 mb-2 ${
                      isSelected ? "" : "text-gray-400"
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {ingredientConf.name}
                  </span>
                  {ingredientData.error && (
                    <AlertTriangle className="h-3 w-3 text-red-500 mt-1" />
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`bg-gradient-to-br ${config.gradient} rounded-xl border ${config.borderColor} overflow-hidden`}
      >
        {/* Content Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`${config.bgColor} p-3 rounded-lg`}>
                <IconComponent className={`h-6 w-6 ${config.textColor}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {config.name} Price Forecast
                </h2>
                <p className="text-gray-500">
                  7-day price prediction using Prophet ML
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {currentData.lastUpdated && (
                <div className="text-sm text-gray-500 flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Updated: {currentData.lastUpdated}</span>
                </div>
              )}
              <button
                onClick={() => runPythonForecast(selectedIngredient)}
                disabled={currentData.loading}
                className={`
                  px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors
                  ${config.textColor
                    .replace("text-", "bg-")
                    .replace("-600", "-500")} 
                  hover:${config.textColor
                    .replace("text-", "bg-")
                    .replace("-600", "-600")} 
                  text-white
                `}
              >
                {currentData.loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {currentData.loading && !currentData.data ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Generating forecast...</p>
              </div>
            </div>
          ) : currentData.error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Forecast Error
                </h3>
                <p className="text-red-600 mb-4">{currentData.error}</p>
                <button
                  onClick={() => runPythonForecast(selectedIngredient)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : currentData.data ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Forecast Chart */}
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Price Trend
                </h3>
                <div className="relative h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <Image
                    src={`/${selectedIngredient}_price_forecast.png`}
                    alt={`${config.name} Price Forecast Chart`}
                    width={400}
                    height={250}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <div className="hidden text-center text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Chart not available</p>
                  </div>
                </div>
              </div>

              {/* Insights */}
              {currentData.insights && (
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Key Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Current Trend</span>
                      <span
                        className={`font-semibold capitalize ${
                          currentData.insights.trend === "increasing"
                            ? "text-red-600"
                            : currentData.insights.trend === "decreasing"
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {currentData.insights.trend}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Price Change</span>
                      <span
                        className={`font-semibold ${
                          currentData.insights.percentage_change > 0
                            ? "text-red-600"
                            : currentData.insights.percentage_change < 0
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {currentData.insights.percentage_change > 0 ? "+" : ""}
                        {currentData.insights.percentage_change.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Average Price</span>
                      <span className="font-semibold text-gray-900">
                        LKR {currentData.insights.average_price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Price Range</span>
                      <span className="font-semibold text-gray-900">
                        LKR {currentData.insights.lowest_price.toFixed(2)} -{" "}
                        {currentData.insights.highest_price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Forecast Data Table */}
              <div className="lg:col-span-2 bg-white rounded-lg p-4 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  7-Day Forecast
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-600">
                          Date
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          Predicted Price
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          Lower Bound
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          Upper Bound
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          Confidence
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.data.slice(0, 7).map((point, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-2 px-3 text-gray-900">
                            {new Date(point.ds).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-gray-900">
                            LKR {point.yhat.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-600">
                            LKR {point.yhat_lower.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-600">
                            LKR {point.yhat_upper.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
                            >
                              High
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Forecast Data
                </h3>
                <p className="text-gray-500 mb-4">
                  Click refresh to generate a forecast
                </p>
                <button
                  onClick={() => runPythonForecast(selectedIngredient)}
                  className={`
                    px-4 py-2 rounded-lg text-sm text-white transition-colors
                    ${config.textColor
                      .replace("text-", "bg-")
                      .replace("-600", "-500")} 
                    hover:${config.textColor
                      .replace("text-", "bg-")
                      .replace("-600", "-600")}
                  `}
                >
                  Generate Forecast
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
