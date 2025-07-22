import React from "react";
import { DashboardTab } from "@/contexts/DashboardTabContext";
import { useUser } from "@clerk/nextjs";
import { RefreshCw } from "lucide-react";

const OrdersTab: React.FC<{ setActiveTab?: (tab: DashboardTab) => void }> = ({
  setActiveTab,
}) => {
  // Fetch real orders for the logged-in user
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");
  const [refreshing, setRefreshing] = React.useState(false);
  const { user } = useUser(); // Use useUser only inside the component

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
                      order.items.map((item: any, idx: number) => (
                        <div
                          key={item.id || idx}
                          className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl"
                        >
                          {item.imageUri ? (
                            <img
                              src={item.imageUri}
                              alt={item.name}
                              className="w-14 h-14 rounded"
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
                        ? order.items.map((item: any) => item.name).join(", ")
                        : "Cake Order"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Order #{order._id?.toString().slice(-6)}
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
                  order.items.map((item: any, idx: number) => (
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
    </div>
  );
};

export default OrdersTab;
