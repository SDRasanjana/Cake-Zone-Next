"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import PromoBanner from "@/components/PromoBanner";
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
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up"); // Hide Navbar on checkout, sign-in, sign-up
  const hideFooter = pathname.startsWith("/dashboards/customer") || hideNav; // Hide Footer on customer dashboard, admin/owner pages, checkout, sign-in, sign-up

  // Show promo banner on public pages for customers only
  const showPromoBanner =
    !hideNav &&
    isSignedIn &&
    user?.publicMetadata?.role === "customer" &&
    ["/", "/menu", "/about", "/contact"].includes(pathname);

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
      {showPromoBanner && <PromoBanner />}
      {children}
      {!hideFooter && <Footer />}
      <Toaster position="bottom-right" />
    </CartProvider>
  );
}
