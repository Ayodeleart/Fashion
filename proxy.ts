import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/admin-auth";

// Renamed from middleware.ts -> proxy.ts per the Next.js 16 convention
// (the old filename is silently ignored as of this version — Vercel just
// stops enforcing auth with no build error, which is worse than a crash).
// This defaults to the Node.js runtime now, so lib/admin-auth.ts's use of
// Node's crypto module works without any extra runtime config.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let the login page and its submit action through untouched.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!isValidSessionToken(token)) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
