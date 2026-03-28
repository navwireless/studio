// src/app/api/razorpay/create-order/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createOrder } from "@/lib/razorpay";
import { getUserById } from "@/lib/firestore";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";

/**
 * Safely convert a Firestore Timestamp or other date-like value to a JS Date.
 */
function toDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (
        typeof value === "object" &&
        value !== null &&
        "toDate" in value &&
        typeof (value as { toDate: () => Date }).toDate === "function"
    ) {
        return (value as { toDate: () => Date }).toDate();
    }
    if (typeof value === "string" || typeof value === "number") {
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d;
    }
    return null;
}

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || !session?.user?.email) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Rate limiting
        const rateCheck = checkRateLimit(session.user.id, "createOrder");
        if (!rateCheck.allowed) {
            return rateLimitResponse(rateCheck);
        }

        // Check actual Firestore state (not just JWT which might be stale)
        const user = await getUserById(session.user.id);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Duplicate payment prevention: check if user already has active pro plan
        if (user.plan === "pro" && user.planExpiresAt) {
            const expiresAt = toDate(user.planExpiresAt);

            if (expiresAt && expiresAt > new Date()) {
                return NextResponse.json(
                    {
                        error: "You already have an active Pro plan",
                        expiresAt: expiresAt.toISOString(),
                    },
                    { status: 400 }
                );
            }
        }

        const order = await createOrder(session.user.id, session.user.email);

        return NextResponse.json({
            success: true,
            orderId: order.orderId,
            amount: order.amount,
            currency: order.currency,
            key: order.key,
        });
    } catch (err) {
        console.error("RAZORPAY_CREATE_ORDER_ERROR:", err);
        const message =
            err instanceof Error ? err.message : "Failed to create order";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}