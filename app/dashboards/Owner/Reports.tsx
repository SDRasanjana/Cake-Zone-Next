export default function Reports() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Reports</h2>
      <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
        📄 Generate Report
      </button>
      <p className="text-sm text-gray-500">
        Click to generate this month’s PDF report including orders, expenses,
        and forecasts.
      </p>
    </div>
  );
}
