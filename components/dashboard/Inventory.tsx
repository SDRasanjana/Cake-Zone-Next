export default function Inventory() {
  const items = [
    { name: "Chocolate", quantity: 10, unit: "kg" },
    { name: "Vanilla Essence", quantity: 3, unit: "bottles" },
    { name: "Flour", quantity: 15, unit: "kg" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Inventory Overview</h2>
      <div className="bg-white rounded shadow p-4 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between border-b py-2">
            <span>{item.name}</span>
            <span className="text-gray-600">
              {item.quantity} {item.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
