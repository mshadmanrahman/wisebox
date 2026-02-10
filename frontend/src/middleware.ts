import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedPaths = ['/dashboard', '/properties', '/services', '/tickets', '/orders', '/consultant', '/settings'];

// Routes only for unauthenticated users
const authPaths = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookies (set by Zustand persist)
  // Note: Zustand persists to localStorage, not cookies.
  // For SSR middleware, we check a cookie that the client sets.
  const token = request.cookies.get('wisebox_token')?.value;

  // Protected routes: redirect to login if no token
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth routes: redirect to dashboard if already logged in
  const isAuthRoute = authPaths.some((path) => pathname.startsWith(path));
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/properties/:path*',
    '/services/:path*',
    '/tickets/:path*',
    '/orders/:path*',
    '/consultant/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
