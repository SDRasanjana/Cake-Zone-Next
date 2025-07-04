
import React, { useEffect, useState } from "react";

interface Order {
  _id: string;
  userId: string;
  items: any[];
  shipping: any;
  total: number;
  deliveryDate: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

const OverviewTab: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    systemUptime: 100, // Placeholder, update as needed
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch all orders, total users, and active users for admin dashboard
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/orders?admin=true");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const data = await res.json();
        setStats({
          totalUsers: data.totalUsers,
          activeUsers: data.activeUsers,
          systemUptime: 100, // Placeholder
        });
        setOrders(data.orders || []);
        setError("");
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Dashboard Overview
        </h2>
        <button className="px-3 py-1.5 bg-[#F4C753] text-[#141C24] rounded-md text-sm font-medium hover:bg-[#F59E0B] transition-colors">
          Generate Report
        </button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-100">Total Users</p>
              <p className="text-2xl font-bold">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="text-2xl opacity-80">👥</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-100">Active Users</p>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
            </div>
            <div className="text-2xl opacity-80">📦</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-100">System Uptime</p>
              <p className="text-2xl font-bold">{stats.systemUptime}%</p>
            </div>
            <div className="text-2xl opacity-80">⚡</div>
          </div>
        </div>
      </div>
      {/* Recent Activity */}
      <div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Recent Orders
          </h3>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-2 bg-[#F8F9FB] rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {order.userId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items && order.items.length > 0
                        ? order.items.map((item: any) => item.name || "Unnamed Cake").join(", ")
                        : "No cakes"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">
                      {order.total}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-800">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
