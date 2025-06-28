import React, { useState } from "react";
import { UserButton, useClerk } from "@clerk/nextjs";
import {
  ShoppingCart,
  Package,
  Bell,
  User,
  Settings,
  Users as UsersIcon,
  Box,
  BarChart,
  LogOut,
} from "lucide-react";

const sidebarItems = [
  { id: "overview", label: "Overview", icon: Package },
  { id: "users", label: "User Management", icon: UsersIcon },
  { id: "orders", label: "Order Management", icon: ShoppingCart },
  { id: "products", label: "Product Management", icon: Box },
  { id: "reports", label: "Reports & Analytics", icon: BarChart },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "System Settings", icon: Settings },
  { id: "profile", label: "Profile", icon: User },
];

interface MobileProfileDropdownProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileProfileDropdown: React.FC<MobileProfileDropdownProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const [open, setOpen] = useState(false);
  const clerk = useClerk();

  const handleProfile = () => {
    setOpen(false);
    clerk.openUserProfile();
  };

  const handleSignOut = async () => {
    setOpen(false);
    await clerk.signOut();
    window.location.href = "/";
  };

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border shadow text-gray-900"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open profile menu"
      >
        <span className="text-sm font-medium">Hello! admin</span>
        <UserButton afterSignOutUrl="/" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-30 border divide-y divide-gray-100">
          <div className="py-2">
            {sidebarItems.map((item) => {
              if (item.id === "profile") {
                return (
                  <button
                    key={item.id}
                    onClick={handleProfile}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm rounded hover:bg-gray-100 transition-colors text-gray-700`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              }
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm rounded hover:bg-gray-100 transition-colors ${
                    activeTab === item.id
                      ? "text-orange-600 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="py-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm rounded hover:bg-gray-100 transition-colors text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileProfileDropdown;
