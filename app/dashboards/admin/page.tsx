"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import OverviewTab from "@/components/dashboard/admin/OverviewTab";
import UsersTab from "@/components/dashboard/admin/UsersTab";
import OrdersTab from "@/components/dashboard/admin/OrdersTab";
import NotificationsTab from "@/components/dashboard/admin/NotificationsTab";
import SidebarNavigation from "@/components/dashboard/admin/SidebarNavigation";
import MobileNavigation from "@/components/dashboard/admin/MobileNavigation";
import AdminTopHeader from "@/components/dashboard/admin/AdminTopHeader";
import {
  ShoppingCart,
  Package,
  Bell,
  User,
  Settings,
  Users as UsersIcon,
  Box,
  BarChart,
} from "lucide-react";
import type { User as AdminUserType } from "@/components/dashboard/admin/UsersTab";

export default function AdminDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [notifications] = useState([
    {
      id: 1,
      type: "order",
      message: "New cake order from Sarah Johnson",
      time: "5 min ago",
      read: false,
    },
    {
      id: 2,
      type: "alert",
      message: "Low inventory: Vanilla extract",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "system",
      message: "System backup completed",
      time: "2 hours ago",
      read: true,
    },
  ]);

  const stats = {
    totalUsers: 1247,
    activeOrders: 23,
    totalRevenue: 15680,
    systemUptime: 99.9,
  };

  const recentOrders = [
    {
      id: "#ORD001",
      customer: "Alice Brown",
      cake: "Chocolate Layer Cake",
      amount: "$45.00",
      status: "completed",
      date: "2025-01-20",
    },
    {
      id: "#ORD002",
      customer: "Mike Wilson",
      cake: "Vanilla Birthday Cake",
      amount: "$35.00",
      status: "processing",
      date: "2025-01-20",
    },
    {
      id: "#ORD003",
      customer: "Emma Davis",
      cake: "Red Velvet Cake",
      amount: "$55.00",
      status: "pending",
      date: "2025-01-19",
    },
    {
      id: "#ORD004",
      customer: "John Smith",
      cake: "Strawberry Cake",
      amount: "$40.00",
      status: "completed",
      date: "2025-01-19",
    },
  ];

  const [users, setUsers] = useState<AdminUserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState("");

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUserError("");
    try {
      const res = await fetch("/api/auth/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setUserError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setUserError("Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && (!isSignedIn || user?.publicMetadata?.role !== "admin")) {
      router.replace("/unauthorized");
    }
    if (isLoaded && isSignedIn && user?.publicMetadata?.role === "admin") {
      fetchUsers();
    }
  }, [isLoaded, isSignedIn, user, router, fetchUsers]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handler to add a new user (admin/owner only)
  const handleAddUser = async (
    newUser: Omit<AdminUserType, "_id" | "createdAt" | "updatedAt"> & {
      password?: string;
    }
  ) => {
    try {
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newUser,
          creatorRole: user?.publicMetadata?.role,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: "Failed to add user" };
    }
  };

  // Handler to update user status or role (activate/deactivate/change role)
  const handleUpdateUser = async (
    userId: string,
    update: Partial<Pick<AdminUserType, "status" | "role">>
  ) => {
    try {
      const res = await fetch("/api/auth/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...update,
          updaterRole: user?.publicMetadata?.role,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: "Failed to update user" };
    }
  };

  // Sidebar items for admin dashboard
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Package },
    { id: "users", label: "User Management", icon: UsersIcon },
    { id: "orders", label: "Order Management", icon: ShoppingCart },
    { id: "products", label: "Product Management", icon: Box },
    { id: "reports", label: "Reports & Analytics", icon: BarChart },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  // Responsive layout and navigation
  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <AdminTopHeader />
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - only visible on large screens */}
        <div className="hidden lg:block">
          <SidebarNavigation
            items={sidebarItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            notifications={notifications.filter((n) => !n.read).length}
          />
        </div>
        {/* Mobile Navigation - only visible on small/medium screens */}
        <div className="block lg:hidden w-full">
          <MobileNavigation
            items={sidebarItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        {/* Main Content */}
        <main className="flex-1 p-2 sm:p-4 lg:p-8 pb-20 lg:pb-8 w-full max-w-7xl mx-auto">
          <div className="mx-auto">
            {/* Render tab components based on activeTab */}
            {activeTab === "overview" && (
              <OverviewTab stats={stats} recentOrders={recentOrders} />
            )}
            {activeTab === "users" && (
              <UsersTab
                users={users}
                getStatusColor={getStatusColor}
                loading={loadingUsers}
                error={userError}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                currentUserRole={String(user?.publicMetadata?.role || "")}
              />
            )}
            {activeTab === "orders" && (
              <OrdersTab
                recentOrders={recentOrders}
                getStatusColor={getStatusColor}
              />
            )}
            {activeTab === "notifications" && (
              <NotificationsTab notifications={notifications} />
            )}
            {/* Add more tab components as needed for products, reports, settings, etc. */}
          </div>
        </main>
      </div>
    </div>
  );
}
