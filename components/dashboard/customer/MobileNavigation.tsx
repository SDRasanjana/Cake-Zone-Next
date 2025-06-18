import React from "react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface MobileNavigationProps {
  items: SidebarItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  activeTab,
  setActiveTab,
}) => (
  <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-10">
    <div className="flex justify-around py-2">
      {items.slice(0, 4).map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2 ${
              activeTab === item.id ? "text-orange-600" : "text-gray-600"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs mt-1">
              {item.label.split(" ")[0]}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default MobileNavigation;