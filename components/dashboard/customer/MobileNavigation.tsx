import React from "react";
import { DashboardTab } from "@/contexts/DashboardTabContext";

interface SidebarItem {
  id: DashboardTab;
  label: string;
  icon: React.ElementType;
}

interface MobileNavigationProps {
  items: SidebarItem[];
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  notifications?: number;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  activeTab,
  setActiveTab,
  notifications = 0,
}) => (
  <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-10">
    <div className="flex justify-around py-2">
      {items.slice(0, 4).map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2 relative ${
              activeTab === item.id ? "text-orange-600" : "text-gray-600"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs mt-1">{item.label.split(" ")[0]}</span>
            {/* Notification badge for notifications tab */}
            {item.id === "notifications" && notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {notifications > 99 ? "99+" : notifications}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

export default MobileNavigation;
