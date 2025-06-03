export default function Forecast() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">AI Price Forecast</h2>
      <div className="bg-green-100 text-green-800 p-4 rounded mb-3">
        📉 Flour prices expected to <strong>decrease by 8%</strong> next week.
      </div>
      <div className="bg-blue-100 text-blue-800 p-4 rounded mb-3">
        📈 Valentine’s Day orders expected to <strong>increase by 150%</strong>.
      </div>
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded">
        ⚠️ Inventory Alert: Consider restocking chocolate within{" "}
        <strong>3 days</strong>.
      </div>
    </div>
  );
}
