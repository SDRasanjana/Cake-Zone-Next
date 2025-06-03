export default function Orders() {
  const orders = [
    {
      name: "Alice Brown",
      cake: "Chocolate Layer Cake",
      amount: 45,
      status: "completed",
    },
    {
      name: "Mike Wilson",
      cake: "Vanilla Birthday Cake",
      amount: 35,
      status: "processing",
    },
    {
      name: "Emma Davis",
      cake: "Red Velvet Cake",
      amount: 55,
      status: "pending",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Recent Orders</h2>
      <div className="bg-white p-4 rounded shadow">
        {orders.map((order, i) => (
          <div
            key={i}
            className="flex justify-between items-center border-b py-2"
          >
            <div>
              <p className="font-semibold">{order.name}</p>
              <p className="text-sm text-gray-500">{order.cake}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">Rs. {order.amount}.00</p>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  order.status === "completed"
                    ? "bg-green-100 text-green-600"
                    : order.status === "processing"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
