import React from "react";
import {
  ShoppingCart,
  Package,
  DollarSign,
  Plus,
  Calendar,
} from "lucide-react";
import { DashboardTab } from "@/contexts/DashboardTabContext";
import { useUser } from "@clerk/nextjs";

const OverviewTab: React.FC<{ setActiveTab: (tab: DashboardTab) => void }> = ({
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
  // Compute stats from orders
  const completedCount = orders.filter(
    (o) => o.paymentStatus === "paid" || o.status === "delivered"
  ).length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
            <Package className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Spent</p>
              <p className="text-2xl font-bold">
                ₹{totalSpent.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab("customize")}
            className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border-2 border-dashed border-pink-200 hover:border-pink-300 transition-colors group"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200">
              <Plus className="w-6 h-6 text-pink-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-800">Design New Cake</p>
              <p className="text-sm text-gray-500">Create custom cake</p>
            </div>
          </button>
          <button className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors group">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-800">Schedule Order</p>
              <p className="text-sm text-gray-500">Plan ahead</p>
            </div>
          </button>
        </div>
      </div>
      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
          <button
            onClick={() => setActiveTab("orders")}
            className="text-orange-600 hover:text-orange-700 font-medium text-sm"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {orders.slice(0, 3).map((order: any) => (
            <div
              key={order._id?.toString()}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                {/* Show all cakes in the order, not just the first */}
                <div className="flex flex-wrap gap-2">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item: any, idx: number) => (
                      <div
                        key={item.id || idx}
                        className="w-10 h-10 bg-white rounded flex items-center justify-center text-2xl"
                      >
                        {item.imageUri ? (
                          <img
                            src={item.imageUri}
                            alt={item.name}
                            className="w-10 h-10 rounded"
                          />
                        ) : (
                          "🎂"
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-2xl">
                      🎂
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  {/* List all cake names in the order */}
                  <p className="font-medium text-gray-800">
                    {order.items && order.items.length > 0
                      ? order.items.map((item: any) => item.name).join(", ")
                      : "Cake Order"}
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
                <p className="font-semibold text-gray-800">₹{order.total}</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
