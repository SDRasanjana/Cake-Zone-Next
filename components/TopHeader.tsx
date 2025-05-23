"use client";

import { Bell } from "lucide-react";

interface TopHeaderProps {
  activeTab: string;
  userType: "Owner" | "Admin";
}

export default function TopHeader({ activeTab, userType }: TopHeaderProps) {
  const getUserInitial = () => (userType === "Owner" ? "O" : "A");
  const getUserTitle = () =>
    userType === "Owner" ? "System Owner" : "System Administrator";

  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard {activeTab}
          </h1>
        </div>

        {/* Right: Actions and User */}
        <div className="flex items-center space-x-6">
          {/* Generate Report Button */}
          <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors">
            Generate Report
          </button>

          {/* Notification */}
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              2
            </span>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="font-semibold text-gray-900">{userType} User</p>
              <p className="text-sm text-gray-500">{getUserTitle()}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="font-bold text-gray-900">
                {getUserInitial()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
