"use client";
import React, { useState, Suspense, useEffect, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import SidebarNavigation from "@/components/dashboard/customer/SidebarNavigation";
import MobileNavigation from "@/components/dashboard/customer/MobileNavigation";
import OverviewTab from "@/components/dashboard/customer/OverviewTab";
import CustomizeTab from "@/components/dashboard/customer/CustomizeTab";
import OrdersTab from "@/components/dashboard/customer/OrdersTab";
import NotificationsTab from "@/components/dashboard/customer/NotificationsTab";
import { ShoppingCart, Package, Bell, ChefHat } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import {
  useDashboardTab,
  DashboardTabProvider,
  DashboardTab,
} from "@/contexts/DashboardTabContext";
import { useSearchParams, useRouter } from "next/navigation";

type BudgetKey = "1500" | "2000" | "2000+";

const CustomerDashboardContent = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [selectedCake, setSelectedCake] = useState<number | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetKey>("1500");
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Dynamic notification count fetcher
  const fetchUnreadNotificationCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `/api/notifications?userId=${user.id}&userRole=customer&unreadOnly=true`
      );
      const data = await response.json();

      if (data.success) {
        setUnreadNotificationCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      setUnreadNotificationCount(0);
    }
  }, [user?.id]);

  // Fetch unread count when user is loaded
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      fetchUnreadNotificationCount();
      // Set up periodic refresh every 30 seconds
      const interval = setInterval(fetchUnreadNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoaded, isSignedIn, user?.id, fetchUnreadNotificationCount]);

  // Callback to update count when notifications are read
  const handleUnreadCountChange = (newCount: number) => {
    setUnreadNotificationCount(newCount);
  };

  // Handle user registration on first dashboard access
  useEffect(() => {
    const registerUserIfNeeded = async () => {
      if (
        isLoaded &&
        isSignedIn &&
        user &&
        user.emailAddresses &&
        user.emailAddresses.length > 0
      ) {
        const email = user.emailAddresses[0].emailAddress;

        // Check if user is already registered in MongoDB
        if (!sessionStorage.getItem(`mongo-registered-${email}`)) {
          console.log("🔄 Registering new user in MongoDB:", {
            email,
            fullName: user.fullName,
            firstName: user.firstName,
            lastName: user.lastName,
          });

          try {
            const registrationData = {
              email,
              name:
                user.fullName ||
                `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                email.split("@")[0],
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              imageUrl: user.imageUrl || "",
              password: "clerk-oauth",
            };

            const response = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(registrationData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
              console.log("✅ User successfully registered in MongoDB");
              sessionStorage.setItem(`mongo-registered-${email}`, "true");
            } else {
              console.log("ℹ️ User might already exist:", result.error);
              // Mark as registered even if user exists to avoid repeated calls
              sessionStorage.setItem(`mongo-registered-${email}`, "true");
            }
          } catch (error) {
            console.error("❌ Registration error:", error);
          }
        }
      }
    };

    registerUserIfNeeded();
  }, [isLoaded, isSignedIn, user]);

  // Check user status on component mount
  useEffect(() => {
    const checkUserStatus = async () => {
      if (isLoaded && isSignedIn && user?.emailAddresses?.[0]?.emailAddress) {
        try {
          const response = await fetch("/api/auth/check-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.emailAddresses[0].emailAddress,
              userId: user.id,
            }),
          });

          const data = await response.json();

          if (data.success && data.data.status !== "Active") {
            alert(
              "Your account has been deactivated. Please contact the administrator."
            );
            // Sign out and redirect
            await signOut();
            window.location.href = "/";
            return;
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          // On error, proceed with normal flow as fallback
        }
      }
    };

    checkUserStatus();
  }, [isLoaded, isSignedIn, user, signOut]);

  const { addToCart } = useCart(); // Use global cart context
  const [customCakeConfig, setCustomCakeConfig] = useState<{
    shape: "round" | "square";
    flavor: string;
    layers: number;
    frostingColor: string;
    toppings: string[];
  }>({
    shape: "round",
    flavor: "Chocolate",
    layers: 1,
    frostingColor: "bg-pink-400",
    toppings: [],
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeTab, setActiveTab } = useDashboardTab();

  // Set initial tab from query param if present (fix for mobile navigation)
  React.useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab as DashboardTab);
    }
    // If no tab param, keep current activeTab (default is 'overview')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Helper to switch tab and update URL
  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    router.replace(`/dashboards/customer?tab=${tab}`);
  };

  const sidebarItems: Array<{
    id: DashboardTab;
    label: string;
    icon: React.ElementType;
  }> = [
    { id: "overview", label: "Overview", icon: Package },
    { id: "customize", label: "Customize Cake", icon: ChefHat },
    { id: "orders", label: "My Orders", icon: ShoppingCart },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  // Updated handler to add custom cake to global cart
  // Add custom cake to global cart, using imageUri if present (from 3D snapshot)
  interface CakeToAdd {
    name: string;
    price: number;
    layers?: number;
    flavor?: string;
    toppings?: string[];
    frostingColor?: string;
    imageUri?: string;
    [key: string]: unknown;
  }

  const handleAddToCart = (cake: CakeToAdd) => {
    console.log("[Dashboard] handleAddToCart called with:", cake);
    // Extra debug: log all keys and values
    Object.keys(cake).forEach((key) => {
      console.log(`[Dashboard] cake property: ${key} =`, cake[key]);
    });
    // Pass imageUri directly, do not fallback to cake.image
    addToCart({
      name: cake.name,
      price: cake.price,
      layers: cake.layers ?? 1,
      flavor: cake.flavor ?? "Vanilla",
      toppings: Array.isArray(cake.toppings) ? cake.toppings : [],
      frostingColor: cake.frostingColor ?? "bg-pink-400",
      quantity: 1,
      productId: "custom",
      imageUri: cake.imageUri, // Only use imageUri
      isCustom: true,
    });
  };

  const handleToppingChange = (topping: string, checked: boolean) => {
    setCustomCakeConfig((prev) => ({
      ...prev,
      toppings: checked
        ? [...prev.toppings, topping]
        : prev.toppings.filter((t) => t !== topping),
    }));
  };

  const handleConfigChange = (key: string, value: unknown) => {
    setCustomCakeConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab setActiveTab={handleTabChange} />;
      case "customize":
        return (
          <CustomizeTab
            selectedBudget={selectedBudget}
            setSelectedBudget={setSelectedBudget}
            selectedCake={selectedCake}
            setSelectedCake={setSelectedCake}
            customCakeConfig={customCakeConfig}
            handleConfigChange={handleConfigChange}
            handleToppingChange={handleToppingChange}
            handleAddToCart={handleAddToCart}
            setActiveTab={handleTabChange}
          />
        );
      case "orders":
        return <OrdersTab setActiveTab={handleTabChange} />;
      case "notifications":
        return (
          <NotificationsTab
            setActiveTab={handleTabChange}
            onUnreadCountChange={handleUnreadCountChange}
          />
        );
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            Content for {activeTab}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - only visible on large screens */}
        <div className="hidden lg:block">
          <SidebarNavigation
            items={sidebarItems}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            notifications={unreadNotificationCount}
          />
        </div>
        {/* Mobile Navigation - only visible on small/medium screens */}
        <div className="block lg:hidden w-full">
          <MobileNavigation
            items={sidebarItems}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            notifications={unreadNotificationCount}
          />
        </div>
        {/* Main Content */}
        <main className="flex-1 p-2 sm:p-4 lg:p-8 pb-20 lg:pb-8 w-full max-w-7xl mx-auto">
          <div className="mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab === "customize" ? "Cake Customization" : activeTab}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === "overview" &&
                  "Welcome back! Here's your cake ordering summary."}
                {activeTab === "customize" &&
                  "Design your perfect cake with AI assistance."}
                {activeTab === "orders" && "Track and manage your cake orders."}
                {activeTab === "notifications" &&
                  "Stay updated with your order status and offers."}
              </p>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const CustomerDashboard = () => (
  <DashboardTabProvider>
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-500">
          Loading dashboard...
        </div>
      }
    >
      <CustomerDashboardContent />
    </Suspense>
  </DashboardTabProvider>
);

export default CustomerDashboard;
