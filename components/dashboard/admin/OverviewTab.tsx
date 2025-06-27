import React from "react";

interface Stats {
  totalUsers: number;
  activeOrders: number;
  totalRevenue: number;
  systemUptime: number;
}

interface Order {
  id: string;
  customer: string;
  cake: string;
  amount: string;
  status: string;
  date: string;
}

interface OverviewTabProps {
  stats: Stats;
  recentOrders: Order[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats, recentOrders }) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <p className="text-xs text-green-100">Active Orders</p>
            <p className="text-2xl font-bold">{stats.activeOrders}</p>
          </div>
          <div className="text-2xl opacity-80">📦</div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-100">Total Revenue</p>
            <p className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="text-2xl opacity-80">💰</div>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Recent Orders
        </h3>
        <div className="space-y-3">
          {recentOrders.slice(0, 4).map((order: Order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-2 bg-[#F8F9FB] rounded-md"
            >
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {order.customer}
                </p>
                <p className="text-xs text-gray-500">{order.cake}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 text-sm">
                  {order.amount}
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-800">
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* AI Insights & Forecasts */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          AI Insights & Forecasts
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded border-l-4 border-green-400">
            <h4 className="font-medium text-green-800 text-sm">
              Ingredient Price Forecast
            </h4>
            <p className="text-xs text-green-700 mt-0.5">
              Flour prices expected to decrease by 8% next week
            </p>
          </div>
          <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded border-l-4 border-blue-400">
            <h4 className="font-medium text-blue-800 text-sm">
              Sales Prediction
            </h4>
            <p className="text-xs text-blue-700 mt-0.5">
              Valentine's Day orders projected to increase by 150%
            </p>
          </div>
          <div className="p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded border-l-4 border-yellow-400">
            <h4 className="font-medium text-yellow-800 text-sm">
              Inventory Alert
            </h4>
            <p className="text-xs text-yellow-700 mt-0.5">
              Recommend restocking chocolate within 3 days
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default OverviewTab;
