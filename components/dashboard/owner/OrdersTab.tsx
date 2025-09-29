"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Clock, CheckCircle, XCircle, Filter } from "lucide-react";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  cake: string;
  cakeSize: string;
  quantity: number;
  specialInstructions?: string;
  amount: number;
  orderDate: string | Date;
  deliveryDate: string | Date;
  deliveryAddress: string;
  paymentMethod?: string;
  paymentStatus: "paid" | "pending" | "failed";
  status: "pending" | "processing" | "completed" | "cancelled";
  urgentOrder?: boolean;
}

type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    textColor: string;
    borderColor: string;
    iconColor: string;
  }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-900",
    borderColor: "border-yellow-300",
    iconColor: "text-yellow-700",
  },
  processing: {
    label: "Processing",
    icon: Package,
    bgColor: "bg-blue-100",
    textColor: "text-blue-900",
    borderColor: "border-blue-300",
    iconColor: "text-blue-700",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    bgColor: "bg-green-100",
    textColor: "text-green-900",
    borderColor: "border-green-300",
    iconColor: "text-green-700",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    bgColor: "bg-red-100",
    textColor: "text-red-900",
    borderColor: "border-red-300",
    iconColor: "text-red-700",
  },
};

// Helper function to get status config with fallback
const getStatusConfig = (status: string) => {
  return (
    statusConfig[status as OrderStatus] || {
      label: "Unknown",
      icon: Package,
      bgColor: "bg-gray-100",
      textColor: "text-gray-900",
      borderColor: "border-gray-300",
      iconColor: "text-gray-700",
    }
  );
};

export default function OwnerOrdersTab() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch orders from database
  const fetchOrders = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/orders?admin=true");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data.orders || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please check your connection.");
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders based on active filter
  const filteredOrders = orders.filter((order) => {
    if (!order || !order.status) return false; // Safety check
    if (activeFilter === "all") return true;
    return order.status === activeFilter;
  });

  // Get order counts by status
  const orderCounts = {
    all: orders.length,
    pending: orders.filter((o) => o && o.status === "pending").length,
    processing: orders.filter((o) => o && o.status === "processing").length,
    completed: orders.filter((o) => o && o.status === "completed").length,
  };

  // Helper function to format date
  const formatDate = (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to format order ID with CZO prefix (same as admin dashboard)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 mb-4">
          <XCircle className="w-12 h-12" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error Loading Orders
        </h3>
        <p className="text-red-600 text-center mb-4">{error}</p>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Order Monitoring</h2>
          <p className="text-base text-gray-700 font-medium">
            Monitor customer orders and their status
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={refreshing}
          className={`px-6 py-3 rounded-lg text-base font-semibold transition-colors ${
            refreshing
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
          }`}
        >
          {refreshing ? "🔄 Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-lg border-2 border-gray-300 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-6 h-6 text-gray-700" />
          <span className="text-lg font-semibold text-gray-900">
            Filter by Status:
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { key: "all", label: "All Orders", count: orderCounts.all },
            { key: "pending", label: "Pending", count: orderCounts.pending },
            {
              key: "processing",
              label: "Processing",
              count: orderCounts.processing,
            },
            {
              key: "completed",
              label: "Completed",
              count: orderCounts.completed,
            },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-6 py-3 rounded-lg text-base font-semibold transition-all duration-200 shadow-sm ${
                activeFilter === filter.key
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-2 border-gray-300"
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-gray-300 shadow-sm">
            <Package className="w-16 h-16 text-gray-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No orders found
            </h3>
            <p className="text-lg text-gray-700">
              {activeFilter === "all"
                ? "No orders have been placed yet."
                : `No orders with status "${activeFilter}" found.`}
            </p>
          </div>
        ) : (
          filteredOrders
            .map((order) => {
              // Safety checks for order properties
              if (!order || !order.id) return null;

              const config = getStatusConfig(order.status);
              const IconComponent = config.icon;

              return (
                <div
                  key={order.id}
                  className={`border-2 rounded-lg transition-all duration-200 hover:shadow-md ${config.borderColor} ${config.bgColor}`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <IconComponent
                          className={`w-6 h-6 ${config.iconColor}`}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {formatOrderId(order.id)}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${config.textColor} ${config.bgColor} border ${config.borderColor}`}
                            >
                              {config.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-6 text-base">
                            <div>
                              <span className="text-gray-700 font-medium">
                                Date:{" "}
                              </span>
                              <span className="text-gray-900 font-semibold">
                                {formatDate(order.orderDate)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-700 font-medium">
                                Amount:{" "}
                              </span>
                              <span className="text-green-700 font-bold text-lg">
                                Rs. {order.amount || 0}.00
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
            .filter(Boolean) // Remove null values
        )}
      </div>

      {/* Summary Statistics */}
      {filteredOrders.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-gray-300 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <p className="text-gray-700 font-semibold text-lg">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {filteredOrders.length}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <p className="text-green-800 font-semibold text-lg">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-green-700 mt-2">
                Rs.{" "}
                {filteredOrders
                  .reduce((sum, order) => sum + (order?.amount || 0), 0)
                  .toLocaleString()}
                .00
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <p className="text-blue-800 font-semibold text-lg">
                Completed Orders
              </p>
              <p className="text-3xl font-bold text-blue-700 mt-2">
                {
                  filteredOrders.filter((o) => o && o.status === "completed")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
