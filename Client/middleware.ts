import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/courses',
  '/assignments',
  '/quizzes',
  '/profile',
];

// Paths that should redirect authenticated users
const authPaths = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  const isAuthenticated = !!token;
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect unauthenticated users to login for protected routes
  if (!isAuthenticated && protectedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Role-based access control
  if (isAuthenticated && pathname.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (isAuthenticated && pathname.startsWith('/faculty') && token.role !== 'faculty' && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  // Only run middleware on specified routes
  matcher: [
    '/login/:path*',
    '/register/:path*',
    '/dashboard/:path*',
    '/courses/:path*',
    '/assignments/:path*',
    '/quizzes/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/faculty/:path*',
  ],
}; 