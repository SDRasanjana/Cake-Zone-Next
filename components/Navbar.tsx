"use client";

import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
<<<<<<< HEAD
import { useCart } from "../contexts/CartContext"; // Adjust path as necessary
import { ShoppingCartIcon } from '@heroicons/react/24/outline'; // Example icon

export default function Navbar() {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <nav className="bg-[#2B2B2B] text-white px-6 py-4 shadow-lg flex justify-between items-center relative z-50">
      <Link href="/" className="text-2xl font-bold text-orange-400">
        CakeZone
      </Link>
      <div className="flex items-center space-x-6 text-sm uppercase font-semibold">
=======
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

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
      <div className="space-x-6 text-sm uppercase font-semibold flex items-center">
>>>>>>> ac31e0919c998c74b07f27d407478064513f979e
        <Link href="/" className="hover:text-orange-400">
          Home
        </Link>
        <Link href="/customize" className="hover:text-orange-400">
          Customize Cake
        </Link>
        <Link href="/about" className="hover:text-orange-400">
          About Us
        </Link>
        <Link href="/contact" className="hover:text-orange-400">
          Contact Us
        </Link>
<<<<<<< HEAD

        <Link href="/cart" className="relative flex items-center hover:text-orange-400">
          <ShoppingCartIcon className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
           <span className="sr-only">View Cart</span>
        </Link>

        <SignedOut>
          <Link href="/sign-in">
            <button className="bg-orange-400 text-white px-4 py-2 rounded-md hover:bg-orange-500 transition">
              Sign In
            </button>
          </Link>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
=======
        <Link href="/menu" className="hover:text-orange-400">
          Menu
        </Link>
        <button
          className="relative bg-white text-orange-500 rounded-full p-2 shadow hover:bg-orange-100 transition ml-4"
          onClick={handleCartClick}
          aria-label="Shopping Cart"
        >
          <ShoppingCartIcon className="w-7 h-7" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {totalItems}
            </span>
          )}
        </button>
        {isClient && (
          <>
            <SignedOut>
              <Link href="/sign-in">
                <button className="bg-orange-400 text-white px-4 py-2 rounded-md hover:bg-orange-500 transition">
                  sign in
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </>
        )}
>>>>>>> ac31e0919c998c74b07f27d407478064513f979e
      </div>
    </nav>
  );
}
