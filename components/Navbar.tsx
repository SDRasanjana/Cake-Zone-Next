"use client";

import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface NavbarProps {
  cartCount?: number;
  onCartClick?: () => void;
}

export default function Navbar({ cartCount = 0, onCartClick }: NavbarProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav className="bg-[#2B2B2B] text-white px-6 py-4 shadow-lg flex justify-between items-center relative z-50">
      <div className="text-2xl font-bold text-orange-400">CakeZone</div>
      <div className="space-x-6 text-sm uppercase font-semibold flex items-center">
        <Link href="/" className="hover:text-orange-400">
          Home
        </Link>
        <Link href="/about" className="hover:text-orange-400">
          About Us
        </Link>
        <Link href="/contact" className="hover:text-orange-400">
          Contact Us
        </Link>
        <Link href="/menu" className="hover:text-orange-400">
          Menu
        </Link>
        <button
          className="relative bg-white text-orange-500 rounded-full p-2 shadow hover:bg-orange-100 transition ml-4"
          onClick={onCartClick}
          aria-label="Shopping Cart"
        >
          <ShoppingCartIcon className="w-7 h-7" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {cartCount}
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
      </div>
    </nav>
  );
}
