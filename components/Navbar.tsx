"use client";

import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
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
      </div>
    </nav>
  );
}
