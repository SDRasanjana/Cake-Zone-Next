import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

export default clerkMiddleware();

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const protectedOwner = url.pathname.startsWith('/dashboards/Owner');
  const protectedAdmin = url.pathname.startsWith('/dashboards/admin');

  // Only protect owner/admin dashboards
  if (protectedOwner || protectedAdmin) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      if (protectedOwner && payload.role !== 'owner') {
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
      if (protectedAdmin && payload.role !== 'admin') {
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
    } catch {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/dashboards/Owner/:path*',
    '/dashboards/admin/:path*',
  ],
};