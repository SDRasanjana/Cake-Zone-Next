import React from "react";

interface Order {
  id: number;
  name: string;
  status: string;
  date: string;
  price: number;
  image: string;
}

interface OrdersTabProps {
  recentOrders: Order[];
}

const OrdersTab: React.FC<OrdersTabProps> = ({ recentOrders }) => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-6">My Orders</h3>
    <div className="space-y-4">
      {recentOrders.map((order) => (
        <div key={order.id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl mr-4">
                {order.image}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{order.name}</h4>
                <p className="text-sm text-gray-500">Order #CK00{order.id}</p>
                <p className="text-sm text-gray-500">
                  Ordered on {order.date}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-800">
                ₹{order.price}
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : order.status === "processing"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors">
              Track Order
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Reorder
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Rate & Review
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default OrdersTab;