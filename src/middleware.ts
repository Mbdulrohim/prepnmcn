import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth/signin", "/auth/register", "/api/auth"];

  // Auth routes that should redirect authenticated users
  const authRoutes = ["/auth/signin", "/auth/register"];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check for authentication token
  const token = request.cookies.get("auth-token")?.value;

  if (token) {
    try {
      // Verify the token
      verifyToken(token);

      // If user is authenticated and trying to access auth routes, redirect to dashboard
      if (isAuthRoute) {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
      }

      // Allow authenticated users to access protected routes
      return NextResponse.next();
    } catch (error) {
      // Token is invalid, clear it and treat as unauthenticated
      const response = NextResponse.next();
      response.cookies.delete("auth-token");
      // Continue to check authentication below
    }
  }

  // For unauthenticated users
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to signin
  const signinUrl = new URL("/auth/signin", request.url);
  return NextResponse.redirect(signinUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
