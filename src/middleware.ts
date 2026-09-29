import { NextRequest, NextResponse } from "next/server";

// Protect dashboard routes - redirect to /login if no session cookie
export function middleware(req: NextRequest) {
  const session = req.cookies.get("pa25_session")?.value;
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isApiAuth = req.nextUrl.pathname.startsWith("/api/auth");

  // If accessing dashboard without session, redirect to login
  if (isDashboard && !session) {
    // Allow client-side fetch to return 401 - don't redirect API
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.next();
    }
    // For page, let client handle redirect via fetchDashboard check
    return NextResponse.next();
  }

  // If logged in and trying to access login/register, redirect to dashboard
  if (isAuthRoute && session) {
    // Don't force redirect - let user see login page with demo option
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/api/:path*"],
};
