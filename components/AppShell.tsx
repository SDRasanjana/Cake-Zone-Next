"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const hideNav =
    pathname.startsWith("/dashboards/admin") ||
    pathname.startsWith("/dashboards/Owner") ||
    pathname.startsWith("/checkout"); // Hide Navbar on checkout
  const hideFooter = pathname.startsWith("/dashboards/customer") || hideNav; // Hide Footer on customer dashboard and admin/owner pages

  // Client-side redirect for admin/owner users on customer/public pages
  useEffect(() => {
    if (isSignedIn && !hideNav) {
      if (user?.publicMetadata?.role === "admin") {
        router.replace("/dashboards/admin");
      } else if (user?.publicMetadata?.role === "owner") {
        router.replace("/dashboards/Owner");
      }
    }
  }, [isSignedIn, user, hideNav, router]);

  if (
    isSignedIn &&
    !hideNav &&
    (user?.publicMetadata?.role === "admin" ||
      user?.publicMetadata?.role === "owner")
  ) {
    // Prevent flicker by not rendering anything while redirecting
    return null;
  }

  return (
    <CartProvider>
      {!hideNav && <Navbar />}
      {children}
      {!hideFooter && <Footer />}
      <Toaster position="bottom-right" />
    </CartProvider>
  );
}
