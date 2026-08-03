import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Proxy (Next.js 16) handles:
 * 1. Route protection for authenticated-only routes
 * 2. Redirect logged-in users away from auth pages
 * 3. Admin/moderator route protection
 *
 * Runs in Node.js runtime (not Edge) — required for NextAuth + Prisma.
 */

const publicRoutes = ["/", "/kurslar", "/giris", "/kayit", "/sifremi-unuttum", "/sifre-sifirla"];
const authRoutes = ["/giris", "/kayit", "/sifremi-unuttum", "/sifre-sifirla"];
const adminRoutes = ["/admin"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isAuthRoute = authRoutes.some((route) => nextUrl.pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => nextUrl.pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) =>
    route === "/" ? nextUrl.pathname === "/" : nextUrl.pathname.startsWith(route)
  );

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/panel", nextUrl));
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/giris?callbackUrl=${nextUrl.pathname}`, nextUrl));
    }
    if (!["ADMIN", "MODERATOR"].includes(session?.user?.role ?? "")) {
      return NextResponse.redirect(new URL("/panel", nextUrl));
    }
  }

  // Protect private routes
  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(new URL(`/giris?callbackUrl=${callbackUrl}`, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
