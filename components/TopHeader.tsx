"use client";

import { UserButton } from "@clerk/nextjs";

interface TopHeaderProps {
  activeTab: string;
}

export default function TopHeader({ activeTab }: TopHeaderProps) {
  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard {activeTab}
          </h1>
        </div>{" "}
        {/* Right: User Profile */}
        <div className="flex items-center">
          {/* User Profile (Clerk UserButton) */}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}
