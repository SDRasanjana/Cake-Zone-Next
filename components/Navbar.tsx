"use client";

import {
  UserButton,
  SignedIn,
  SignedOut,
  useUser,
  useClerk,
} from "@clerk/nextjs";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";
import {
  Package,
  ChefHat,
  ShoppingCart,
  Bell,
  User,
  Settings,
} from "lucide-react";
import { useDashboardTab } from "@/contexts/DashboardTabContext";

const navLinkVariants = {
  initial: { opacity: 0.7 },
  hover: { opacity: 1, scale: 1.05 },
};

export default function Navbar() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { getItemCount } = useCart();
  const totalItems = getItemCount();
  const { isSignedIn, user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setActiveTab } = useDashboardTab();

  // Dashboard sidebar items for mobile dropdown
  const dashboardItems = [
    {
      id: "overview",
      label: "Overview",
      icon: Package,
      href: "/dashboard/customer?tab=OverviewTab",
    },
    {
      id: "customize",
      label: "Customize Cake",
      icon: ChefHat,
      href: "/dashboard/customer?tab=customize",
    },
    {
      id: "orders",
      label: "My Orders",
      icon: ShoppingCart,
      href: "/dashboards/customer?tab=orders",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      href: "/dashboards/customer?tab=notifications",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      href: "/dashboards/customer?tab=profile",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/dashboards/customer?tab=settings",
    },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCartClick = () => {
    router.push("/shopping-cart");
  };

  return (
    <nav className="bg-[#2B2B2B] text-white px-6 py-4 shadow-lg flex justify-between items-center relative z-50">
      <div className="text-2xl font-bold text-orange-400">CakeZone</div>
      {/* Desktop Nav */}
      <div className="hidden lg:flex gap-4 text-sm uppercase font-semibold items-center">
        {isClient &&
          isSignedIn &&
          (() => {
            let dashboardHref = "/dashboards/customer";
            if (user?.publicMetadata?.role === "admin") {
              dashboardHref = "/dashboards/admin";
            } else if (user?.publicMetadata?.role === "owner") {
              dashboardHref = "/dashboards/Owner";
            }
            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.08, color: "#FFA500" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link
                  href={dashboardHref}
                  className="hover:text-orange-400 transition-colors duration-200 px-3 py-2 rounded-md"
                >
                  Dashboard
                </Link>
              </motion.div>
            );
          })()}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.08, color: "#FFA500" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link
            href="/"
            className="hover:text-orange-400 transition-colors duration-200 px-3 py-2 rounded-md"
          >
            Home
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.08, color: "#FFA500" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link
            href="/about"
            className="hover:text-orange-400 transition-colors duration-200 px-3 py-2 rounded-md"
          >
            About Us
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.08, color: "#FFA500" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link
            href="/contact"
            className="hover:text-orange-400 transition-colors duration-200 px-3 py-2 rounded-md"
          >
            Contact Us
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.08, color: "#FFA500" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link
            href="/menu"
            className="hover:text-orange-400 transition-colors duration-200 px-3 py-2 rounded-md"
          >
            Menu
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link
            href="/shopping-cart"
            className="relative bg-white text-orange-500 rounded-full p-2 shadow hover:bg-orange-100 transition ml-2 flex items-center justify-center"
            aria-label="Shopping Cart"
            style={{
              width: "40px",
              height: "40px",
              minWidth: "40px",
              minHeight: "40px",
            }}
          >
            <ShoppingCartIcon className="w-7 h-7" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {totalItems}
              </span>
            )}
          </Link>
        </motion.div>
        {isClient && (
          <>
            <SignedOut>
              <Link href="/sign-in">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  className="bg-orange-400 text-white px-4 py-2 rounded-md hover:bg-orange-500 transition shadow-md"
                >
                  Sign In
                </motion.button>
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </>
        )}
      </div>
      {/* Mobile Nav: Profile Dropdown */}
      <div className="block lg:hidden relative">
        <button
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="focus:outline-none"
          aria-label="Open user menu"
        >
          <User className="w-8 h-8 text-white" />
        </button>
        {mobileMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white text-gray-900 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-4 border-b">
              <div className="font-bold text-lg">
                {user?.fullName || "Account"}
              </div>
              <div className="text-xs text-gray-500">
                {user?.primaryEmailAddress?.emailAddress ||
                  user?.emailAddresses?.[0]?.emailAddress}
              </div>
            </div>
            <div className="px-4 py-2 text-xs text-gray-500 font-semibold">
              NAVIGATION
            </div>
            <Link href="/" className="block px-4 py-2 hover:bg-gray-100">
              HOME
            </Link>
            <Link href="/about" className="block px-4 py-2 hover:bg-gray-100">
              ABOUT US
            </Link>
            <Link href="/contact" className="block px-4 py-2 hover:bg-gray-100">
              CONTACT US
            </Link>
            <Link href="/menu" className="block px-4 py-2 hover:bg-gray-100">
              MENU
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                router.push("/shopping-cart");
              }}
              className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
            >
              <ShoppingCartIcon className="w-5 h-5 mr-2 text-orange-500" />
              Cart
              {totalItems > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <div className="px-4 py-2 text-xs text-gray-500 font-semibold border-t mt-2">
              DASHBOARD
            </div>
            {dashboardItems.map((item) =>
              item.id === "profile" ? (
                <button
                  key={item.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openUserProfile();
                  }}
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              ) : (
                <button
                  key={item.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(`/dashboards/customer?tab=${item.id}`);
                  }}
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                  {item.id === "notifications" && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      3
                    </span>
                  )}
                </button>
              )
            )}
            <div className="border-t mt-2">
              <SignedIn>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await signOut();
                    router.push("/sign-in");
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
