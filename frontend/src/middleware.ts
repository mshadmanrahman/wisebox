import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication (user portal)
const userProtectedPaths = ['/dashboard', '/properties', '/workspace', '/tickets', '/orders', '/settings', '/notifications', '/learning'];

// Admin-only routes
const adminProtectedPaths = ['/admin/dashboard', '/admin/consultations', '/admin/learning'];

// Consultant-only routes
const consultantProtectedPaths = ['/consultant'];

// Routes only for unauthenticated users
const authPaths = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('wisebox_token')?.value;

  // Protected user routes: redirect to login if no token
  const isUserProtected = userProtectedPaths.some((path) => pathname.startsWith(path));
  if (isUserProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protected admin routes: redirect to admin login if no token
  const isAdminProtected = adminProtectedPaths.some((path) => pathname.startsWith(path));
  if (isAdminProtected && !token) {
    const loginUrl = new URL('/login/admin', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protected consultant routes: redirect to consultant login if no token
  const isConsultantProtected = consultantProtectedPaths.some((path) => pathname.startsWith(path));
  if (isConsultantProtected && !token) {
    const loginUrl = new URL('/login/consultant', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth routes: redirect to appropriate landing if already logged in
  const isAuthRoute = authPaths.some((path) => pathname === path || pathname.startsWith(path + '/'));
  if (isAuthRoute && token) {
    // Consultant login redirects to consultant portal
    if (pathname.startsWith('/login/consultant')) {
      return NextResponse.redirect(new URL('/consultant', request.url));
    }
    // Admin login redirects to admin dashboard
    if (pathname.startsWith('/login/admin')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/properties/:path*',
    '/workspace/:path*',
    '/tickets/:path*',
    '/orders/:path*',
    '/consultant/:path*',
    '/settings/:path*',
    '/notifications/:path*',
    '/learning/:path*',
    '/admin/:path*',
    '/login/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
