"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type DashboardTab =
  | "overview"
  | "customize"
  | "orders"
  | "notifications";

interface DashboardTabContextType {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}

const DashboardTabContext = createContext<DashboardTabContextType | undefined>(
  undefined
);

export const DashboardTabProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  return (
    <DashboardTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </DashboardTabContext.Provider>
  );
};

export const useDashboardTab = () => {
  const context = useContext(DashboardTabContext);
  if (!context) {
    throw new Error(
      "useDashboardTab must be used within a DashboardTabProvider"
    );
  }
  return context;
};
