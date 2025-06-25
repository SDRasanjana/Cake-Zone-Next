"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { TrendingUp, RefreshCw, AlertTriangle } from "lucide-react";

// Define TypeScript interfaces for the forecast data
interface ForecastDataPoint {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

export default function Forecast() {
  // Available ingredients to forecast with meta information
  const ingredientsInfo = {
    Flour: {
      icon: "🌾",
      description: "Essential for all baked goods",
      basePrice: "Rs. 250/kg",
    },
    Sugar: {
      icon: "🍬",
      description: "Sweetener for cakes and desserts",
      basePrice: "Rs. 180/kg",
    },
    Eggs: {
      icon: "🥚",
      description: "Provides structure and richness",
      basePrice: "Rs. 320/dozen",
    },
    Butter: {
      icon: "🧈",
      description: "Adds flavor and moisture",
      basePrice: "Rs. 450/kg",
    },
  };

  const availableIngredients = Object.keys(ingredientsInfo);

  interface InsightData {
    trend: string;
    percentage_change: number;
    highest_price: number;
    lowest_price: number;
    average_price: number;
    forecast_date: string;
  }

  const [selectedIngredient, setSelectedIngredient] = useState<string>("Flour");
  const [pythonForecastData, setPythonForecastData] = useState<
    ForecastDataPoint[] | null
  >(null);
  const [pythonForecastInsights, setPythonForecastInsights] =
    useState<InsightData | null>(null);
  const [pythonForecastLoading, setPythonForecastLoading] =
    useState<boolean>(false);
  const [pythonForecastError, setPythonForecastError] = useState<string | null>(
    null
  );
  const [forecastImageUrl, setForecastImageUrl] = useState<string>(
    "/flour_price_forecast.png"
  );
  const [lastUpdated, setLastUpdated] = useState<string>("");
  // Function to run Python forecast script via API for selected ingredient
  const runPythonForecast = useCallback(
    async (ingredient = selectedIngredient) => {
      setPythonForecastLoading(true);
      setPythonForecastError(null);

      try {
        const response = await fetch(
          `/api/forecast/run-python?ingredient=${ingredient}`
        );
        const data = await response.json();
        if (data.success) {
          // Check if forecastData exists and is an array before setting state
          if (data.forecastData && Array.isArray(data.forecastData)) {
            setPythonForecastData(data.forecastData);
            setForecastImageUrl(data.forecastImageUrl);
            setLastUpdated(new Date().toLocaleString());

            // Set insights if available
            if (data.insights) {
              setPythonForecastInsights(data.insights);
            }
          } else {
            setPythonForecastError("Received invalid forecast data format");
          }
        } else {
          setPythonForecastError(data.error || "Failed to generate forecast");
        }
      } catch (err) {
        setPythonForecastError(
          "Error running forecast: " +
            (err instanceof Error ? err.message : "Unknown error")
        );
      } finally {
        setPythonForecastLoading(false);
      }
    },
    [selectedIngredient]
  );
  // Load Python forecast data on initial component mount or when ingredient changes
  useEffect(() => {
    runPythonForecast(selectedIngredient);
    setLastUpdated(new Date().toLocaleString());
  }, [selectedIngredient, runPythonForecast]);

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Price Forecasting</h2>
        <div className="text-sm text-gray-500">
          {lastUpdated && `Last updated: ${lastUpdated}`}
        </div>
      </div>{" "}
      {/* Ingredient Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          Select Ingredient for Forecast
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {availableIngredients.map((ingredient) => (
            <div
              key={ingredient}
              onClick={() => setSelectedIngredient(ingredient)}
              className={`cursor-pointer p-4 rounded-lg border transition-all duration-200
                ${
                  selectedIngredient === ingredient
                    ? "border-orange-500 bg-orange-50 shadow-md scale-[1.02]"
                    : "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/30"
                }`}
            >
              <div className="flex items-center mb-2">
                <span
                  className="text-2xl mr-2"
                  role="img"
                  aria-label={ingredient}
                >
                  {
                    ingredientsInfo[ingredient as keyof typeof ingredientsInfo]
                      .icon
                  }
                </span>
                <h4 className="font-semibold text-gray-800">{ingredient}</h4>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {
                  ingredientsInfo[ingredient as keyof typeof ingredientsInfo]
                    .description
                }
              </p>
              <p className="text-xs text-gray-600 font-medium">
                Base price:{" "}
                {
                  ingredientsInfo[ingredient as keyof typeof ingredientsInfo]
                    .basePrice
                }
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center border-t border-gray-100 pt-3">
          <p className="text-sm text-gray-500">
            Selected:{" "}
            <span className="font-medium text-gray-800">
              {selectedIngredient}
            </span>
          </p>

          <button
            onClick={() => runPythonForecast(selectedIngredient)}
            disabled={pythonForecastLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm flex items-center space-x-1 transition-colors disabled:bg-gray-400"
          >
            {pythonForecastLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                <span>Update Forecast</span>
              </>
            )}
          </button>
        </div>
      </div>
      {/* Python-Generated Price Forecast */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-white p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-md mr-3">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedIngredient} Price Forecast
                </h2>
                <p className="text-sm text-gray-500">
                  Machine learning prediction for next 7 days
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {pythonForecastError ? (
            <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>{pythonForecastError}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Display the forecast image */}
              <div className="flex justify-center border border-gray-100 rounded-lg p-4 bg-gray-50">
                <Image
                  src={forecastImageUrl}
                  alt={`${selectedIngredient} Price Forecast`}
                  width={700}
                  height={400}
                  className="rounded-md shadow-sm"
                  priority
                />
              </div>

              {pythonForecastData && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold mb-2">Forecast Data</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Predicted Price (LKR)
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lower Bound
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Upper Bound
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {" "}
                        {pythonForecastData &&
                          pythonForecastData.slice(-7).map((day, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                              }
                            >
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {new Date(day.ds).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                                {Number(day.yhat).toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {Number(day.yhat_lower).toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {Number(day.yhat_upper).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                      Key Insights
                    </h3>{" "}
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {pythonForecastInsights ? (
                        <>
                          <li>
                            {selectedIngredient} prices show a{" "}
                            <span
                              className={
                                pythonForecastInsights.trend === "increasing"
                                  ? "text-red-600 font-medium"
                                  : "text-green-600 font-medium"
                              }
                            >
                              {pythonForecastInsights.trend === "increasing"
                                ? "rising"
                                : "declining"}
                            </span>{" "}
                            trend over the next week
                          </li>
                          <li>
                            Expected price change:{" "}
                            <span
                              className={
                                pythonForecastInsights.percentage_change > 0
                                  ? "text-red-600 font-medium"
                                  : "text-green-600 font-medium"
                              }
                            >
                              {pythonForecastInsights.percentage_change.toFixed(
                                2
                              )}
                              %
                            </span>
                          </li>
                          <li>
                            Average price: Rs.{" "}
                            {pythonForecastInsights.average_price.toFixed(2)}{" "}
                            per kg
                          </li>
                          <li>
                            Price range: Rs.{" "}
                            {pythonForecastInsights.lowest_price.toFixed(2)} to{" "}
                            {pythonForecastInsights.highest_price.toFixed(2)}
                          </li>{" "}
                          <li>
                            <span className="font-medium">
                              Recommended action:{" "}
                            </span>
                            {pythonForecastInsights.trend === "increasing"
                              ? "Consider bulk purchasing now before prices rise further"
                              : "Consider waiting for better prices before bulk purchasing"}
                          </li>
                          <li>
                            <span className="font-medium">Updated on: </span>
                            {pythonForecastInsights.forecast_date}
                          </li>
                          <li className="pt-2">
                            <span className="px-2 py-1 bg-orange-100 rounded text-xs font-medium text-orange-700">
                              {pythonForecastInsights.trend === "increasing"
                                ? "⚠️ May need to adjust cake prices if trend continues"
                                : "✓ Current cake pricing should remain competitive"}
                            </span>
                          </li>
                        </>
                      ) : pythonForecastData &&
                        pythonForecastData.length > 1 ? (
                        <>
                          <li>
                            {selectedIngredient} prices show a{" "}
                            {Number(
                              pythonForecastData[pythonForecastData.length - 1]
                                .yhat
                            ) > Number(pythonForecastData[0].yhat)
                              ? "rising"
                              : "declining"}{" "}
                            trend over the next week
                          </li>
                          <li>
                            Expected price change:{" "}
                            {(
                              ((Number(
                                pythonForecastData[
                                  pythonForecastData.length - 1
                                ].yhat
                              ) -
                                Number(pythonForecastData[0].yhat)) /
                                Number(pythonForecastData[0].yhat)) *
                              100
                            ).toFixed(2)}
                            %
                          </li>
                          <li>
                            Consider adjusting cake prices or checking
                            alternative suppliers if trend continues
                          </li>
                        </>
                      ) : (
                        <li>No forecast insights available</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">
          Additional Resources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors">
            <h4 className="text-sm font-medium text-gray-700">
              View Historical Price Data
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Access complete pricing history for all ingredients
            </p>
          </div>
          <div className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors">
            <h4 className="text-sm font-medium text-gray-700">
              Set Price Alerts
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Get notified when prices exceed thresholds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
