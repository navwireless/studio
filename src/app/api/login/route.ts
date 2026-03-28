// src/app/api/login/route.ts
// This route is deprecated. Authentication is handled by NextAuth at /api/auth/[...nextauth]
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Authentication is handled via /api/auth. Please use the sign-in page." },
    { status: 301 }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "Authentication is handled via /api/auth. Please use the sign-in page." },
    { status: 301 }
  );
}