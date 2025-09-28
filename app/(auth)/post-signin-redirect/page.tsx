"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PostSignInRedirect() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3; // Reduced from 5 to 3

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }

    // Get role from Clerk publicMetadata
    const role = user?.publicMetadata?.role;

    if (role === "admin") {
      router.replace("/dashboards/admin");
    } else if (role === "owner") {
      router.replace("/dashboards/Owner");
    } else if (role === "customer") {
      router.replace("/dashboards/customer");
    } else {
      // Role not yet available, might need to wait for Clerk to update
      if (attempts < maxAttempts) {
        // For the first attempt, check immediately, then use shorter delays
        const delay = attempts === 0 ? 100 : 300;
        setTimeout(() => {
          setAttempts((prev) => prev + 1);
          // Force user refresh
          user?.reload();
        }, delay);
      } else {
        // After max attempts, assume customer role as fallback for new registrations
        console.log(
          "Role not found after max attempts, defaulting to customer"
        );
        router.replace("/dashboards/customer");
      }
    }
  }, [isLoaded, isSignedIn, user, router, attempts]);

  // Show loading while determining redirect
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
        <p className="text-sm text-gray-400 mt-2">
          {attempts > 0 && `Attempt ${attempts}/${maxAttempts}`}
        </p>
      </div>
    </div>
  );
}
