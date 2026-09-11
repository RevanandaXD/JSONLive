import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const cookies = request.cookies.getAll();

  const hasSession = cookies.some((cookie) =>
    cookie.name.startsWith("better-auth.session_token"),
  );

  const pathname = request.nextUrl.pathname;

  const isProtected = pathname.startsWith("/dashboard");

  if (isProtected && !hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackURL", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/register") && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};