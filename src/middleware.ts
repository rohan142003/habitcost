import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/habits") ||
    req.nextUrl.pathname.startsWith("/goals") ||
    req.nextUrl.pathname.startsWith("/insights") ||
    req.nextUrl.pathname.startsWith("/social") ||
    req.nextUrl.pathname.startsWith("/settings");

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/habits/:path*",
    "/goals/:path*",
    "/insights/:path*",
    "/social/:path*",
    "/settings/:path*",
    "/login",
  ],
};
