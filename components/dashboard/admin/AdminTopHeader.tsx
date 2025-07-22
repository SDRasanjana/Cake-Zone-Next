import { UserButton } from "@clerk/nextjs";

export default function AdminTopHeader() {
  return (
    <div className="bg-black border-b px-4 py-3 shadow-sm sticky top-0 z-20">
      <div className="flex items-center justify-between">
        {/* Left: Brand and subtitle */}
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#F59E0B" }}>
            CakeZone
          </h1>
          <p className="text-xs font-medium mt-0.5 text-white">
            Admin Dashboard
          </p>
        </div>
        {/* Right: Clerk UserButton and greeting */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-white font-medium hidden sm:block">
            Hello! admin
          </span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}
