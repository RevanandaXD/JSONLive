import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/resources", "/admin"];
const AUTH_PAGES = ["/login", "/register"];

const matchesPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const session = await auth.api.getSession({ headers: request.headers });
  const role = session?.user.role;

  const isUser = matchesPrefix(pathname, "/dashboard");
  const isAdmin = matchesPrefix(pathname, "/admin");
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    matchesPrefix(pathname, prefix),
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (isProtected && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set(
      "callbackURL",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(url);
  }

  if (isAdmin && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isUser && role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
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