import React from "react";
import { DashboardTab } from "@/contexts/DashboardTabContext";
import { useUser } from "@clerk/nextjs";

const OrdersTab: React.FC<{ setActiveTab?: (tab: DashboardTab) => void }> = ({
  setActiveTab,
}) => {
  // Fetch real orders for the logged-in user
  const [orders, setOrders] = React.useState<any[]>([]);
  const { user } = useUser(); // Use useUser only inside the component
  React.useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/orders?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []));
  }, [user?.id]);
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">My Orders</h3>
      <div className="space-y-4">
        {orders.map((order) => (
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
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-800">
                  ₹{order.total}
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
                    <div className="font-semibold text-black">{item.name}</div>
                    <div className="text-black">
                      Type: {item.isCustom ? "Custom" : "Predefined"}
                    </div>
                    <div className="text-black">Qty: {item.quantity}</div>
                    <div className="text-black">Price: ₹{item.price}</div>
                    {/* Show custom fields if present */}
                    {item.isCustom && (
                      <div>
                        <div className="text-black">Flavor: {item.flavor}</div>
                        <div className="text-black">Layers: {item.layers}</div>
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
        ))}
      </div>
    </div>
  );
};

export default OrdersTab;
