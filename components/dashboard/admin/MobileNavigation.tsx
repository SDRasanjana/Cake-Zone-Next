import React from "react";
import MobileProfileDropdown from "@/components/dashboard/admin/MobileProfileDropdown";

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
  <div className="lg:hidden fixed top-0 left-0 right-0 bg-black border-b z-30 flex justify-end p-2">
    <MobileProfileDropdown activeTab={activeTab} setActiveTab={setActiveTab} />
  </div>
);

export default MobileNavigation;
