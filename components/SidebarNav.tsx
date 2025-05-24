"use client";

import {
  BarChart3,
  Package,
  TrendingUp,
  DollarSign,
  FileText,
  Brain,
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
    { name: "Price Forecasting", icon: TrendingUp },
    { name: "Expenses", icon: DollarSign },
    { name: "Reports", icon: FileText },
    { name: "Financial Advisor", icon: Brain },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">🍰</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Cake Delight</h1>
            <p className="text-sm text-gray-500">Owner Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;

          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? "bg-orange-500 text-white shadow-lg"
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
