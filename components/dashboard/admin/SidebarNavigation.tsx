import React from "react";
import { LucideIcon } from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarNavigationProps {
  items: SidebarItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications?: number;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  items,
  activeTab,
  setActiveTab,
  notifications = 0,
}) => (
  <aside className="w-64 bg-white shadow-sm border-r min-h-screen hidden lg:block">
    <nav className="mt-8 px-4">
      <ul className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-orange-100 text-orange-700 border-r-2 border-orange-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
                {item.id === "notifications" && notifications > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  </aside>
);

export default SidebarNavigation;
