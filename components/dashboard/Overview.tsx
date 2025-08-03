"use client";
import { useState, useEffect, useCallback } from "react";
import Chart from "@/components/Chart";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  Activity,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
} from "lucide-react";

interface DashboardStats {
  period?: string;
  totalSales: number;
  salesChange: number;
  totalOrders: number;
  orderChange: number;
  weeklyData: Array<{
    name: string;
    sales: number;
    orders: number;
    change: string;
  }>;
  avgDailySales: number;
  highestSalesDay: {
    day: string;
    amount: number;
  };
  recentActivity: Array<{
    id: string;
    customerName: string;
    amount: number;
    status: string;
    time: string;
  }>;
}

export default function Overview() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"current" | "last">(
    "current"
  );

  // Current date for dashboard
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fetchDashboardData = useCallback(
    async (period: "current" | "last" = selectedPeriod) => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/stats?period=${period}`);
        const result = await response.json();

        if (result.success) {
          setDashboardData(result.data);
          setError(null);
        } else {
          setDashboardData(result.data); // Use fallback data
          setError("Using cached data - Database connection issue");
        }
      } catch {
        setError("Failed to fetch dashboard data");
        // Set fallback data
        setDashboardData({
          period,
          totalSales: period === "last" ? 38000 : 45000,
          salesChange: period === "last" ? 8.3 : 12.5,
          totalOrders: period === "last" ? 23 : 28,
          orderChange: period === "last" ? 5.1 : 8.2,
          weeklyData:
            period === "last"
              ? [
                  { name: "Week 1", sales: 7800, orders: 5, change: "+3.2%" },
                  { name: "Week 2", sales: 9200, orders: 6, change: "+8.1%" },
                  { name: "Week 3", sales: 10100, orders: 7, change: "+9.8%" },
                  { name: "Week 4", sales: 10900, orders: 5, change: "+7.9%" },
                ]
              : [
                  { name: "Week 1", sales: 9250, orders: 7, change: "+5.2%" },
                  { name: "Week 2", sales: 10800, orders: 8, change: "+12.3%" },
                  { name: "Week 3", sales: 11500, orders: 6, change: "+6.5%" },
                  { name: "Week 4", sales: 13450, orders: 7, change: "+16.2%" },
                ],
          avgDailySales: period === "last" ? 3800 : 4350,
          highestSalesDay: {
            day: period === "last" ? "May 28" : "June 24",
            amount: period === "last" ? 5200 : 6250,
          },
          recentActivity: [],
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedPeriod]
  );

  const handlePeriodChange = (period: "current" | "last") => {
    setSelectedPeriod(period);
    fetchDashboardData(period);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="space-y-6 p-2 max-w-7xl mx-auto">
        {/* Loading Header */}
        <div className="bg-gradient-to-br from-gray-200 to-gray-300 p-6 rounded-xl animate-pulse">
          <div className="h-8 bg-gray-400 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-400 rounded w-1/3"></div>
        </div>

        {/* Loading Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl border animate-pulse"
            >
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Loading Chart */}
        <div className="bg-white p-6 rounded-xl border animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 p-4 rounded-xl">
                <div className="h-3 bg-gray-300 rounded w-12 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-10"></div>
              </div>
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 max-w-7xl mx-auto">
      {/* Enhanced Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-pink-600 p-6 rounded-xl text-white shadow-lg">
        <div className="absolute top-0 right-0 opacity-20">
          <Sparkles className="h-32 w-32 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome to CakeZone Dashboard
                <span className="text-sm font-normal ml-3 px-2 py-1 bg-white bg-opacity-20 rounded-full">
                  {selectedPeriod === "current"
                    ? "Current Month"
                    : "Last Month"}
                </span>
              </h1>
              <div className="flex items-center space-x-2 text-orange-100">
                <Calendar className="h-4 w-4" />
                <p className="text-sm md:text-base">{formattedDate}</p>
              </div>
              {error && (
                <div className="mt-2 px-3 py-1 bg-yellow-500 bg-opacity-20 rounded-full">
                  <p className="text-xs text-yellow-100">{error}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => fetchDashboardData(selectedPeriod)}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
              title="Refresh Data"
            >
              <RefreshCcw
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="h-16 w-16 text-green-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-700">Total Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-2">
              Rs. {dashboardData?.totalSales.toLocaleString()}
            </p>
            <div className="flex items-center">
              {(dashboardData?.salesChange || 0) >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  (dashboardData?.salesChange || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {(dashboardData?.salesChange || 0) >= 0 ? "+" : ""}
                {dashboardData?.salesChange || 0}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShoppingBag className="h-16 w-16 text-blue-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-700">Total Orders</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-2">
              {dashboardData?.totalOrders}
            </p>
            <div className="flex items-center">
              {(dashboardData?.orderChange || 0) >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  (dashboardData?.orderChange || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {(dashboardData?.orderChange || 0) >= 0 ? "+" : ""}
                {dashboardData?.orderChange || 0}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
        </div>

        {/* Average Daily Sales Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="h-16 w-16 text-purple-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-700">Daily Average</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-2">
              Rs. {dashboardData?.avgDailySales?.toLocaleString() || "0"}
            </p>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">per day</span>
            </div>
          </div>
        </div>

        {/* Highest Sales Day Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border border-yellow-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="h-16 w-16 text-yellow-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-700">Best Day</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-2">
              Rs.{" "}
              {dashboardData?.highestSalesDay?.amount?.toLocaleString() || "0"}
            </p>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">
                {dashboardData?.highestSalesDay?.day || "No data"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Revenue Analytics
                </h2>
                <p className="text-sm text-gray-500">
                  Weekly performance overview
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePeriodChange("current")}
              className={`text-sm px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ${
                selectedPeriod === "current"
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => handlePeriodChange("last")}
              className={`text-sm px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ${
                selectedPeriod === "last"
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Last Month
            </button>
          </div>
        </div>

        {/* Weekly Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {dashboardData?.weeklyData?.map((week, index) => (
            <div
              key={`week-${index}`}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {week.name}
              </p>
              <p className="text-lg font-bold text-gray-800 mt-1">
                Rs. {week.sales.toLocaleString()}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-green-600 font-medium">
                  {week.change}
                </p>
                <p className="text-xs text-gray-500">{week.orders} orders</p>
              </div>
            </div>
          )) || []}
        </div>

        {/* Enhanced Chart */}
        <div className="bg-gradient-to-br from-orange-50/30 to-pink-50/30 p-6 rounded-xl border border-orange-100">
          <Chart data={dashboardData?.weeklyData} height={350} />
        </div>

        {/* Enhanced Legend */}
        <div className="flex justify-center mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 mr-2"></div>
              <span>Revenue Trend</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span>
                Best: Rs.{" "}
                {dashboardData?.highestSalesDay?.amount?.toLocaleString() ||
                  "0"}
              </span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
              <span>
                Avg: Rs. {dashboardData?.avgDailySales?.toLocaleString() || "0"}
                /day
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      {dashboardData?.recentActivity &&
        dashboardData.recentActivity.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Recent Activity
                </h2>
                <p className="text-sm text-gray-500">
                  Latest orders and transactions
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {dashboardData.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {activity.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {activity.customerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Rs. {activity.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        activity.status === "paid" ||
                        activity.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : activity.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {activity.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.time).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
