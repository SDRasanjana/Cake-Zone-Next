"use client";
import React, { useState } from "react";
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

type BudgetKey = "1500" | "2000" | "2000+";

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCake, setSelectedCake] = useState<number | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetKey>("1500");
  const [notifications] = useState(3);

  //preview
  const [showPreview, setShowPreview] = useState(false);
  const { addToCart } = useCart(); // Use global cart context
  const [customCakeConfig, setCustomCakeConfig] = useState({
    flavor: "Chocolate",
    layers: 1,
    frostingColor: "bg-pink-400",
    toppings: [] as string[],
  });

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Package },
    { id: "customize", label: "Customize Cake", icon: ChefHat },
    { id: "orders", label: "My Orders", icon: ShoppingCart },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const recentOrders = [
    {
      id: 1,
      name: "Chocolate Birthday Cake",
      status: "delivered",
      date: "2025-05-20",
      price: 1450,
      image: "🎂",
    },
    {
      id: 2,
      name: "Vanilla Wedding Cake",
      status: "processing",
      date: "2025-05-22",
      price: 2200,
      image: "🍰",
    },
    {
      id: 3,
      name: "Red Velvet Anniversary",
      status: "pending",
      date: "2025-05-25",
      price: 1650,
      image: "❤️",
    },
  ];

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
  const handleAddToCart = (cake: any) => {
    addToCart({
      name: cake.name,
      price: cake.price,
      layers: cake.layers ?? 1,
      flavor: cake.flavor ?? "Vanilla",
      toppings: Array.isArray(cake.toppings) ? cake.toppings : [],
      frostingColor: cake.frostingColor ?? "bg-pink-400",
      quantity: 1,
      productId: "custom",
      imageUri: cake.image,
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
        return (
          <OverviewTab
            recentOrders={recentOrders}
            setActiveTab={setActiveTab}
          />
        );
      case "customize":
        return (
          <CustomizeTab
            selectedBudget={selectedBudget}
            setSelectedBudget={setSelectedBudget}
            budgetSuggestions={budgetSuggestions}
            selectedCake={selectedCake}
            setSelectedCake={setSelectedCake}
            customCakeConfig={customCakeConfig}
            handleConfigChange={handleConfigChange}
            handleToppingChange={handleToppingChange}
            setShowPreview={setShowPreview}
            handleAddToCart={handleAddToCart}
          />
        );
      case "orders":
        return <OrdersTab recentOrders={recentOrders} />;
      case "notifications":
        return <NotificationsTab />;
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🍰</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">
                  Cake Delight
                </h1>
                <p className="text-sm text-gray-500">Customer Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-orange-600" />
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">JD</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">Premium Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        {/* Sidebar */}
        <SidebarNavigation
          items={sidebarItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          notifications={notifications}
        />
        {/* Mobile Navigation */}
        <MobileNavigation
          items={sidebarItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto">
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
      {/* 3D Preview Modal */}
      <CakePreview3D
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        cakeConfig={customCakeConfig}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default CustomerDashboard;