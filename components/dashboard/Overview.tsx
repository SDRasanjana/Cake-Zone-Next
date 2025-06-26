import Chart from "@/components/Chart";
import { TrendingUp, DollarSign, ShoppingBag, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export default function Overview() {
  // State for dashboard data
  const [orderData, setOrderData] = useState({
    totalOrderCount: 0,
    totalOrderValue: 0,
    currentMonth: {
      orderCount: 0,
      orderValue: 0,
      name: "",
    },
    previousMonth: {
      orderCount: 0,
      orderValue: 0,
      name: "",
    },
    percentageChanges: {
      orderValue: 0,
      orderCount: 0,
    },
    source: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Current date for dashboard
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  // Fetch order stats
  const fetchOrderStats = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching order stats from API...");

      const response = await fetch("/api/orders/stats");
      console.log("API response status:", response.status);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received order data:", data);

      // Validate the data to ensure we're getting what we expect
      if (data && typeof data === "object") {
        if (
          data.source === "sample" ||
          data.source === "fallback" ||
          data.source === "error_fallback"
        ) {
          console.warn(
            "⚠️ Using sample/fallback data instead of real database data!"
          );
          setError(
            "Warning: Using sample data. Check database connection or add real order data."
          );
        } else {
          console.log(
            "✅ Using real database data from cakezone.orders collection"
          );
          setError(null);
        }

        setOrderData(data);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (err) {
      console.error("Failed to fetch order stats:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchOrderStats();

    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(fetchOrderStats, 5 * 60 * 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  return (
    <div className="space-y-6 p-2">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-lg border border-orange-100">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Welcome to your Dashboard
            </h1>
            <div className="flex items-center">
              <p className="text-gray-500 text-sm">{formattedDate}</p>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="ml-3 text-xs text-gray-400 hover:text-gray-600 underline"
              >
                {showDebug ? "Hide Debug" : "Debug"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 px-3 py-2 rounded-md text-red-600 text-sm border border-red-100 flex items-center">
              <span>{error}</span>
              <button
                onClick={fetchOrderStats}
                className="ml-2 bg-red-100 hover:bg-red-200 p-1 rounded-full"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>{" "}
        {showDebug && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600 border border-gray-200">
            <div className="mb-1">
              Data source: {orderData.source || "unknown"}
            </div>
            <div className="mb-1">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <div className="mb-1">
              Raw values: Total Sales={orderData.totalOrderValue}, Total Orders=
              {orderData.totalOrderCount}
            </div>
            <div className="mb-1">
              Current month: {orderData.currentMonth?.name || "N/A"} - Sales=
              {orderData.currentMonth?.orderValue || 0}, Orders=
              {orderData.currentMonth?.orderCount || 0}
            </div>
            <div className="mb-1">
              Previous month: {orderData.previousMonth?.name || "N/A"} - Sales=
              {orderData.previousMonth?.orderValue || 0}, Orders=
              {orderData.previousMonth?.orderCount || 0}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => console.log("Full response data:", orderData)}
                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
              >
                Log Full Data
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/orders/seed-test");
                    const data = await res.json();
                    console.log("Test data response:", data);
                    if (data.success) {
                      alert(
                        `Test data ${data.message}. ${
                          data.addedCount
                            ? "Added " + data.addedCount + " orders."
                            : ""
                        }`
                      );
                      fetchOrderStats(); // Refresh data after seeding
                    }
                  } catch (err) {
                    console.error("Failed to seed test data:", err);
                  }
                }}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
              >
                Add Test Data
              </button>
            </div>
          </div>
        )}
      </div>{" "}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Sales Card */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-700">
                  Total Sales
                </h2>
              </div>
              {isLoading ? (
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mt-2"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    Rs. {orderData.currentMonth.orderValue.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-1">
                    <span
                      className={`text-sm font-medium ${
                        orderData.percentageChanges.orderValue >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {orderData.percentageChanges.orderValue >= 0 ? "+" : ""}
                      {orderData.percentageChanges.orderValue.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      vs last month
                    </span>
                  </div>
                </>
              )}
            </div>{" "}
            <div className="hidden md:flex h-16 w-16 bg-green-50 rounded-full items-center justify-center">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 text-green-600 animate-spin" />
                ) : (
                  <span
                    className={`${
                      orderData.percentageChanges.orderValue >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    } font-bold`}
                  >
                    {orderData.percentageChanges.orderValue >= 0 ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-700">
                  Total Orders
                </h2>
              </div>
              {isLoading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-2"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {orderData.currentMonth.orderCount}
                  </p>
                  <div className="flex items-center mt-1">
                    <span
                      className={`text-sm font-medium ${
                        orderData.percentageChanges.orderCount >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {orderData.percentageChanges.orderCount >= 0 ? "+" : ""}
                      {orderData.percentageChanges.orderCount.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      vs last month
                    </span>
                  </div>
                </>
              )}
            </div>{" "}
            <div className="hidden md:flex h-16 w-16 bg-blue-50 rounded-full items-center justify-center">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                ) : (
                  <span className="text-blue-600 font-bold">
                    {orderData.currentMonth.orderCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* All-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* All-time Sales Card */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-700">
                  All-time Sales
                </h2>
              </div>
              {isLoading ? (
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mt-2"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    Rs. {orderData.totalOrderValue.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">
                      Total sales since shop opened
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="hidden md:flex h-16 w-16 bg-purple-50 rounded-full items-center justify-center">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 text-purple-600 animate-spin" />
                ) : (
                  <span className="text-purple-600 font-bold">₹</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* All-time Orders Card */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-gray-700">
                  All-time Orders
                </h2>
              </div>
              {isLoading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-2"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {orderData.totalOrderCount}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">
                      Total orders completed
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="hidden md:flex h-16 w-16 bg-indigo-50 rounded-full items-center justify-center">
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 text-indigo-600 animate-spin" />
                ) : (
                  <span className="text-indigo-600 font-bold">
                    {orderData.totalOrderCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Chart Section */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="bg-orange-100 p-1.5 rounded-md">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-700">
                Sales Overview
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-9">
              Revenue trends over time
            </p>{" "}
          </div>{" "}
          <div className="flex space-x-2">
            <button
              onClick={fetchOrderStats}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs px-2 py-1.5 rounded-md flex items-center"
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-md shadow-sm">
              This Month
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Week 1", value: "Rs. 9,250", change: "+5.2%" },
            { label: "Week 2", value: "Rs. 10,800", change: "+12.3%" },
            { label: "Week 3", value: "Rs. 11,500", change: "+6.5%" },
            { label: "Week 4", value: "Rs. 13,450", change: "+16.2%" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-lg p-2 border border-gray-100"
            >
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-sm font-medium text-gray-800">{stat.value}</p>
              <p className="text-xs text-green-600">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Chart with custom styling */}
        <div className="bg-gradient-to-b from-orange-50/30 to-transparent p-4 rounded-lg border border-gray-100">
          <Chart />
        </div>

        {/* Legend */}
        <div className="flex justify-center mt-3 pt-2 border-t border-gray-100">
          <div className="flex space-x-6 text-xs text-gray-500">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-orange-500 mr-1.5"></div>
              <span>Revenue</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
              <span>Highest: June 24 (Rs. 6,250)</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-blue-500 mr-1.5"></div>
              <span>Avg: Rs. 4,350/day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
