import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookieStore, normalizeReturnToPath } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await getSessionFromCookieStore(request.cookies);

  if (session) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const next = normalizeReturnToPath(
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  loginUrl.searchParams.set("next", next);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/cart", "/ticket"],
};
