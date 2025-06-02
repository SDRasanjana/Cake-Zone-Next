import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import prisma from './lib/prisma'; // Import shared Prisma client
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define routes that require admin privileges
const isAdminRoute = createRouteMatcher([
  '/api/users/(.*)/assign-role',
  '/api/users/roles',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims } = auth(); // Get userId and sessionClaims

  // If the route is an admin route
  if (isAdminRoute(req)) {
    // If there's no userId (user is not authenticated), return unauthorized
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User not logged in.' }, { status: 401 });
    }

    try {
      // Check for custom role claim from Clerk, if set up
      // This is often preferred over a direct DB call in middleware for performance
      if (sessionClaims && sessionClaims.metadata && (sessionClaims.metadata as any).role === 'ADMIN') {
        // User has ADMIN role in Clerk session claims, allow access
        return NextResponse.next();
      }

      // Fallback to database check if role not in sessionClaims or not using that method
      console.log(`User ${userId} attempting to access admin route. Verifying role in DB.`);
      const user = await prisma.user.findUnique({
        where: { id: userId }, // Assuming User.id in your DB is Clerk's userId
        include: { role: true },
      });

      if (!user) {
        console.warn(`Admin route access denied: User ${userId} not found in DB.`);
        return NextResponse.json({ error: 'Forbidden. User not found.' }, { status: 403 });
      }

      if (user.role?.name !== 'ADMIN') {
        console.warn(`Admin route access denied: User ${userId} is ${user.role?.name}, not ADMIN.`);
        return NextResponse.json({ error: 'Forbidden. User does not have ADMIN privileges.' }, { status: 403 });
      }

      console.log(`User ${userId} is ADMIN. Allowing access to admin route.`);
      // If user is ADMIN, allow the request to proceed
      return NextResponse.next();

    } catch (error) {
      console.error('Error during admin route authorization:', error);
      return NextResponse.json({ error: 'Internal Server Error during authorization' }, { status: 500 });
    }
    // Note: Prisma client disconnection is handled by the global instance typically,
    // or if it were instantiated here, it would be in a finally block.
    // Since we are using a global instance from lib/prisma.ts, we don't disconnect it here.
  }

  // For any other routes, or if not an admin route, allow the request to proceed
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};