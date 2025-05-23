"use client";

import { useState } from "react";
import SidebarNav from "@/components/SidebarNav";
import TopHeader from "@/components/TopHeader";
import Overview from "./Overview";
import Orders from "./Orders";
import Inventory from "./Inventory";
import Forecast from "./Forecast";
import Expenses from "./Expenses";
import Reports from "./Reports";
import Advisor from "./Advisor";

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

  const renderTab = () => {
    switch (activeTab) {
      case "Overview":
        return <Overview />;
      case "Orders":
        return <Orders />;
      case "Inventory":
        return <Inventory />;
      case "Price Forecasting":
        return <Forecast />;
      case "Expenses":
        return <Expenses />;
      case "Reports":
        return <Reports />;
      case "Financial Advisor":
        return <Advisor />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TopHeader activeTab={activeTab} userType="Owner" />
        <main className="flex-1 p-6 overflow-auto">{renderTab()}</main>
      </div>
    </div>
  );
}
