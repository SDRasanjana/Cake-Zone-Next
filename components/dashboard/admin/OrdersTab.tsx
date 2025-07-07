import React, { useEffect, useState } from "react";
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

interface Order {
  _id: string;
  userId: string;
  items: Array<{
    name: string;
    imageUri?: string;
    price: number;
    [key: string]: any;
  }>;
  shipping: any;
  total: number;
  deliveryDate: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersTabProps {
  getStatusColor: (status: string) => string;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ getStatusColor }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Orders");

  useEffect(() => {
    // Fetch all orders for admin dashboard
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/orders?admin=true");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.orders || []);
        setError("");
      } catch (err: any) {
        setError(err.message || "Unknown error");
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
            order.paymentStatus.toLowerCase() === statusFilter.toLowerCase()
        );

  // Generate PDF for a single order
  const generateSingleOrderPDF = async (order: Order) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("CakeZone Order Report", 14, 18);
    let y = 30;
    doc.setFontSize(12);
    // Order meta info, spaced out and aligned
    doc.text(`Order ID: ${order._id}`, 14, y);
    y += 8;
    doc.text(`User ID: ${order.userId}`, 14, y);
    y += 8;
    doc.text(`Status: ${order.paymentStatus}`, 14, y);
    y += 8;
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, y);
    y += 8;
    doc.text(`Total: Rs. ${order.total}`, 14, y);
    y += 12;
    doc.setFontSize(13);
    doc.text("Cake(s) Details:", 14, y);
    y += 8;
    for (const item of order.items) {
      // Cake image
      let imgHeight = 0;
      let imgWidth = 22;
      let imgMargin = 4;
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
          `Name: ${item.name || ""}`,
          item.layers ? `Layers: ${item.layers}` : null,
          item.frostingColor ? `Frosting: ${item.frostingColor}` : null,
          item.flavor ? `Flavor: ${item.flavor}` : null,
          item.toppings && Array.isArray(item.toppings) && item.toppings.length > 0
            ? `Toppings: ${item.toppings.join(", ")}`
            : null,
          item.price ? `Price: Rs. ${item.price}` : null,
          item.quantity ? `Qty: ${item.quantity}` : null,
        ].filter(Boolean) as string[];
      } else {
        cakeDetailsArr = [
          `Name: ${item.name || ""}`,
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
    doc.save(`cakezone_order_${order._id}.pdf`);
  };

  return (
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
            <option>processing</option>
            <option>completed</option>
          </select>
        </div>
      </div>

      {/* Loading/Error States */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading orders...</div>
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
                    <th className="px-4 py-3 text-left font-semibold">Order ID</th>
                    <th className="px-4 py-3 text-left font-semibold">User ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Cake(s)</th>
                    <th className="px-4 py-3 text-left font-semibold">Image(s)</th>
                    <th className="px-4 py-3 text-left font-semibold">Total</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-[#F8F9FB] transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                        {order._id}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{order.userId}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {order.items.map((item, idx) => (
                          <div key={idx}>{item.name}</div>
                        ))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item, idx) =>
                            item.imageUri ? (
                              <img
                                key={idx}
                                src={item.imageUri}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded border"
                              />
                            ) : (
                              <span
                                key={idx}
                                className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded border text-xs text-gray-500"
                              >
                                No Image
                              </span>
                            )
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 text-sm">
                        Rs. {order.total}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                            onClick={() => handleViewOrderPDF(order)}
                          >
                            View PDF
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                            onClick={() => handleDownloadOrderPDF(order)}
                          >
                            Download PDF
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
                key={order._id}
                className="bg-white rounded-lg shadow-md p-4 space-y-4"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      Order #{order._id.slice(-8)}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      User: {order.userId.slice(-8)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="text-green-700 text-xs font-semibold uppercase tracking-wide">Total Amount</div>
                    <div className="text-green-900 text-lg font-bold">Rs. {order.total}</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="text-blue-700 text-xs font-semibold uppercase tracking-wide">Order Date</div>
                    <div className="text-blue-900 text-sm font-semibold">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                  <div className="text-orange-700 text-xs font-semibold uppercase tracking-wide mb-3">
                    Ordered Items ({order.items.length})
                  </div>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded border">
                        <div className="flex-shrink-0">
                          {item.imageUri ? (
                            <img
                              src={item.imageUri}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded border text-xs text-gray-500">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Rs. {item.price}
                            {item.quantity && ` × ${item.quantity}`}
                          </p>
                          {/* Show custom cake details if available */}
                          {item.isCustom && (
                            <div className="text-xs text-gray-500 mt-1">
                              {item.flavor && <span>Flavor: {item.flavor} • </span>}
                              {item.layers && <span>Layers: {item.layers} • </span>}
                              {item.frostingColor && <span>Frosting: {item.frostingColor}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Order ID */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-700 text-xs font-semibold uppercase tracking-wide mb-1">Full Order ID</div>
                  <p className="text-xs text-gray-600 font-mono break-all">
                    {order._id}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 px-4 py-3 text-sm font-medium bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                    onClick={() => handleViewOrderPDF(order)}
                  >
                    📄 View PDF
                  </button>
                  <button
                    className="flex-1 px-4 py-3 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                    onClick={() => handleDownloadOrderPDF(order)}
                  >
                    💾 Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersTab;