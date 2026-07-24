import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Defense-in-depth only — an optimistic check to redirect obviously
// unauthenticated requests away from /admin/**. This is NOT the
// authorization boundary: every Server Action and Route Handler under
// /admin re-verifies the real session server-side regardless of what
// happens here (see app/actions/leads.ts, app/api/leads/*). Next.js 16
// renamed middleware.ts to proxy.ts — see CLAUDE.md.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
