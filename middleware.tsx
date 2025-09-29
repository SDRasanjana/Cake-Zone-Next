import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboards/(.*)",
  "/api/orders(.*)",
  "/api/auth/users(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Check if this is a protected route
  if (isProtectedRoute(req)) {
    // Ensure user is authenticated for protected routes
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/dashboards/Owner/:path*",
    "/dashboards/admin/:path*",
    "/dashboards/customer/:path*",
  ],
};
