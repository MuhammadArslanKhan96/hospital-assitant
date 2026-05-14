import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Extract session from cookie
  const sessionCookie = request.cookies.get("session");
  let session = null;

  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch (e) {
      console.error("Middleware: Session parsing failed");
    }
  }

  // 2. Define Route Checks
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isDashboardRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isReportsRoute =
    pathname === "/reports" || pathname.startsWith("/reports/");
  const isSettingsRoute =
    pathname === "/settings" || pathname.startsWith("/settings/");
  const isLoginRoute = pathname === "/login";

  const isProtectedRoute =
    isAdminRoute || isDashboardRoute || isReportsRoute || isSettingsRoute;

  // 3. Logic for Protected Routes
  if (isProtectedRoute) {
    // If not logged in, force redirect to login
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If logged in as Tenant but trying to access Admin pages
    if (isAdminRoute && session.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 4. Logic for Login Page (prevent logged-in users from seeing login again)
  if (isLoginRoute && session) {
    // Redirect to their respective "home" based on role
    if (session.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// 5. Matcher - ensure we catch all protected paths including base paths
export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/reports",
    "/reports/:path*",
    "/settings",
    "/settings/:path*",
    "/login",
  ],
};
