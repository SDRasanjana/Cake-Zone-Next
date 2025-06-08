"use client";

import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

const navLinkVariants = {
  initial: { opacity: 0.7 },
  hover: { opacity: 1, scale: 1.05 },
};

export default function Navbar() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { totalItems } = useCart();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCartClick = () => {
    router.push("/shopping-cart");
  };

  return (
    <nav className="bg-[#2B2B2B] text-white px-6 py-4 shadow-lg flex justify-between items-center relative z-50">
      <div className="text-2xl font-bold text-orange-400">CakeZone</div>
      <div className="flex gap-4 text-sm uppercase font-semibold items-center">
        {isClient && (
          <>
            <SignedIn>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.08, color: "#FFA500" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link
                  href="/dashboards/customer"
                  className="hover:text-orange-400 transition-colors duration-200 px-3 py-2 rounded-md"
                >
                  Dashboard
                </Link>
              </motion.div>
            </SignedIn>
          </>
        )}
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
    </nav>
  );
}
