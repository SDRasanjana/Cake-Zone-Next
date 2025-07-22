"use client";
import React, { useState, Suspense } from "react";
import CakePreview3D from "@/components/dashboard/customer/CakePreview3D";
import SidebarNavigation from "@/components/dashboard/customer/SidebarNavigation";
import MobileNavigation from "@/components/dashboard/customer/MobileNavigation";
import OverviewTab from "@/components/dashboard/customer/OverviewTab";
import CustomizeTab from "@/components/dashboard/customer/CustomizeTab";
import OrdersTab from "@/components/dashboard/customer/OrdersTab";
import NotificationsTab from "@/components/dashboard/customer/NotificationsTab";
import {
  ShoppingCart,
  Package,
  Heart,
  Plus,
  Calendar,
  DollarSign,
  Bell,
  User,
  Settings,
  ChefHat,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import {
  useDashboardTab,
  DashboardTabProvider,
  DashboardTab,
} from "@/contexts/DashboardTabContext";
import { useSearchParams, useRouter } from "next/navigation";

type BudgetKey = "1500" | "2000" | "2000+";

const CustomerDashboardContent = () => {
  const [selectedCake, setSelectedCake] = useState<number | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetKey>("1500");
  const [notifications] = useState(3);

  //preview
  const [showPreview, setShowPreview] = useState(false);
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

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Package },
    { id: "customize", label: "Customize Cake", icon: ChefHat },
    { id: "orders", label: "My Orders", icon: ShoppingCart },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const budgetSuggestions = {
    "1500": [
      {
        id: 1,
        name: "Classic Chocolate",
        layers: 1,
        price: 1200,
        image: "🍫",
        description: "Simple chocolate cake with buttercream",
      },
      {
        id: 2,
        name: "Vanilla Delight",
        layers: 2,
        price: 1350,
        image: "🍰",
        description: "Basic vanilla sponge with cream filling",
      },
      {
        id: 3,
        name: "Strawberry Simple",
        layers: 1,
        price: 1450,
        image: "🍓",
        description: "Fresh strawberry cake with berry topping",
      },
    ],
    "2000": [
      {
        id: 4,
        name: "Premium Chocolate",
        layers: 2,
        price: 1800,
        image: "🍫",
        description: "Rich chocolate cake with ganache and decorations",
      },
      {
        id: 5,
        name: "Deluxe Vanilla",
        layers: 3,
        price: 1900,
        image: "🍰",
        description: "Multi-layer vanilla with premium frosting",
      },
      {
        id: 6,
        name: "Berry Supreme",
        layers: 2,
        price: 1950,
        image: "🍓",
        description: "Mixed berry cake with cream cheese frosting",
      },
    ],
    "2000+": [
      {
        id: 7,
        name: "Luxury Chocolate Tower",
        layers: 4,
        price: 2800,
        image: "🍫",
        description: "Premium chocolate with gold decorations",
      },
      {
        id: 8,
        name: "Wedding Special",
        layers: 3,
        price: 2500,
        image: "🍰",
        description: "Elegant multi-tier with royal icing",
      },
      {
        id: 9,
        name: "Designer Fruit Cake",
        layers: 3,
        price: 2200,
        image: "🍓",
        description: "Artisan fruit cake with handcrafted decorations",
      },
    ],
  };

  // Updated handler to add custom cake to global cart
  // Add custom cake to global cart, using imageUri if present (from 3D snapshot)
  const handleAddToCart = (cake: any) => {
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
        return <NotificationsTab setActiveTab={handleTabChange} />;
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
            items={sidebarItems as any}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            notifications={notifications}
          />
        </div>
        {/* Mobile Navigation - only visible on small/medium screens */}
        <div className="block lg:hidden w-full">
          <MobileNavigation
            items={sidebarItems as any}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
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
