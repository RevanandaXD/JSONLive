import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/src/lib/auth";

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/resources"];
const AUTH_PAGES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const session = await auth.api.getSession({ headers: request.headers });
  const role = session?.user.role;

  const isAdmin = pathname.startsWith("/admin");
  const isProtected =
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || isAdmin;
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (isProtected && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackURL", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdmin && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAuthPage && session) {
    const destination = role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/resources/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};