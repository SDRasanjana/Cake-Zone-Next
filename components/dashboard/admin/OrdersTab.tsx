/* eslint-disable @next/next/no-img-element */
// Note: We intentionally use <img> tags for 3D cake snapshots (base64 data URIs)
// because Next.js Image component doesn't optimize data URIs and they cause issues

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
// For PDF export
import jsPDF from "jspdf";
import "jspdf-autotable";

// Helper to load image as base64 for PDF embedding
async function getImageBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

interface OrderItem {
  name: string;
  imageUri?: string;
  price: number;
  quantity?: number;
  size?: string;
  flavor?: string;
  layers?: number;
  frostingColor?: string;
  toppings?: string[];
  isCustom?: boolean;
  specialInstructions?: string;
  [key: string]: unknown;
}

interface ShippingInfo {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  specialInstructions?: string;
}

interface Order {
  _id?: string;
  id?: string;
  userId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items?: OrderItem[];
  cake?: string;
  cakeSize?: string;
  quantity?: number;
  specialInstructions?: string;
  shipping?: ShippingInfo;
  total?: number;
  amount?: number;
  deliveryDate?: string;
  deliveryAddress?: string;
  orderDate?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;
  urgentOrder?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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

const formatUserId = (id: string): string => {
  if (!id) return "CZC001";
  // Create a more predictable numeric ID based on the original ID
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
  return `CZC${finalId.toString().padStart(3, "0")}`;
};

// Helper function to convert frosting color codes to readable names
const getFrostingColorName = (colorClass: string): string => {
  const colorNames: { [key: string]: string } = {
    "bg-pink-400": "Pink",
    "bg-blue-400": "Blue",
    "bg-green-400": "Green",
    "bg-yellow-400": "Yellow",
    "bg-purple-400": "Purple",
    "bg-white": "White",
    "bg-orange-900": "Chocolate",
    "bg-cream-200": "Cream",
  };

  // Add debugging to see what color class is being passed
  console.log(
    `[getFrostingColorName] Input: "${colorClass}", Output: "${
      colorNames[colorClass] || colorClass || "Unknown"
    }"`
  );

  return colorNames[colorClass] || colorClass || "White";
};

// Helper function to get proper cake name based on flavor and custom status
const getCakeName = (item: OrderItem): string => {
  console.log(`[getCakeName] Item:`, {
    name: item.name,
    isCustom: item.isCustom,
    flavor: item.flavor,
    frostingColor: item.frostingColor,
  });

  if (item.isCustom && item.flavor) {
    return `Custom ${
      item.flavor.charAt(0).toUpperCase() + item.flavor.slice(1)
    } Cake`;
  }
  return item.name || "Custom Cake";
};

const OrdersTab: React.FC<{
  getStatusColor?: (status: string) => string;
}> = ({ getStatusColor }) => {
  const { user } = useUser(); // Get authenticated admin user
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Orders");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Helper function to get status color classes - use prop if provided, otherwise default logic
  const getStatusColorClass = (status: string): string => {
    if (getStatusColor) {
      return getStatusColor(status);
    }
    // Default fallback logic
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
      case "delivered":
        return "bg-green-100 text-green-700";
      case "processing":
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-700";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<{
    [orderId: string]: "sending" | "success" | "failed" | null;
  }>({});

  useEffect(() => {
    // Fetch all orders for admin dashboard
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/orders?admin=true");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();

        console.log("Raw API data:", data);

        // Handle the transformed order format from the API
        const transformedOrders = (data.orders || []).map(
          (order: Record<string, unknown>) => {
            // Use the preserved items array from API if available, otherwise create fallback
            const items =
              Array.isArray(order.items) && order.items.length > 0
                ? order.items.map((item: OrderItem) => ({
                    name: item.name || "Unknown Item",
                    price: item.price || order.amount || order.total || 0,
                    quantity: item.quantity || 1,
                    size: item.size,
                    imageUri: item.imageUri || "/default-cake.png", // Preserve original imageUri
                    // Preserve custom cake properties
                    flavor: item.flavor,
                    shape: item.shape,
                    layers: item.layers,
                    frostingColor: item.frostingColor,
                    toppings: item.toppings,
                    isCustom: item.isCustom,
                    // Preserve predefined cake properties
                    category: item.category,
                    weight: item.weight,
                    ingredients: item.ingredients,
                  }))
                : order.cake
                ? [
                    {
                      name: order.cake,
                      price: order.amount || order.total || 0,
                      quantity: order.quantity || 1,
                      size: order.cakeSize,
                      imageUri: "/default-cake.png", // Fallback for old orders
                    },
                  ]
                : [];

            // Map the transformed format back to the expected format
            const transformedOrder = {
              _id: order.id || order._id,
              userId: order.userId || "unknown",
              items: items,
              shipping: {
                fullName: order.customerName,
                phone: order.customerPhone,
                email: order.customerEmail,
                address: order.deliveryAddress,
                specialInstructions: order.specialInstructions,
              },
              total: order.amount || order.total || 0,
              deliveryDate: order.deliveryDate,
              paymentStatus: order.paymentStatus || "pending",
              status: order.status || "pending",
              paymentMethod: order.paymentMethod,
              urgentOrder: order.urgentOrder || false,
              createdAt: order.orderDate || order.createdAt,
              updatedAt: order.updatedAt || order.createdAt,
            };
            console.log("Transformed order:", transformedOrder);
            return transformedOrder;
          }
        );

        console.log("All transformed orders:", transformedOrders);
        setOrders(transformedOrders);
        setError("");
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter orders by status
  const filteredOrders =
    statusFilter === "All Orders"
      ? orders
      : orders.filter(
          (order) =>
            (order.paymentStatus || "pending").toLowerCase() ===
            statusFilter.toLowerCase()
        );

  // Generate PDF for a single order
  const generateSingleOrderPDF = async (order: Order) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("CakeZone Order Report", 14, 18);
    let y = 30;
    doc.setFontSize(12);
    // Order meta info, spaced out and aligned
    doc.text(
      `Order Reference: ${formatOrderId(order._id || order.id || "N/A")}`,
      14,
      y
    );
    y += 8;
    doc.text(`User ID: ${order.userId || "N/A"}`, 14, y);
    y += 8;
    doc.text(
      `Status: ${order.paymentStatus || order.status || "pending"}`,
      14,
      y
    );
    y += 8;
    doc.text(
      `Date: ${new Date(
        order.createdAt || order.orderDate || Date.now()
      ).toLocaleDateString()}`,
      14,
      y
    );
    y += 8;
    doc.text(`Total: Rs. ${order.total || order.amount || 0}`, 14, y);
    y += 12;
    doc.setFontSize(13);
    doc.text("Cake(s) Details:", 14, y);
    y += 8;
    const items = order.items || [];
    for (const item of items) {
      // Cake image
      let imgHeight = 0;
      const imgWidth = 22;
      const imgMargin = 4;
      if (item.imageUri) {
        const imgData = await getImageBase64(item.imageUri);
        if (imgData) {
          doc.addImage(imgData, "JPEG", 14, y, imgWidth, 22);
          imgHeight = 22;
        }
      }
      // Cake details: custom vs predefined
      let cakeDetailsArr: string[] = [];
      if (item.isCustom) {
        cakeDetailsArr = [
          `Name: ${getCakeName(item)}`,
          item.layers ? `Layers: ${item.layers}` : null,
          item.frostingColor
            ? `Frosting: ${getFrostingColorName(item.frostingColor)}`
            : null,
          item.flavor ? `Flavor: ${item.flavor}` : null,
          item.toppings &&
          Array.isArray(item.toppings) &&
          item.toppings.length > 0
            ? `Toppings: ${item.toppings.join(", ")}`
            : null,
          item.price ? `Price: Rs. ${item.price}` : null,
          item.quantity ? `Qty: ${item.quantity}` : null,
        ].filter(Boolean) as string[];
      } else {
        cakeDetailsArr = [
          `Name: ${getCakeName(item)}`,
          item.price ? `Price: Rs. ${item.price}` : null,
          item.quantity ? `Qty: ${item.quantity}` : null,
        ].filter(Boolean) as string[];
      }
      // Print each detail on a new line, next to the image, with more vertical spacing
      let detailY = y + 3;
      for (const detail of cakeDetailsArr) {
        doc.text(detail as string, 14 + imgWidth + imgMargin, detailY);
        detailY += 8;
      }
      // Move y down by the max of image height or text block, with extra space between cakes
      y += Math.max(imgHeight, cakeDetailsArr.length * 8) + 10;
      if (y > 270) {
        doc.addPage();
        y = 30;
      }
    }
    return doc;
  };

  // View PDF for a single order
  const handleViewOrderPDF = async (order: Order) => {
    const doc = await generateSingleOrderPDF(order);
    window.open(doc.output("bloburl"), "_blank");
  };

  // Download PDF for a single order
  const handleDownloadOrderPDF = async (order: Order) => {
    const doc = await generateSingleOrderPDF(order);
    doc.save(
      `cakezone_${formatOrderId(order._id || order.id || "unknown")}.pdf`
    );
  };

  // Helper function to send notification to customer
  const sendOrderNotification = async (
    order: Order,
    newStatus: string,
    oldStatus: string
  ) => {
    const orderId = order._id || order.id || "";

    try {
      // Set notification status to sending
      setNotificationStatus((prev) => ({ ...prev, [orderId]: "sending" }));

      // Check if admin user is authenticated
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        console.warn(
          "❌ Admin user not authenticated - cannot send notification"
        );
        setNotificationStatus((prev) => ({ ...prev, [orderId]: "failed" }));
        return false;
      }

      // Get customer identification (email or userId)
      const targetUserId =
        order.shipping?.email || order.customerEmail || order.userId;

      if (!targetUserId) {
        console.warn("❌ No customer email/userId found for order:", orderId);
        setNotificationStatus((prev) => ({ ...prev, [orderId]: "failed" }));
        return false;
      }

      // Generate notification content based on status change
      let title = "";
      let message = "";
      let priority: "low" | "medium" | "high" = "medium";

      const orderRef = formatOrderId(order._id || order.id || "unknown");
      const orderItems = (order.items || [])
        .map((item) => item.name || "Unknown item")
        .join(", ");

      switch (newStatus.toLowerCase()) {
        case "confirmed":
          title = "✅ Order Confirmed!";
          message = `Great news! We've confirmed your order ${orderRef} and it's now in our system.\n\nItems: ${orderItems}\n\nWe'll start preparing your delicious cakes soon. You'll receive another notification when we begin processing.`;
          priority = "medium";
          break;

        case "processing":
          title = "🔄 Your Order is Being Prepared";
          message = `Exciting! Your order ${orderRef} is now being carefully prepared by our skilled bakers.\n\nItems: ${orderItems}\n\nWe're working hard to create your perfect cakes. We'll notify you once they're ready!`;
          priority = "medium";
          break;

        case "ready":
          title = "🎉 Your Cakes are Ready!";
          message = `Wonderful! Your order ${orderRef} is now complete and ready for pickup.\n\nItems: ${orderItems}\n\nPlease visit us at your earliest convenience to collect your delicious treats!`;
          priority = "high";
          break;

        case "completed":
          title = "✅ Order Successfully Completed";
          message = `Perfect! Your order ${orderRef} has been successfully completed.\n\nItems: ${orderItems}\n\nThank you for choosing CakeZone! We hope you absolutely love your cakes.`;
          priority = "high";
          break;

        case "delivered":
          title = "🚚 Order Delivered Successfully";
          message = `Your order ${orderRef} has been successfully delivered to your location!\n\nItems: ${orderItems}\n\nWe hope you enjoy every bite! Please consider leaving us a review to help other customers.`;
          priority = "medium";
          break;

        case "cancelled":
          title = "❌ Order Cancelled";
          message = `We regret to inform you that your order ${orderRef} has been cancelled.\n\nItems: ${orderItems}\n\nIf you have any questions or concerns, please don't hesitate to contact our support team. We're here to help!`;
          priority = "high";
          break;

        case "failed":
          title = "⚠️ Issue with Your Order";
          message = `We encountered an issue while processing your order ${orderRef}.\n\nItems: ${orderItems}\n\nOur team is aware of this and will contact you shortly to resolve the matter. Thank you for your patience.`;
          priority = "high";
          break;

        default:
          title = `📋 Order Status Update: ${
            newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
          }`;
          message = `Your order ${orderRef} status has been updated.\n\nNew Status: ${
            newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
          }\nItems: ${orderItems}\n\nWe'll keep you informed of any further updates. Thank you for choosing CakeZone!`;
          priority = "medium";
      }

      console.log(
        `📢 Sending notification to ${targetUserId} for order ${orderRef}`
      );

      // Send notification via API using authenticated admin user
      const notificationResponse = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "order_update",
          title: title,
          message: message,
          targetAudience: "specific_user",
          targetUserId: targetUserId,
          priority: priority,
          createdBy: user.emailAddresses[0].emailAddress, // Use authenticated admin email
          metadata: {
            orderId: order._id || order.id,
            oldStatus: oldStatus,
            newStatus: newStatus,
            orderReference: orderRef,
            adminUser: user.emailAddresses[0].emailAddress,
          },
        }),
      });

      const notificationResult = await notificationResponse.json();

      if (notificationResult.success) {
        console.log(`✅ Notification sent successfully to: ${targetUserId}`);
        setNotificationStatus((prev) => ({ ...prev, [orderId]: "success" }));
        // Clear success status after 3 seconds
        setTimeout(() => {
          setNotificationStatus((prev) => ({ ...prev, [orderId]: null }));
        }, 3000);
        return true;
      } else {
        console.error(
          `❌ Failed to send notification:`,
          notificationResult.error
        );
        setNotificationStatus((prev) => ({ ...prev, [orderId]: "failed" }));
        // Clear failed status after 5 seconds
        setTimeout(() => {
          setNotificationStatus((prev) => ({ ...prev, [orderId]: null }));
        }, 5000);
        // If it's an auth error, provide more helpful feedback
        if (notificationResult.error?.includes("Unauthorized")) {
          console.error(
            `🔐 Authorization issue: Make sure the admin user has proper permissions`
          );
        }
        return false;
      }
    } catch (error) {
      console.error("🚨 Error sending notification:", error);
      setNotificationStatus((prev) => ({ ...prev, [orderId]: "failed" }));
      // Clear failed status after 5 seconds
      setTimeout(() => {
        setNotificationStatus((prev) => ({ ...prev, [orderId]: null }));
      }, 5000);
      return false;
    }
  };

  // Handle status change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);

    // Get the current order to access customer info and old status
    const currentOrder = orders.find(
      (order) => (order._id || order.id) === orderId
    );
    if (!currentOrder) {
      alert("Order not found");
      setUpdatingStatus(null);
      return;
    }

    const oldStatus =
      currentOrder.paymentStatus || currentOrder.status || "pending";

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentStatus: newStatus,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Update the orders list with the new status
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          (order._id || order.id) === orderId
            ? { ...order, paymentStatus: newStatus, status: newStatus }
            : order
        )
      );

      // Send notification to customer (only if status actually changed)
      if (oldStatus !== newStatus) {
        console.log(
          `📢 Sending notification for order ${orderId}: ${oldStatus} → ${newStatus}`
        );
        const notificationSent = await sendOrderNotification(
          currentOrder,
          newStatus,
          oldStatus
        );

        if (notificationSent) {
          // Show success message to admin
          const orderRef = formatOrderId(orderId);
          console.log(
            `✅ Customer notification sent successfully for order ${orderRef}`
          );

          // You could show a toast notification here if you have a toast system
          // For now, we'll just log it
        } else {
          console.warn(`⚠️ Could not send notification for order ${orderId}`);

          // Optional: Show a non-blocking warning to admin
          // This won't interrupt the flow since the order status was still updated successfully
          if (!user?.emailAddresses?.[0]?.emailAddress) {
            console.warn(
              "📧 Admin authentication required for sending notifications"
            );
          } else {
            console.warn(
              "📧 Notification sending failed - order status updated but customer not notified"
            );
          }
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      // Remove the order from the list
      setOrders((prevOrders) =>
        prevOrders.filter((order) => (order._id || order.id) !== orderId)
      );
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order. Please try again.");
    }
  };

  // Show order details modal
  const handleShowOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Order Details Modal Component
  const OrderDetailsModal = () => {
    if (!showOrderModal || !selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Order Details
              </h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Order Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Order Information
                  </h3>
                  <div className="space-y-2 text-sm text-gray-800">
                    <p>
                      <span className="font-medium text-gray-900">
                        Order Reference:
                      </span>{" "}
                      <span className="text-gray-700">
                        {formatOrderId(
                          selectedOrder._id || selectedOrder.id || "unknown"
                        )}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">
                        Customer ID:
                      </span>{" "}
                      <span className="text-gray-700">
                        {formatUserId(selectedOrder.userId || "unknown")}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColorClass(
                          selectedOrder.paymentStatus ||
                            selectedOrder.status ||
                            "pending"
                        )}`}
                      >
                        {selectedOrder.paymentStatus || selectedOrder.status}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Total:</span>{" "}
                      <span className="text-gray-700">
                        Rs. {selectedOrder.total || selectedOrder.amount}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">
                        Order Date:
                      </span>{" "}
                      <span className="text-gray-700">
                        {new Date(
                          selectedOrder.createdAt ||
                            selectedOrder.orderDate ||
                            Date.now()
                        ).toLocaleString()}
                      </span>
                    </p>
                    {selectedOrder.deliveryDate && (
                      <p>
                        <span className="font-medium text-gray-900">
                          Delivery Date:
                        </span>{" "}
                        <span className="text-gray-700">
                          {new Date(
                            selectedOrder.deliveryDate
                          ).toLocaleString()}
                        </span>
                      </p>
                    )}
                    {selectedOrder.paymentMethod && (
                      <p>
                        <span className="font-medium text-gray-900">
                          Payment Method:
                        </span>{" "}
                        <span className="text-gray-700">
                          {selectedOrder.paymentMethod}
                        </span>
                      </p>
                    )}
                    {selectedOrder.urgentOrder && (
                      <p>
                        <span className="font-medium text-red-600">
                          🚨 Urgent Order
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                {(selectedOrder.shipping || selectedOrder.customerName) && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">
                      Customer Information
                    </h3>
                    <div className="space-y-2 text-sm text-gray-800">
                      {selectedOrder.customerName && (
                        <p>
                          <span className="font-medium text-gray-900">
                            Name:
                          </span>{" "}
                          <span className="text-gray-700">
                            {selectedOrder.customerName}
                          </span>
                        </p>
                      )}
                      {selectedOrder.customerPhone && (
                        <p>
                          <span className="font-medium text-gray-900">
                            Phone:
                          </span>{" "}
                          <span className="text-gray-700">
                            {selectedOrder.customerPhone}
                          </span>
                        </p>
                      )}
                      {selectedOrder.customerEmail && (
                        <p>
                          <span className="font-medium text-gray-900">
                            Email:
                          </span>{" "}
                          <span className="text-gray-700">
                            {selectedOrder.customerEmail}
                          </span>
                        </p>
                      )}
                      {selectedOrder.shipping?.fullName && (
                        <p>
                          <span className="font-medium text-gray-900">
                            Full Name:
                          </span>{" "}
                          <span className="text-gray-700">
                            {selectedOrder.shipping.fullName}
                          </span>
                        </p>
                      )}
                      {selectedOrder.deliveryAddress && (
                        <p>
                          <span className="font-medium text-gray-900">
                            Delivery Address:
                          </span>{" "}
                          <span className="text-gray-700">
                            {selectedOrder.deliveryAddress}
                          </span>
                        </p>
                      )}
                      {selectedOrder.shipping?.address && (
                        <p>
                          <span className="font-medium text-gray-900">
                            Address:
                          </span>{" "}
                          <span className="text-gray-700">
                            {selectedOrder.shipping.address}
                            {selectedOrder.shipping.city &&
                              `, ${selectedOrder.shipping.city}`}
                            {selectedOrder.shipping.state &&
                              `, ${selectedOrder.shipping.state}`}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Order Items */}
              <div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-4">
                    Order Items ({(selectedOrder.items || []).length})
                  </h3>
                  <div className="space-y-4">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            {item.imageUri ? (
                              <img
                                src={item.imageUri}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded border"
                                onError={(
                                  e: React.SyntheticEvent<
                                    HTMLImageElement,
                                    Event
                                  >
                                ) => {
                                  (e.target as HTMLImageElement).src =
                                    "/default-cake.png";
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded border text-xs text-gray-500">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {getCakeName(item)}
                            </h4>
                            <p className="text-sm text-gray-700">
                              Rs. {item.price}
                            </p>
                            {item.quantity && (
                              <p className="text-sm text-gray-700">
                                Quantity: {item.quantity}
                              </p>
                            )}
                            {item.size && (
                              <p className="text-sm text-gray-700">
                                Size: {item.size}
                              </p>
                            )}

                            {/* Custom cake details */}
                            {item.isCustom && (
                              <div className="mt-2 text-sm">
                                <p className="font-medium text-purple-800">
                                  Custom Cake Details:
                                </p>
                                {item.flavor && (
                                  <p className="text-gray-700">
                                    Flavor: {item.flavor}
                                  </p>
                                )}
                                {item.layers && (
                                  <p className="text-gray-700">
                                    Layers: {item.layers}
                                  </p>
                                )}
                                {item.frostingColor && (
                                  <p className="text-gray-700">
                                    Frosting:{" "}
                                    {getFrostingColorName(item.frostingColor)}
                                  </p>
                                )}
                                {item.toppings && item.toppings.length > 0 && (
                                  <p className="text-gray-700">
                                    Toppings: {item.toppings.join(", ")}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Special instructions */}
                            {(item.specialInstructions ||
                              selectedOrder.specialInstructions) && (
                              <div className="mt-2 p-2 bg-yellow-50 rounded text-sm border border-yellow-200">
                                <p className="font-medium text-yellow-900">
                                  Special Instructions:
                                </p>
                                <p className="text-yellow-800">
                                  {item.specialInstructions ||
                                    selectedOrder.specialInstructions}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => handleViewOrderPDF(selectedOrder)}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
              >
                📄 View PDF
              </button>
              <button
                onClick={() => handleDownloadOrderPDF(selectedOrder)}
                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
              >
                💾 Download PDF
              </button>
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4 md:space-y-6 p-2 md:p-0">
        {/* Header Section - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            Order Management
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="px-3 py-2 border border-[#D4DBE8] rounded-md bg-white text-gray-900 text-sm w-full sm:w-auto"
              aria-label="Filter orders by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Orders</option>
              <option>pending</option>
              <option>confirmed</option>
              <option>processing</option>
              <option>ready</option>
              <option>completed</option>
              <option>delivered</option>
              <option>cancelled</option>
            </select>
          </div>
        </div>

        {/* Loading/Error States */}
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            Loading orders...
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-[#F4C753] to-[#F59E0B] text-[#141C24]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        User ID
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Cake(s)
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Image(s)
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order._id || order.id}
                        className="hover:bg-[#F8F9FB] transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                          {formatOrderId(order._id || order.id || "N/A")}
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {formatUserId(order.userId || "N/A")}
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} className="text-gray-900">
                              {getCakeName(item)}
                            </div>
                          ))}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {(order.items || []).map((item, idx) =>
                              item.imageUri ? (
                                <img
                                  key={idx}
                                  src={item.imageUri}
                                  alt={getCakeName(item)}
                                  className="w-12 h-12 object-cover rounded border"
                                  onError={(
                                    e: React.SyntheticEvent<
                                      HTMLImageElement,
                                      Event
                                    >
                                  ) => {
                                    // Handle failed 3D snapshot loading
                                    console.warn(
                                      "Failed to load image for:",
                                      item.name,
                                      item.imageUri
                                    );
                                    (e.target as HTMLImageElement).src =
                                      "/default-cake.png";
                                  }}
                                />
                              ) : (
                                <div
                                  key={idx}
                                  className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded border text-xs text-gray-500"
                                  title={`${getCakeName(
                                    item
                                  )} - No preview available`}
                                >
                                  🎂
                                </div>
                              )
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 text-sm">
                          Rs. {order.total || order.amount || 0}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(
                              order.paymentStatus || order.status || "pending"
                            )}`}
                          >
                            {order.paymentStatus || order.status || "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {new Date(
                            order.createdAt || order.orderDate || Date.now()
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            <button
                              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                              onClick={() => handleShowOrderDetails(order)}
                            >
                              Details
                            </button>
                            <select
                              className="text-xs px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 min-w-[100px]"
                              value={
                                order.paymentStatus || order.status || "pending"
                              }
                              onChange={(e) =>
                                handleStatusChange(
                                  order._id || order.id || "",
                                  e.target.value
                                )
                              }
                              disabled={
                                updatingStatus === (order._id || order.id)
                              }
                            >
                              <option value="pending" className="text-gray-900">
                                Pending
                              </option>
                              <option
                                value="processing"
                                className="text-gray-900"
                              >
                                Processing
                              </option>
                              <option
                                value="completed"
                                className="text-gray-900"
                              >
                                Completed
                              </option>
                            </select>
                            <button
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                              onClick={() => handleViewOrderPDF(order)}
                            >
                              PDF
                            </button>
                            <button
                              className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                              onClick={() =>
                                handleDeleteOrder(order._id || order.id || "")
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View - Visible only on mobile */}
            <div className="md:hidden space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order._id || order.id}
                  className="bg-white rounded-lg shadow-md p-4 space-y-4"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        Order{" "}
                        {formatOrderId(order._id || order.id || "unknown")}
                      </h3>
                      <p className="text-xs text-gray-700 mt-1">
                        Customer: {formatUserId(order.userId || "unknown")}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(
                          order.paymentStatus || order.status || "pending"
                        )}`}
                      >
                        {order.paymentStatus || order.status || "pending"}
                      </span>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <div className="text-green-700 text-xs font-semibold uppercase tracking-wide">
                        Total Amount
                      </div>
                      <div className="text-green-900 text-lg font-bold">
                        Rs. {order.total || order.amount || 0}
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <div className="text-blue-700 text-xs font-semibold uppercase tracking-wide">
                        Order Date
                      </div>
                      <div className="text-blue-900 text-sm font-semibold">
                        {new Date(
                          order.createdAt || order.orderDate || Date.now()
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Items Section */}
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                    <div className="text-orange-700 text-xs font-semibold uppercase tracking-wide mb-3">
                      Ordered Items ({(order.items || []).length})
                    </div>
                    <div className="space-y-3">
                      {(order.items || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-white p-2 rounded border"
                        >
                          <div className="flex-shrink-0">
                            {item.imageUri ? (
                              <img
                                src={item.imageUri}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded border"
                                onError={(
                                  e: React.SyntheticEvent<
                                    HTMLImageElement,
                                    Event
                                  >
                                ) => {
                                  // Handle failed 3D snapshot loading in mobile view
                                  console.warn(
                                    "Mobile view - Failed to load image for:",
                                    item.name,
                                    item.imageUri
                                  );
                                  (e.target as HTMLImageElement).src =
                                    "/default-cake.png";
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded border text-lg">
                                🎂
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {getCakeName(item)}
                            </h4>
                            <p className="text-xs text-gray-700">
                              Rs. {item.price}
                              {item.quantity && ` × ${item.quantity}`}
                            </p>
                            {/* Show custom cake details if available */}
                            {item.isCustom && (
                              <div className="text-xs text-gray-700 mt-1">
                                {item.flavor && (
                                  <span>Flavor: {item.flavor} • </span>
                                )}
                                {item.layers && (
                                  <span>Layers: {item.layers} • </span>
                                )}
                                {item.frostingColor && (
                                  <span>
                                    Frosting:{" "}
                                    {getFrostingColorName(item.frostingColor)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Full Order ID */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-800 text-xs font-semibold uppercase tracking-wide mb-1">
                      Order Reference
                    </div>
                    <p className="text-xs text-gray-700 font-mono break-all">
                      {formatOrderId(order._id || order.id || "N/A")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Full ID: {order._id || order.id || "N/A"}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    {/* Status Change */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        Status:
                      </span>
                      <select
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900"
                        value={order.paymentStatus || order.status || "pending"}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id || order.id || "",
                            e.target.value
                          )
                        }
                        disabled={updatingStatus === (order._id || order.id)}
                      >
                        <option value="pending" className="text-gray-900">
                          Pending
                        </option>
                        <option value="confirmed" className="text-gray-900">
                          Confirmed
                        </option>
                        <option value="processing" className="text-gray-900">
                          Processing
                        </option>
                        <option value="ready" className="text-gray-900">
                          Ready for Pickup
                        </option>
                        <option value="completed" className="text-gray-900">
                          Completed
                        </option>
                        <option value="delivered" className="text-gray-900">
                          Delivered
                        </option>
                        <option value="cancelled" className="text-gray-900">
                          Cancelled
                        </option>
                      </select>
                      {/* Show notification indicator when updating */}
                      {updatingStatus === (order._id || order.id) && (
                        <div className="flex items-center text-xs text-blue-600 mt-1">
                          <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                          <span>Updating & notifying customer...</span>
                        </div>
                      )}
                      {/* Show notification status feedback */}
                      {notificationStatus[order._id || order.id || ""] ===
                        "success" && (
                        <div className="flex items-center text-xs text-green-600 mt-1">
                          <div className="w-3 h-3 text-green-600 mr-1">✓</div>
                          <span>Customer notified successfully!</span>
                        </div>
                      )}
                      {notificationStatus[order._id || order.id || ""] ===
                        "failed" && (
                        <div className="flex items-center text-xs text-red-600 mt-1">
                          <div className="w-3 h-3 text-red-600 mr-1">⚠</div>
                          <span>Notification failed - check console</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="px-4 py-3 text-sm font-medium bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                        onClick={() => handleShowOrderDetails(order)}
                      >
                        📋 Details
                      </button>
                      <button
                        className="px-4 py-3 text-sm font-medium bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                        onClick={() => handleViewOrderPDF(order)}
                      >
                        📄 PDF
                      </button>
                    </div>

                    <button
                      className="w-full px-4 py-2 text-sm font-medium bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                      onClick={() =>
                        handleDeleteOrder(order._id || order.id || "")
                      }
                    >
                      �️ Delete Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal />
    </>
  );
};

export default OrdersTab;
