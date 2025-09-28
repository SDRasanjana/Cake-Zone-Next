import React, { useEffect, useState } from "react";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  Target,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface OrderItem {
  name: string;
  price: number;
  quantity?: number;
  [key: string]: unknown;
}

interface Order {
  _id?: string;
  id?: string;
  userId: string;
  customerName?: string;
  items: OrderItem[];
  total: number;
  amount?: number;
  paymentStatus: string;
  status?: string;
  createdAt: string;
  orderDate?: string;
}

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  pendingOrders: number;
  completedOrders: number;
}

const ReportsTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("30d");

  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  const fetchReportsData = async () => {
    setLoading(true);
    setError("");

    try {
      const [ordersRes, usersRes] = await Promise.all([
        fetch("/api/orders?admin=true"),
        fetch("/api/auth/users"),
      ]);

      if (!ordersRes.ok || !usersRes.ok) {
        throw new Error(
          `Failed to fetch data: Orders(${ordersRes.status}), Users(${usersRes.status})`
        );
      }

      const ordersData = await ordersRes.json();
      const usersData = await usersRes.json();

      console.log("Orders data:", ordersData);
      console.log("Users data:", usersData);

      // Safely extract arrays with proper fallbacks
      const orders: Order[] = Array.isArray(ordersData?.orders)
        ? ordersData.orders
        : Array.isArray(ordersData)
        ? ordersData
        : [];

      const users: User[] =
        usersData?.success && Array.isArray(usersData?.data)
          ? usersData.data
          : Array.isArray(usersData)
          ? usersData
          : [];

      // Calculate main statistics with null safety
      const totalRevenue = Array.isArray(orders)
        ? orders.reduce(
            (sum, order) => sum + (order?.amount || order?.total || 0),
            0
          )
        : 0;

      const totalOrders = Array.isArray(orders) ? orders.length : 0;
      const totalCustomers = Array.isArray(users) ? users.length : 0;
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate growth (last 30 days vs previous 30 days) with null safety
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      const recentOrders = Array.isArray(orders)
        ? orders.filter((order) => {
            if (!order || (!order.createdAt && !order.orderDate)) return false;
            return (
              new Date(order.createdAt || order.orderDate || 0) >= thirtyDaysAgo
            );
          })
        : [];

      const previousOrders = Array.isArray(orders)
        ? orders.filter((order) => {
            if (!order || (!order.createdAt && !order.orderDate)) return false;
            const date = new Date(order.createdAt || order.orderDate || 0);
            return date >= sixtyDaysAgo && date < thirtyDaysAgo;
          })
        : [];

      const recentRevenue = Array.isArray(recentOrders)
        ? recentOrders.reduce(
            (sum, order) => sum + (order?.amount || order?.total || 0),
            0
          )
        : 0;

      const previousRevenue = Array.isArray(previousOrders)
        ? previousOrders.reduce(
            (sum, order) => sum + (order?.amount || order?.total || 0),
            0
          )
        : 0;

      const revenueGrowth =
        previousRevenue > 0
          ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
          : 0;
      const ordersGrowth =
        previousOrders.length > 0
          ? ((recentOrders.length - previousOrders.length) /
              previousOrders.length) *
            100
          : 0;

      // Calculate order status counts with null safety
      const pendingOrders = Array.isArray(orders)
        ? orders.filter(
            (order) =>
              order &&
              (order.paymentStatus || order.status || "").toLowerCase() ===
                "pending"
          ).length
        : 0;

      const completedOrders = Array.isArray(orders)
        ? orders.filter(
            (order) =>
              order &&
              (order.paymentStatus || order.status || "").toLowerCase() ===
                "completed"
          ).length
        : 0;

      setStats({
        totalRevenue,
        totalOrders,
        totalCustomers,
        averageOrderValue,
        revenueGrowth,
        ordersGrowth,
        pendingOrders,
        completedOrders,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const handleExportReport = async () => {
    try {
      // Generate CSV content
      const csvContent = [
        ["Admin Reports & Analytics"],
        ["Date Range", dateRange],
        ["Generated", new Date().toLocaleString()],
        [""],
        ["Metric", "Value"],
        ["Total Revenue", `Rs. ${stats.totalRevenue.toLocaleString()}`],
        ["Total Orders", stats.totalOrders.toString()],
        ["Total Customers", stats.totalCustomers.toString()],
        [
          "Average Order Value",
          `Rs. ${Math.round(stats.averageOrderValue).toLocaleString()}`,
        ],
        ["Revenue Growth", `${stats.revenueGrowth.toFixed(1)}%`],
        ["Orders Growth", `${stats.ordersGrowth.toFixed(1)}%`],
        ["Pending Orders", stats.pendingOrders.toString()],
        ["Completed Orders", stats.completedOrders.toString()],
      ]
        .map((row) => row.join(","))
        .join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `admin-reports-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#F4C753] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color = "blue",
  }: {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
  }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
      indigo: "from-indigo-500 to-indigo-600",
      red: "from-red-500 to-red-600",
    };

    return (
      <div
        className={`bg-gradient-to-br ${
          colorClasses[color as keyof typeof colorClasses]
        } rounded-xl p-6 text-white shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-2">
                {change >= 0 ? (
                  <ArrowUp className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 mr-1" />
                )}
                <span className="text-sm">
                  {Math.abs(change).toFixed(1)}% vs last month
                </span>
              </div>
            )}
          </div>
          <Icon className="w-8 h-8 text-white/70" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Admin Reports & Analytics
          </h2>
          <p className="text-gray-600 mt-1">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#F4C753] focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={fetchReportsData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-gradient-to-r from-[#F4C753] to-[#F59E0B] text-[#141C24] rounded-lg text-sm font-medium hover:from-[#F59E0B] hover:to-[#F4C753] transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Main Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueGrowth}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          change={stats.ordersGrowth}
          icon={ShoppingCart}
          color="green"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Average Order Value"
          value={`Rs. ${Math.round(stats.averageOrderValue).toLocaleString()}`}
          icon={Target}
          color="orange"
        />
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders.toLocaleString()}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Completed Orders"
          value={stats.completedOrders.toLocaleString()}
          icon={Package}
          color="green"
        />
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-[#F4C753] to-[#F59E0B] rounded-xl p-6 text-[#141C24]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">
              Business Performance Summary
            </h3>
            <p className="text-[#141C24]/80">
              {stats.revenueGrowth >= 0 ? "📈 Growing" : "📉 Declining"} • Total
              Revenue: Rs. {stats.totalRevenue.toLocaleString()} •
              {stats.totalOrders} Orders •{stats.totalCustomers} Customers
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {stats.revenueGrowth >= 0 ? "+" : ""}
              {stats.revenueGrowth.toFixed(1)}%
            </div>
            <div className="text-sm text-[#141C24]/80">Revenue Growth</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
