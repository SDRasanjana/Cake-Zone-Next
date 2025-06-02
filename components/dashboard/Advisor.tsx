export default function Advisor() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">AI Financial Advisor</h2>
      <div className="bg-white p-4 rounded shadow space-y-2 text-gray-800">
        <p>
          💡 You are spending more on utilities than expected. Consider
          optimizing usage.
        </p>
        <p>💡 Forecast suggests bulk buying flour this week may save 12%.</p>
        <p>💡 Consider adjusting labor hours for weekends to reduce costs.</p>
      </div>
    </div>
  );
}
