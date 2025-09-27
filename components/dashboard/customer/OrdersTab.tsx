/* eslint-disable @next/next/no-img-element */
// Note: We use <img> tags for 3D cake snapshots (base64 data URIs)

import React from "react";
import { DashboardTab } from "@/contexts/DashboardTabContext";
import { useUser } from "@clerk/nextjs";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  usePriceForecast,
  useMultiplePriceForecasts,
} from "@/hooks/usePriceForecast";

// Helper functions to format IDs for better readability
const formatOrderId = (id: string): string => {
  if (!id) return "CZO001";
  // Create a more predictable numeric ID based on the original ID
  // Use the last few characters and convert to a number
  const lastPart = id.slice(-8); // Take last 8 characters
  let numericValue = 0;

  // Convert characters to numbers (letters become numbers too)
  for (let i = 0; i < lastPart.length; i++) {
    const char = lastPart[i];
    if (char >= "0" && char <= "9") {
      numericValue = numericValue * 10 + parseInt(char);
    } else {
      // Convert letters to numbers (a=1, b=2, etc.)
      numericValue =
        numericValue * 10 + (char.toLowerCase().charCodeAt(0) - 96);
    }
  }

  // Ensure we get a 3-digit number between 001-999
  const finalId = (Math.abs(numericValue) % 999) + 1;
  return `CZO${finalId.toString().padStart(3, "0")}`;
};

interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  imageUri?: string;
  isCustom?: boolean;
  flavor?: string;
  layers?: number;
  toppings?: string[];
  frostingColor?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status?: string;
  paymentStatus?: string;
  createdAt: string;
  deliveryDate?: string;
  shipping?: {
    address?: string;
  };
}

const OrdersTab: React.FC<{
  setActiveTab?: (tab: DashboardTab) => void;
}> = () => {
  // Fetch real orders for the logged-in user
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [refreshing, setRefreshing] = React.useState(false);
  const [showPriceForecast, setShowPriceForecast] = React.useState(false);
  const { user } = useUser(); // Use useUser only inside the component

  // Price forecasting for common cake ingredients
  const commonIngredients = ["butter", "flour", "sugar", "eggs", "milk"];
  const {
    forecasts: ingredientForecasts,
    loading: forecastLoading,
    errors: forecastErrors,
    refetch: refetchForecasts,
  } = useMultiplePriceForecasts(commonIngredients, {
    days: 7,
    autoFetch: false,
  });

  // Single ingredient forecast for detailed view
  const [selectedIngredient, setSelectedIngredient] = React.useState<
    string | null
  >(null);
  const { forecast: detailedForecast, loading: detailedLoading } =
    usePriceForecast(selectedIngredient || "", {
      days: 14,
      autoFetch: !!selectedIngredient,
    });

  // Function to fetch orders
  const fetchOrders = React.useCallback(
    async (isManualRefresh = false) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      console.log("Customer Orders: Fetching orders for user:", user.id);
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      try {
        const res = await fetch(
          `/api/orders?userId=${user.id}&_t=${Date.now()}` // Add timestamp to prevent caching
        );
        console.log("Customer Orders: API response status:", res.status);
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        console.log("Customer Orders: API response data:", data);
        setOrders(data.orders || []);
        setError("");
      } catch (err) {
        console.error("Customer Orders: Error fetching orders:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
        setOrders([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Add visibility change listener to refresh data when user returns to the page
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        console.log("Customer Orders: Page became visible, refreshing data...");
        fetchOrders();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchOrders, user?.id]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchOrders(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">My Orders</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-700 font-medium text-sm border border-blue-200 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50"
          title="Refresh orders"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center text-gray-500 py-8">
          Loading your orders...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">Error: {error}</p>
          <p className="text-red-500 text-xs mt-1">
            Debug: User ID = {user?.id || "No user"}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {!loading && orders.length === 0 && !error ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No orders found</p>
            <p className="text-xs text-gray-400">
              Debug: User ID = {user?.id || "No user"}, Orders = {orders.length}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id?.toString()}
              className="border border-gray-200 rounded-lg p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div className="flex items-center mb-4 sm:mb-0">
                  {/* Show all cakes in the order, not just the first */}
                  <div className="flex flex-wrap gap-2 mr-4">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item: OrderItem, idx: number) => (
                        <div
                          key={item.id || idx}
                          className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl"
                        >
                          {item.imageUri ? (
                            <img
                              src={item.imageUri}
                              alt={item.name}
                              className="w-14 h-14 rounded object-cover"
                              onError={(e) => {
                                // Fallback to cake emoji if image fails to load
                                e.currentTarget.style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.innerHTML = "🎂";
                                  parent.className =
                                    "w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl";
                                }
                              }}
                            />
                          ) : (
                            "🎂"
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                        🎂
                      </div>
                    )}
                  </div>
                  <div>
                    {/* List all cake names in the order */}
                    <h4 className="font-semibold text-gray-800">
                      {order.items && order.items.length > 0
                        ? order.items
                            .map((item: OrderItem) => item.name)
                            .join(", ")
                        : "Cake Order"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Order {formatOrderId(order._id?.toString() || "N/A")}
                    </p>
                    <p className="text-sm text-gray-500">
                      Ordered on{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "-"}
                    </p>
                    {/* Show delivery date if available */}
                    {order.deliveryDate && (
                      <p className="text-sm text-pink-600 font-semibold">
                        Delivery:{" "}
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">
                    Rs. {order.total}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      order.paymentStatus === "paid" ||
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "pending" ||
                          order.status === "processing"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.paymentStatus || order.status || "pending"}
                  </span>
                </div>
              </div>
              {/* List all cakes in the order with details */}
              <div className="flex flex-wrap gap-2 mt-2">
                {order.items &&
                  order.items.length > 0 &&
                  order.items.map((item: OrderItem, idx: number) => (
                    <div
                      key={item.id || idx}
                      className="border rounded p-2 bg-gray-50 text-xs"
                    >
                      <div className="font-semibold text-black">
                        {item.name}
                      </div>
                      <div className="text-black">
                        Type: {item.isCustom ? "Custom" : "Predefined"}
                      </div>
                      <div className="text-black">Qty: {item.quantity}</div>
                      <div className="text-black">Price: Rs. {item.price}</div>
                      {/* Show custom fields if present */}
                      {item.isCustom && (
                        <div>
                          <div className="text-black">
                            Flavor: {item.flavor}
                          </div>
                          <div className="text-black">
                            Layers: {item.layers}
                          </div>
                          <div className="text-black">
                            Toppings: {item.toppings?.join(", ")}
                          </div>
                          <div className="text-black">
                            Frosting: {item.frostingColor}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Price Forecasting Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Ingredient Price Forecast
            </h3>
            <p className="text-sm text-gray-600">
              Monitor price trends for better cake cost planning
            </p>
          </div>
          <button
            onClick={() => {
              setShowPriceForecast(!showPriceForecast);
              if (
                !showPriceForecast &&
                ingredientForecasts &&
                Object.keys(ingredientForecasts).length === 0
              ) {
                refetchForecasts();
              }
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              showPriceForecast
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-white border border-blue-200 text-blue-600 hover:bg-blue-50"
            }`}
          >
            {showPriceForecast ? "Hide Forecast" : "Show Forecast"}
          </button>
        </div>

        {showPriceForecast && (
          <div className="space-y-6">
            {/* Loading State */}
            {forecastLoading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-600">
                  Forecasting ingredient prices...
                </p>
              </div>
            )}

            {/* Error State */}
            {Object.keys(forecastErrors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">
                  Forecast Errors:
                </h4>
                {Object.entries(forecastErrors).map(([ingredient, error]) => (
                  <p key={ingredient} className="text-red-600 text-sm">
                    {ingredient}: {error}
                  </p>
                ))}
              </div>
            )}

            {/* Forecast Grid */}
            {!forecastLoading &&
              Object.keys(ingredientForecasts).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(ingredientForecasts).map(
                    ([ingredient, forecast]) => (
                      <div
                        key={ingredient}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-800 capitalize">
                            {ingredient}
                          </h4>
                          <button
                            onClick={() => setSelectedIngredient(ingredient)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Details
                          </button>
                        </div>

                        <div className="space-y-2">
                          {/* Current vs Predicted Price */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Current:
                            </span>
                            <span className="font-medium">
                              Rs.{" "}
                              {forecast.forecast_data[0]?.predicted_price ||
                                "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              7-day avg:
                            </span>
                            <span className="font-medium">
                              Rs. {forecast.insights.average_price.toFixed(2)}
                            </span>
                          </div>

                          {/* Trend Indicator */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Trend:
                            </span>
                            <div className="flex items-center gap-1">
                              {forecast.insights.trend === "increasing" && (
                                <>
                                  <TrendingUp className="w-4 h-4 text-red-500" />
                                  <span className="text-red-600 font-medium">
                                    +
                                    {forecast.insights.price_change_percentage.toFixed(
                                      1
                                    )}
                                    %
                                  </span>
                                </>
                              )}
                              {forecast.insights.trend === "decreasing" && (
                                <>
                                  <TrendingDown className="w-4 h-4 text-green-500" />
                                  <span className="text-green-600 font-medium">
                                    {forecast.insights.price_change_percentage.toFixed(
                                      1
                                    )}
                                    %
                                  </span>
                                </>
                              )}
                              {forecast.insights.trend === "stable" && (
                                <>
                                  <Minus className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600 font-medium">
                                    Stable
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Volatility Warning */}
                          {forecast.insights.price_volatility > 10 && (
                            <div className="flex items-center gap-1 text-orange-600 text-sm">
                              <AlertTriangle className="w-3 h-3" />
                              <span>High volatility</span>
                            </div>
                          )}

                          {/* Recommendation */}
                          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                            <div className="flex items-start gap-1">
                              <Clock className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">
                                {forecast.insights.recommendation}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

            {/* Detailed Forecast Modal/Section */}
            {selectedIngredient && detailedForecast && (
              <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 capitalize">
                    {selectedIngredient} - 14-Day Detailed Forecast
                  </h4>
                  <button
                    onClick={() => setSelectedIngredient(null)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ✕ Close
                  </button>
                </div>

                {detailedLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-gray-600">
                      Loading detailed forecast...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Price Chart Data */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Average</div>
                        <div className="text-lg font-semibold">
                          Rs.{" "}
                          {detailedForecast.insights.average_price.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Highest</div>
                        <div className="text-lg font-semibold text-red-600">
                          Rs.{" "}
                          {detailedForecast.insights.highest_price.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Lowest</div>
                        <div className="text-lg font-semibold text-green-600">
                          Rs.{" "}
                          {detailedForecast.insights.lowest_price.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Confidence</div>
                        <div
                          className={`text-lg font-semibold ${
                            detailedForecast.insights.confidence_level ===
                            "high"
                              ? "text-green-600"
                              : detailedForecast.insights.confidence_level ===
                                "medium"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {detailedForecast.insights.confidence_level.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Daily Forecasts */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left p-2">Date</th>
                            <th className="text-right p-2">Price</th>
                            <th className="text-right p-2">Range</th>
                            <th className="text-center p-2">Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailedForecast.forecast_data
                            .slice(0, 7)
                            .map((day, idx) => {
                              const prevPrice =
                                idx > 0
                                  ? detailedForecast.forecast_data[idx - 1]
                                      .predicted_price
                                  : day.predicted_price;
                              const change = day.predicted_price - prevPrice;
                              const changePercent =
                                idx > 0 ? (change / prevPrice) * 100 : 0;

                              return (
                                <tr
                                  key={day.date}
                                  className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                  <td className="p-2">
                                    {new Date(day.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                  </td>
                                  <td className="text-right p-2 font-medium">
                                    Rs. {day.predicted_price.toFixed(2)}
                                  </td>
                                  <td className="text-right p-2 text-gray-600">
                                    {day.confidence_interval}
                                  </td>
                                  <td className="text-center p-2">
                                    {idx > 0 && (
                                      <span
                                        className={`inline-flex items-center gap-1 ${
                                          change > 0
                                            ? "text-red-600"
                                            : change < 0
                                            ? "text-green-600"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {change > 0 && (
                                          <TrendingUp className="w-3 h-3" />
                                        )}
                                        {change < 0 && (
                                          <TrendingDown className="w-3 h-3" />
                                        )}
                                        {change === 0 && (
                                          <Minus className="w-3 h-3" />
                                        )}
                                        {changePercent.toFixed(1)}%
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>

                    {/* Recommendation */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-blue-800 mb-1">
                            Recommendation
                          </div>
                          <div className="text-blue-700 text-sm">
                            {detailedForecast.insights.recommendation}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersTab;
