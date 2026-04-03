// src/middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const PUBLIC_PATHS = [
  "/auth/signin",
  "/auth/error",
  "/api/auth",
  "/api/razorpay/webhook",
  "/terms",
  "/privacy",
  "/globe",
];

// Routes accessible by any authenticated user regardless of approval status
const STATUS_GATE_PATHS = [
  "/pending-approval",
  "/rejected",
  "/suspended",
];

// Routes that approved users can always access (even with zero credits)
const ALWAYS_ACCESSIBLE_PATHS = [
  "/pricing",
  "/payment",
  "/dashboard",
];

// File extensions and paths to always allow
const STATIC_PATTERNS = [
  /^\/_next/,
  /^\/favicon/,
  /^\/Favicon/,
  /\.ico$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.svg$/,
  /\.webp$/,
  /\.webmanifest$/,
  /\.xml$/,
  /\.txt$/,
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets
  if (STATIC_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for valid session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    // Redirect to sign-in page
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // User is authenticated — now check role and status-based gating
  const userRole = token.role as string | undefined;
  const userStatus = token.status as string | undefined;

  // ── Admin route protection ──
  if (pathname.startsWith("/admin")) {
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── Admins bypass status gates for all routes ──
  if (userRole === "admin") {
    const isOnGatePage = STATUS_GATE_PATHS.some((path) => pathname.startsWith(path));
    if (isOnGatePage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── Regular user status-based gating ──
  const isOnGatePage = STATUS_GATE_PATHS.some((path) => pathname.startsWith(path));

  // Allow API routes for authenticated users (for refresh endpoint, razorpay etc.)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  switch (userStatus) {
    case "pending_approval":
      // Allow pricing page even for pending users (so they can see plans)
      if (ALWAYS_ACCESSIBLE_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
      }
      if (!isOnGatePage) {
        return NextResponse.redirect(new URL("/pending-approval", request.url));
      }
      break;

    case "rejected":
      if (pathname !== "/rejected") {
        return NextResponse.redirect(new URL("/rejected", request.url));
      }
      break;

    case "suspended":
      if (pathname !== "/suspended") {
        return NextResponse.redirect(new URL("/suspended", request.url));
      }
      break;

    case "approved":
      // If approved user is on a gate page, redirect to home
      if (isOnGatePage) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      break;

    default:
      if (!isOnGatePage) {
        return NextResponse.redirect(new URL("/pending-approval", request.url));
      }
      break;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};