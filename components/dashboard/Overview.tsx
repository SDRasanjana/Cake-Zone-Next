import Chart from "@/components/Chart";

export default function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Total Sales</h2>
          <p className="text-2xl font-bold text-green-600">Rs. 45,000</p>
          <p className="text-sm text-green-500">+12.5%</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Total Orders</h2>
          <p className="text-2xl font-bold text-blue-600">28</p>
          <p className="text-sm text-green-500">+8.2%</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Sales Overview</h2>
        <Chart />
      </div>
    </div>
  );
}
