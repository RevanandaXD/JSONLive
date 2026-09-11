import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const session = request.cookies.get("better-auth.session_token");

    const isProtected = request.nextUrl.pathname.startsWith('/dashboard');

    if (isProtected && !session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (request.nextUrl.pathname === '/login' && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/login']
}