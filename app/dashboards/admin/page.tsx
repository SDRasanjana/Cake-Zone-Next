"use client";

import React, { useState } from "react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications] = useState([
    {
      id: 1,
      type: "order",
      message: "New cake order from Sarah Johnson",
      time: "5 min ago",
      read: false,
    },
    {
      id: 2,
      type: "alert",
      message: "Low inventory: Vanilla extract",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "system",
      message: "System backup completed",
      time: "2 hours ago",
      read: true,
    },
  ]);

  const stats = {
    totalUsers: 1247,
    activeOrders: 23,
    totalRevenue: 15680,
    systemUptime: 99.9,
  };

  const recentOrders = [
    {
      id: "#ORD001",
      customer: "Alice Brown",
      cake: "Chocolate Layer Cake",
      amount: "$45.00",
      status: "completed",
      date: "2025-01-20",
    },
    {
      id: "#ORD002",
      customer: "Mike Wilson",
      cake: "Vanilla Birthday Cake",
      amount: "$35.00",
      status: "processing",
      date: "2025-01-20",
    },
    {
      id: "#ORD003",
      customer: "Emma Davis",
      cake: "Red Velvet Cake",
      amount: "$55.00",
      status: "pending",
      date: "2025-01-19",
    },
    {
      id: "#ORD004",
      customer: "John Smith",
      cake: "Strawberry Cake",
      amount: "$40.00",
      status: "completed",
      date: "2025-01-19",
    },
  ];

  const users = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@email.com",
      role: "Customer",
      status: "Active",
      joinDate: "2025-01-15",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael@email.com",
      role: "Owner",
      status: "Active",
      joinDate: "2025-01-10",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily@email.com",
      role: "Customer",
      status: "Inactive",
      joinDate: "2025-01-08",
    },
    {
      id: 4,
      name: "David Thompson",
      email: "david@email.com",
      role: "Customer",
      status: "Active",
      joinDate: "2025-01-05",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#F8F9FB] to-[#E8F4FD]"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      {/* Header */}
      <header className="bg-white border-b border-[#E4E9F1] shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="size-8">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"
                  fill="#F59E0B"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#141C24]">Cake Delight</h1>
              <p className="text-sm text-[#3F5374]">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                className="p-2 rounded-full bg-[#F4C753] text-[#141C24] hover:bg-[#F59E0B] transition-colors"
                aria-label="View notifications"
                title="View notifications"
              >
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216Z" />
                </svg>
              </button>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-[#141C24]">Admin User</p>
                <p className="text-xs text-[#3F5374]">System Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F4C753] to-[#F59E0B] flex items-center justify-center">
                <span className="text-[#141C24] font-bold">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
          <nav className="p-4 space-y-2">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "users", label: "User Management", icon: "👥" },
              { id: "orders", label: "Order Management", icon: "📦" },
              { id: "products", label: "Product Management", icon: "🧁" },
              { id: "reports", label: "Reports & Analytics", icon: "📈" },
              { id: "notifications", label: "Notifications", icon: "🔔" },
              { id: "settings", label: "System Settings", icon: "⚙️" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-[#F4C753] to-[#F59E0B] text-[#141C24] shadow-md"
                    : "text-[#3F5374] hover:bg-[#F8F9FB] hover:text-[#141C24]"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#141C24]">
                  Dashboard Overview
                </h2>
                <button className="px-4 py-2 bg-[#F4C753] text-[#141C24] rounded-lg font-medium hover:bg-[#F59E0B] transition-colors">
                  Generate Report
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Users</p>
                      <p className="text-3xl font-bold">
                        {stats.totalUsers.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-4xl opacity-80">👥</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Active Orders</p>
                      <p className="text-3xl font-bold">{stats.activeOrders}</p>
                    </div>
                    <div className="text-4xl opacity-80">📦</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total Revenue</p>
                      <p className="text-3xl font-bold">
                        ${stats.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-4xl opacity-80">💰</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">System Uptime</p>
                      <p className="text-3xl font-bold">
                        {stats.systemUptime}%
                      </p>
                    </div>
                    <div className="text-4xl opacity-80">⚡</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-[#141C24] mb-4">
                    Recent Orders
                  </h3>
                  <div className="space-y-4">
                    {recentOrders.slice(0, 4).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-[#141C24]">
                            {order.customer}
                          </p>
                          <p className="text-sm text-[#3F5374]">{order.cake}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#141C24]">
                            {order.amount}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-[#141C24] mb-4">
                    AI Insights & Forecasts
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-l-4 border-green-400">
                      <h4 className="font-medium text-green-800">
                        Ingredient Price Forecast
                      </h4>
                      <p className="text-sm text-green-700 mt-1">
                        Flour prices expected to decrease by 8% next week
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-400">
                      <h4 className="font-medium text-blue-800">
                        Sales Prediction
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Valentine&lsquo;s Day orders projected to increase by
                        150%
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border-l-4 border-yellow-400">
                      <h4 className="font-medium text-yellow-800">
                        Inventory Alert
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Recommend restocking chocolate within 3 days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#141C24]">
                  User Management
                </h2>
                <button className="px-4 py-2 bg-[#F4C753] text-[#141C24] rounded-lg font-medium hover:bg-[#F59E0B] transition-colors">
                  Add New User
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#F4C753] to-[#F59E0B] text-[#141C24]">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">
                          Join Date
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-[#F8F9FB] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium">
                                {user.name.charAt(0)}
                              </div>
                              <span className="font-medium text-[#141C24]">
                                {user.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#3F5374]">
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                user.status
                              )}`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#3F5374]">
                            {user.joinDate}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                ✏️
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#141C24]">
                  Order Management
                </h2>
                <div className="flex gap-2">
                  <select
                    className="px-4 py-2 border border-[#D4DBE8] rounded-lg bg-white text-[#141C24]"
                    aria-label="Filter orders by status"
                  >
                    <option>All Orders</option>
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Completed</option>
                  </select>
                  <button className="px-4 py-2 bg-[#F4C753] text-[#141C24] rounded-lg font-medium hover:bg-[#F59E0B] transition-colors">
                    Export Orders
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#F4C753] to-[#F59E0B] text-[#141C24]">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">
                          Order ID
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">
                          Cake Type
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-[#F8F9FB] transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-[#141C24]">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 text-[#3F5374]">
                            {order.customer}
                          </td>
                          <td className="px-6 py-4 text-[#3F5374]">
                            {order.cake}
                          </td>
                          <td className="px-6 py-4 font-semibold text-[#141C24]">
                            {order.amount}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#3F5374]">
                            {order.date}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors">
                                View
                              </button>
                              <button className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors">
                                Update
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#141C24]">
                  Notification Center
                </h2>
                <button className="px-4 py-2 bg-[#F4C753] text-[#141C24] rounded-lg font-medium hover:bg-[#F59E0B] transition-colors">
                  Send Notification
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        notification.type === "order"
                          ? "bg-green-50 border-green-400"
                          : notification.type === "alert"
                          ? "bg-yellow-50 border-yellow-400"
                          : "bg-blue-50 border-blue-400"
                      } ${
                        !notification.read
                          ? "ring-2 ring-opacity-20 ring-blue-400"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              notification.read ? "bg-gray-300" : "bg-blue-500"
                            }`}
                          ></div>
                          <div>
                            <p className="font-medium text-[#141C24]">
                              {notification.message}
                            </p>
                            <p className="text-sm text-[#3F5374]">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <button className="text-sm text-blue-600 hover:text-blue-800">
                              Mark as read
                            </button>
                          )}
                          <button className="text-sm text-red-600 hover:text-red-800">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
