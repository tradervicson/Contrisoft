import { NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/projects', '/new-project'];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow all auth callback traffic without checks
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Allow API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // For protected routes, let the client handle authentication
  // We'll let React Query and Supabase client handle auth on the client side
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  
  if (isProtected) {
    // Let the client-side auth handle redirects
    // The useUser hook will redirect to login if no session
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}; 