"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-[#2B2B2B] text-white px-6 py-4 shadow-lg flex justify-between items-center">
      <div className="text-2xl font-bold text-orange-400">CakeZone</div>
      <div className="space-x-6 text-sm uppercase font-semibold">
        <Link href="/" className="hover:text-orange-400">
          Home
        </Link>
        <Link href="/about" className="hover:text-orange-400">
          About Us
        </Link>
        <Link href="/contact" className="hover:text-orange-400">
          Contact Us
        </Link>
        <Link href="/customer/login">
          <button className="bg-orange-400 text-white px-4 py-2 rounded-md hover:bg-orange-500 transition">
            Login
          </button>
        </Link>
      </div>
    </nav>
  );
}
