"use client";

import {
  BarChart3,
  Package,
  TrendingUp,
  DollarSign,
  FileText,
  Brain,
  Calculator,
} from "lucide-react";

interface SidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SidebarNav({
  activeTab,
  setActiveTab,
}: SidebarNavProps) {
  const tabs = [
    { name: "Overview", icon: BarChart3 },
    { name: "Orders", icon: Package },
    { name: "Inventory", icon: Package },
    { name: "Cake Pricing", icon: Calculator },
    { name: "Price Forecasting", icon: TrendingUp },
    { name: "Expenses", icon: DollarSign },
    { name: "Reports", icon: FileText },
    { name: "Financial Advisor", icon: Brain },
  ];
  return (
    <div className="h-full flex flex-col bg-white shadow-md">
      {/* Logo Section */}
      <div className="py-6 px-5 border-b border-orange-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">🍰</span>
          </div>
          <div className="text-center mt-2">
            <h1 className="text-xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-sm text-orange-500 font-medium mt-1">
              {activeTab}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-4 space-y-2.5 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;

          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-white" : "text-gray-500"
                }`}
              />
              <span className="font-medium">{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
