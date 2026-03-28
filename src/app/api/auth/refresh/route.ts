// src/app/api/auth/refresh/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getUserById } from "@/lib/firestore";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";

function toISOStringOrNull(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return new Date(value).toISOString();
  }
  return null;
}

async function handleRefresh() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Rate limiting
    const rateCheck = checkRateLimit(session.user.id, "authRefresh");
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck);
    }

    const user = await getUserById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      credits: user.credits,
      status: user.status,
      role: user.role,
      plan: user.plan,
      planExpiresAt: toISOStringOrNull(user.planExpiresAt),
    });
  } catch (err) {
    console.error("AUTH_REFRESH_ERROR:", err);
    return NextResponse.json(
      { error: "Failed to refresh session data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return handleRefresh();
}

export async function POST() {
  return handleRefresh();
}