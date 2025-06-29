import React from "react";

interface Order {
  id: string;
  customer: string;
  cake: string;
  amount: string;
  status: string;
  date: string;
}

interface OrdersTabProps {
  recentOrders: Order[];
  getStatusColor: (status: string) => string;
}

const OrdersTab: React.FC<OrdersTabProps> = ({
  recentOrders,
  getStatusColor,
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">Order Management</h2>
      <div className="flex gap-2">
        <select
          className="px-3 py-1.5 border border-[#D4DBE8] rounded-md bg-white text-gray-900 text-sm"
          aria-label="Filter orders by status"
        >
          <option>All Orders</option>
          <option>Pending</option>
          <option>Processing</option>
          <option>Completed</option>
        </select>
        <button className="px-3 py-1.5 bg-[#F4C753] text-[#141C24] rounded-md text-sm font-medium hover:bg-[#F59E0B] transition-colors">
          Export Orders
        </button>
      </div>
    </div>
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-[#F4C753] to-[#F59E0B] text-[#141C24]">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Order ID</th>
              <th className="px-4 py-2 text-left font-semibold">Customer</th>
              <th className="px-4 py-2 text-left font-semibold">Cake Type</th>
              <th className="px-4 py-2 text-left font-semibold">Amount</th>
              <th className="px-4 py-2 text-left font-semibold">Status</th>
              <th className="px-4 py-2 text-left font-semibold">Date</th>
              <th className="px-4 py-2 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentOrders.map((order: Order) => (
              <tr
                key={order.id}
                className="hover:bg-[#F8F9FB] transition-colors"
              >
                <td className="px-4 py-2 font-medium text-gray-900 text-sm">
                  {order.id}
                </td>
                <td className="px-4 py-2 text-gray-500">{order.customer}</td>
                <td className="px-4 py-2 text-gray-500">{order.cake}</td>
                <td className="px-4 py-2 font-semibold text-gray-900 text-sm">
                  {order.amount}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">{order.date}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                      View
                    </button>
                    <button className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors">
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
);

export default OrdersTab;
