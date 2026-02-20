import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

const PRIVATE_PATHS = ["/profile", "/checkout", "/orders", "/dashboard", "/admin", "/gestor"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPrivate = PRIVATE_PATHS.some((route) => pathname.startsWith(route));

  if (!isPrivate) return NextResponse.next();

  const token = req.cookies.get("djavu_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/gestor") && !["GESTOR", "ADMIN"].includes(payload.role)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/checkout/:path*", "/orders/:path*", "/dashboard/:path*", "/admin/:path*", "/gestor/:path*"],
};
