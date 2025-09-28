import React, { useEffect, useState } from "react";
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  Clock,
  Award,
} from "lucide-react";

interface OrderItem {
  name?: string;
  price?: number;
  quantity?: number;
  [key: string]: unknown;
}

interface Order {
  _id: string;
  id?: string;
  userId: string;
  customerName?: string;
  items: OrderItem[];
  shipping: Record<string, unknown>;
  total: number;
  amount?: number;
  deliveryDate: string;
  paymentStatus: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  orderDate?: string;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  todayOrders: number;
  monthlyGrowth: number;
}

interface OverviewTabProps {
  onTabChange?: (tabId: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ onTabChange }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayOrders: 0,
    monthlyGrowth: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch orders data
        const ordersRes = await fetch("/api/orders?admin=true");
        if (!ordersRes.ok) throw new Error("Failed to fetch orders data");
        const ordersData = await ordersRes.json();

        // Fetch users data
        const usersRes = await fetch("/api/auth/users");
        const usersData = await usersRes.json();

        const allOrders = ordersData.orders || [];
        const allUsers = usersData.success ? usersData.data : [];

        // Calculate statistics
        const totalRevenue = allOrders.reduce(
          (sum: number, order: Order) =>
            sum + (order.amount || order.total || 0),
          0
        );

        const pendingOrders = allOrders.filter(
          (order: Order) =>
            (order.paymentStatus || order.status || "").toLowerCase() ===
            "pending"
        ).length;

        const completedOrders = allOrders.filter(
          (order: Order) =>
            (order.paymentStatus || order.status || "").toLowerCase() ===
            "completed"
        ).length;

        // Calculate today's orders
        const today = new Date().toDateString();
        const todayOrders = allOrders.filter((order: Order) => {
          const orderDate = new Date(order.createdAt || order.orderDate || 0);
          return orderDate.toDateString() === today;
        }).length;

        // Calculate monthly growth (placeholder - you can implement actual logic)
        const monthlyGrowth = Math.floor(Math.random() * 20) + 5; // Random 5-25% for demo

        // Active users are users who have placed at least one order
        const activeUserIds = [
          ...new Set(allOrders.map((order: Order) => order.userId)),
        ];

        setStats({
          totalUsers: allUsers.length,
          activeUsers: activeUserIds.length,
          totalOrders: allOrders.length,
          totalRevenue,
          pendingOrders,
          completedOrders,
          todayOrders,
          monthlyGrowth,
        });

        setOrders(allOrders);
        setError("");
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#F4C753] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h2>
          <p className="text-gray-600 mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your cake shop
            today.
          </p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-[#F4C753] to-[#F59E0B] text-[#141C24] rounded-lg text-sm font-medium hover:from-[#F59E0B] hover:to-[#F4C753] transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold mt-1">
                {stats.totalUsers.toLocaleString()}
              </p>
              <p className="text-blue-100 text-xs mt-2">Registered customers</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Total Revenue
              </p>
              <p className="text-3xl font-bold mt-1">
                Rs. {stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-green-100 text-xs mt-2">All time earnings</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-lg p-3">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Total Orders
              </p>
              <p className="text-3xl font-bold mt-1">
                {stats.totalOrders.toLocaleString()}
              </p>
              <p className="text-purple-100 text-xs mt-2">Lifetime orders</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-lg p-3">
              <ShoppingCart className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Monthly Growth */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">
                Monthly Growth
              </p>
              <p className="text-3xl font-bold mt-1">{stats.monthlyGrowth}%</p>
              <p className="text-orange-100 text-xs mt-2">vs last month</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-lg p-3">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Active Users */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeUsers}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Today&apos;s Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.todayOrders}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-lg p-3 mr-4">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendingOrders}
              </p>
            </div>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Completed Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedOrders}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-gray-600 text-sm mt-1">
            Latest customer orders and their status
          </p>
        </div>
        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order._id || order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#F4C753] bg-opacity-20 rounded-lg p-2">
                      <ShoppingCart className="w-5 h-5 text-[#F59E0B]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.customerName ||
                          `Order #${(order._id || order.id || "").slice(-6)}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.items && order.items.length > 0
                          ? order.items
                              .map(
                                (item: OrderItem) => item.name || "Unnamed Cake"
                              )
                              .join(", ")
                          : "No items"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(
                          order.createdAt || order.orderDate || Date.now()
                        ).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(
                          order.createdAt || order.orderDate || Date.now()
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">
                      Rs. {(order.total || order.amount || 0).toLocaleString()}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.paymentStatus || order.status || "pending"
                      )}`}
                    >
                      {(order.paymentStatus || order.status || "pending")
                        .charAt(0)
                        .toUpperCase() +
                        (
                          order.paymentStatus ||
                          order.status ||
                          "pending"
                        ).slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onTabChange?.("users")}
            className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-150 border border-blue-200"
          >
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-700 font-medium">Manage Users</span>
          </button>
          <button
            onClick={() => onTabChange?.("orders")}
            className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-150 border border-green-200"
          >
            <ShoppingCart className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700 font-medium">View Orders</span>
          </button>
          <button
            onClick={() => onTabChange?.("products")}
            className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-150 border border-purple-200"
          >
            <Package className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-purple-700 font-medium">Add Product</span>
          </button>
          <button
            onClick={() => onTabChange?.("reports")}
            className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-150 border border-orange-200"
          >
            <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-700 font-medium">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
