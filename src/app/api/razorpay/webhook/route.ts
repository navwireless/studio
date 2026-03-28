// src/app/api/razorpay/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { db } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { logCreditTransaction } from "@/lib/firestore";

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature");

        if (!signature) {
            console.error("RAZORPAY_WEBHOOK: Missing signature header");
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        // Verify webhook signature
        const isValid = verifyWebhookSignature(rawBody, signature);

        if (!isValid) {
            console.error("RAZORPAY_WEBHOOK: Invalid signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(rawBody);
        const eventType = event.event as string;

        console.log(`RAZORPAY_WEBHOOK: Received event: ${eventType}`);

        switch (eventType) {
            case "payment.captured": {
                await handlePaymentCaptured(event.payload?.payment?.entity);
                break;
            }

            case "payment.failed": {
                const payment = event.payload?.payment?.entity;
                console.log(
                    `RAZORPAY_WEBHOOK: Payment failed — ID: ${payment?.id}, Order: ${payment?.order_id}`
                );
                break;
            }

            case "order.paid": {
                console.log(
                    `RAZORPAY_WEBHOOK: Order paid — ID: ${event.payload?.order?.entity?.id}`
                );
                break;
            }

            default: {
                console.log(`RAZORPAY_WEBHOOK: Unhandled event type: ${eventType}`);
            }
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({ status: "ok" });
    } catch (err) {
        console.error("RAZORPAY_WEBHOOK_ERROR:", err);
        // Still return 200 so Razorpay doesn't retry indefinitely
        return NextResponse.json({ status: "error" }, { status: 200 });
    }
}

/**
 * Handle payment.captured event — backup verification.
 * If the client-side verify-payment already handled this, we skip.
 * If not, we activate the Pro plan.
 */
async function handlePaymentCaptured(payment: Record<string, unknown> | undefined) {
    if (!payment) {
        console.error("RAZORPAY_WEBHOOK: payment.captured — no payment entity");
        return;
    }

    const paymentId = payment.id as string;
    const orderId = payment.order_id as string;
    const notes = payment.notes as Record<string, string> | undefined;
    const userId = notes?.userId;

    if (!userId) {
        console.log(
            `RAZORPAY_WEBHOOK: payment.captured — no userId in notes. Payment: ${paymentId}`
        );
        return;
    }

    const firestore = db();

    // Check if subscription already exists for this payment (client already verified)
    const existingSub = await firestore
        .collection("subscriptions")
        .where("razorpayPaymentId", "==", paymentId)
        .limit(1)
        .get();

    if (!existingSub.empty) {
        console.log(
            `RAZORPAY_WEBHOOK: payment.captured — subscription already exists for payment ${paymentId}. Skipping.`
        );
        return;
    }

    // Activate Pro plan (backup path)
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );

    await firestore.collection("users").doc(userId).update({
        plan: "pro",
        planExpiresAt: expiresAt,
        updatedAt: now,
    });

    await firestore.collection("subscriptions").add({
        userId,
        plan: "pro",
        amount: 500,
        currency: "INR",
        status: "active",
        startDate: now,
        endDate: expiresAt,
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        createdAt: now,
        cancelledAt: null,
    });

    const userData = await firestore.collection("users").doc(userId).get();
    const credits = userData.data()?.credits ?? 0;

    await logCreditTransaction({
        userId,
        type: "pro_subscription",
        amount: 0,
        balanceBefore: credits,
        balanceAfter: credits,
        reason: `Pro plan activated via webhook backup (Payment: ${paymentId})`,
        performedBy: null,
        relatedAnalysisId: null,
    });

    console.log(
        `RAZORPAY_WEBHOOK: Pro plan activated for user ${userId} via webhook backup. Payment: ${paymentId}`
    );
}