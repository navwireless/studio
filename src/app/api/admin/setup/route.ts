// src/app/api/admin/setup/route.ts
// One-time admin setup API route
// Usage: POST /api/admin/setup with body { email, secret }
// The secret must match NEXTAUTH_SECRET for security

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, secret } = body;

        if (!email || !secret) {
            return NextResponse.json(
                { error: "Missing email or secret" },
                { status: 400 }
            );
        }

        // Verify secret matches NEXTAUTH_SECRET
        if (secret !== process.env.NEXTAUTH_SECRET) {
            return NextResponse.json(
                { error: "Invalid secret" },
                { status: 403 }
            );
        }

        const firestore = db();

        const snapshot = await firestore
            .collection("users")
            .where("email", "==", email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return NextResponse.json(
                { error: `No user found with email: ${email}. Sign in first.` },
                { status: 404 }
            );
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        if (userData.role === "admin" && userData.status === "approved") {
            return NextResponse.json({
                message: "User is already an admin",
                userId: userDoc.id,
            });
        }

        await firestore.collection("users").doc(userDoc.id).update({
            role: "admin",
            status: "approved",
            approvedBy: "api_setup",
            approvedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        return NextResponse.json({
            message: `${email} is now an admin`,
            userId: userDoc.id,
        });
    } catch (err) {
        console.error("ADMIN_SETUP_ERROR:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}