"use client";

import { UserButton } from "@clerk/nextjs";

export default function TopHeader() {
  return (
    <div className="bg-white border-b px-5 py-3">
      <div className="flex items-center justify-end h-14">
        {/* Left side now empty - title moved to sidebar */}
        {/* Right: User Profile */}
        <div className="flex items-center">
          <div className="bg-orange-50 rounded-full p-0.5">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </div>
  );
}
