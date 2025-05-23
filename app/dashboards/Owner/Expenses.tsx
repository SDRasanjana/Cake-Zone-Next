export default function Expenses() {
  const expenses = [
    { category: "Inventory", amount: 12000 },
    { category: "Utilities", amount: 3500 },
    { category: "Labor", amount: 9000 },
    { category: "Others", amount: 2500 },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Monthly Expenses</h2>
      <div className="bg-white rounded shadow p-4 space-y-3">
        {expenses.map((exp, i) => (
          <div key={i} className="flex justify-between border-b py-2">
            <span>{exp.category}</span>
            <span className="font-medium text-red-600">Rs. {exp.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
