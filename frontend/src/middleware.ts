import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/", "/api"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith("/api")
  );

  // We can't check localStorage in middleware (runs on edge).
  // Auth guard is handled client-side via the auth store.
  // This middleware handles basic redirects only.

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
