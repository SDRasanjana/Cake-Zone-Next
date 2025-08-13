"use client";

import { useState, useEffect, useCallback } from "react";

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

export default function Orders() {
  const [activeTab, setActiveTab] = useState<string>("all");
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
      setError(
        "Failed to load orders from database. Please check your connection."
      );
      setOrders([]); // Set empty array instead of sample data
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    };

    loadInitialData();
  }, [fetchOrders]);

  // Filter orders based on active tab
  const getFilteredOrders = () => {
    if (activeTab === "all") return orders;
    return orders.filter((order) => order.status === activeTab);
  };

  // Tab configuration
  const tabs = [
    { id: "all", label: "All Orders", count: orders.length },
    {
      id: "pending",
      label: "Pending",
      count: orders.filter((o) => o.status === "pending").length,
    },
    {
      id: "processing",
      label: "Processing",
      count: orders.filter((o) => o.status === "processing").length,
    },
    {
      id: "completed",
      label: "Completed",
      count: orders.filter((o) => o.status === "completed").length,
    },
  ];

  // Helper function to contact customer
  const contactCustomer = (order: Order) => {
    const message = `Hello ${order.customerName}, this is regarding your order ${order.id} for ${order.cake}. `;
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = order.customerPhone.replace(/[^\d]/g, ""); // Remove non-numeric characters

    // Try WhatsApp first, then fall back to SMS
    if (confirm(`Contact ${order.customerName} via WhatsApp?`)) {
      window.open(
        `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
        "_blank"
      );
    } else {
      window.open(`sms:${phoneNumber}?body=${encodedMessage}`, "_blank");
    }
  };

  // Helper function to send payment reminder
  const sendPaymentReminder = (order: Order) => {
    const message = `Dear ${order.customerName}, this is a friendly reminder that payment for order ${order.id} (${order.cake}) is still pending. Total amount: Rs. ${order.amount}.00. Please complete payment at your earliest convenience.`;
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = order.customerPhone.replace(/[^\d]/g, "");

    if (confirm(`Send payment reminder to ${order.customerName}?`)) {
      window.open(
        `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
        "_blank"
      );
    }
  };

  // Update order status
  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order status");
      }

      const data = await response.json();
      console.log("Order updated successfully:", data.message);

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      alert(`Failed to update order status: ${errorMessage}`);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to calculate time remaining for delivery
  const getTimeUntilDelivery = (deliveryDate: string | Date) => {
    const now = new Date();
    const delivery =
      typeof deliveryDate === "string" ? new Date(deliveryDate) : deliveryDate;
    const diffInHours = Math.ceil(
      (delivery.getTime() - now.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 0) return "Overdue";
    if (diffInHours < 24) return `${diffInHours}h remaining`;
    const days = Math.ceil(diffInHours / 24);
    return `${days} day${days > 1 ? "s" : ""} remaining`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchOrders}
            disabled={refreshing}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              refreshing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {refreshing ? "🔄 Refreshing..." : "🔄 Refresh"}
          </button>
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
            Total Revenue: Rs.{" "}
            {orders.reduce((sum, order) => sum + order.amount, 0)}.00
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading orders...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">⚠️ Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button
            onClick={fetchOrders}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      {!loading && (
        <>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Orders Grid */}
          <div className="space-y-4">
            {getFilteredOrders().length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-500">
                  {activeTab === "all"
                    ? "No orders have been placed yet."
                    : `No ${activeTab} orders at the moment.`}
                </p>
              </div>
            ) : (
              getFilteredOrders().map((order) => (
                <div
                  key={order.id}
                  className={`bg-white rounded-lg shadow-md border-l-4 transition-all hover:shadow-lg ${
                    order.urgentOrder
                      ? "border-l-red-500 bg-red-50"
                      : "border-l-blue-500"
                  }`}
                >
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-gray-800">
                          {order.id}
                        </h3>
                        {order.urgentOrder && (
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                            🚨 URGENT
                          </span>
                        )}
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : order.status === "processing"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl text-green-600">
                          Rs. {order.amount}.00
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              order.paymentStatus === "paid"
                                ? "bg-green-100 text-green-600"
                                : order.paymentStatus === "pending"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {order.paymentStatus === "paid"
                              ? "✅ Paid"
                              : order.paymentStatus === "pending"
                              ? "⏳ Pending"
                              : "❌ Failed"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Customer Info */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                          👤 Customer Information
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-800">
                            {order.customerName}
                          </p>
                          <p className="text-sm text-gray-600">
                            📞 {order.customerPhone}
                          </p>
                          <p className="text-sm text-gray-600">
                            ✉️ {order.customerEmail}
                          </p>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                          🎂 Order Details
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-800">
                            {order.cake}
                          </p>
                          <p className="text-sm text-gray-600">
                            📏 Size: {order.cakeSize}
                          </p>
                          <p className="text-sm text-gray-600">
                            🔢 Quantity: {order.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                          ⏰ Timeline
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm">
                            📅 Ordered: {formatDate(order.orderDate)}
                          </p>
                          <p className="text-sm">
                            🚚 Delivery: {formatDate(order.deliveryDate)}
                          </p>
                          <p
                            className={`text-sm font-medium ${
                              order.status === "completed"
                                ? "text-green-600"
                                : getTimeUntilDelivery(
                                    order.deliveryDate
                                  ).includes("Overdue")
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          >
                            ⏳{" "}
                            {order.status === "completed"
                              ? "Delivered ✅"
                              : getTimeUntilDelivery(order.deliveryDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Special Instructions and Delivery */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                          📝 Special Instructions
                        </h4>
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">
                            {order.specialInstructions ||
                              "No special instructions"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                          🏠 Delivery & Payment
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 mb-1">
                            📍 {order.deliveryAddress}
                          </p>
                          <p className="text-sm text-gray-600">
                            💳 Payment: {order.paymentMethod}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 mt-4">
                      {order.status === "pending" && (
                        <button
                          onClick={() =>
                            updateOrderStatus(order.id, "processing")
                          }
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                          🚀 Start Processing
                        </button>
                      )}
                      {order.status === "processing" && (
                        <button
                          onClick={() =>
                            updateOrderStatus(order.id, "completed")
                          }
                          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          ✅ Mark Complete
                        </button>
                      )}
                      <button
                        onClick={() => contactCustomer(order)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors flex items-center gap-2"
                      >
                        📞 Contact Customer
                      </button>
                      {order.paymentStatus === "pending" && (
                        <button
                          onClick={() => sendPaymentReminder(order)}
                          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                          💰 Payment Reminder
                        </button>
                      )}
                      <button className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors flex items-center gap-2">
                        👁️ View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
