import Chart from "@/components/Chart";
import { TrendingUp, DollarSign, ShoppingBag } from "lucide-react";

export default function Overview() {
  // Current date for dashboard
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 p-2">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-lg border border-orange-100">
        <h1 className="text-xl font-bold text-gray-800">
          Welcome to your Dashboard
        </h1>
        <p className="text-gray-500 text-sm">{formattedDate}</p>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-700">
                  Total Sales
                </h2>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                Rs. 45,000
              </p>
              <div className="flex items-center mt-1">
                <span className="text-sm font-medium text-green-600">
                  +12.5%
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  vs last month
                </span>
              </div>
            </div>{" "}
            <div className="hidden md:flex h-16 w-16 bg-green-50 rounded-full items-center justify-center">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">↑</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-700">
                  Total Orders
                </h2>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">28</p>
              <div className="flex items-center mt-1">
                <span className="text-sm font-medium text-green-600">
                  +8.2%
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  vs last month
                </span>
              </div>
            </div>{" "}
            <div className="hidden md:flex h-16 w-16 bg-blue-50 rounded-full items-center justify-center">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">28</span>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Chart Section */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="bg-orange-100 p-1.5 rounded-md">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-700">
                Sales Overview
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-9">
              Revenue trends over time
            </p>
          </div>{" "}
          <div>
            <button className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-md shadow-sm">
              This Month
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Week 1", value: "Rs. 9,250", change: "+5.2%" },
            { label: "Week 2", value: "Rs. 10,800", change: "+12.3%" },
            { label: "Week 3", value: "Rs. 11,500", change: "+6.5%" },
            { label: "Week 4", value: "Rs. 13,450", change: "+16.2%" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-lg p-2 border border-gray-100"
            >
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-sm font-medium text-gray-800">{stat.value}</p>
              <p className="text-xs text-green-600">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Chart with custom styling */}
        <div className="bg-gradient-to-b from-orange-50/30 to-transparent p-4 rounded-lg border border-gray-100">
          <Chart />
        </div>

        {/* Legend */}
        <div className="flex justify-center mt-3 pt-2 border-t border-gray-100">
          <div className="flex space-x-6 text-xs text-gray-500">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-orange-500 mr-1.5"></div>
              <span>Revenue</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
              <span>Highest: June 24 (Rs. 6,250)</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-blue-500 mr-1.5"></div>
              <span>Avg: Rs. 4,350/day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
