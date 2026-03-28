// src/app/api/razorpay/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { db } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { logCreditTransaction } from "@/lib/firestore";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || !session?.user?.email) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Rate limiting
        const rateCheck = checkRateLimit(session.user.id, "verifyPayment");
        if (!rateCheck.allowed) {
            return rateLimitResponse(rateCheck);
        }

        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: "Missing payment verification parameters" },
                { status: 400 }
            );
        }

        // Verify signature
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            console.error(
                `RAZORPAY_VERIFY_FAILED: Invalid signature for order ${razorpay_order_id}, payment ${razorpay_payment_id}, user ${session.user.id}`
            );
            return NextResponse.json(
                { error: "Payment verification failed. Invalid signature." },
                { status: 400 }
            );
        }

        // Duplicate verification prevention
        const firestore = db();
        const existingSubscription = await firestore
            .collection("subscriptions")
            .where("razorpayOrderId", "==", razorpay_order_id)
            .limit(1)
            .get();

        if (!existingSubscription.empty) {
            const existingSub = existingSubscription.docs[0].data();
            console.log(
                `RAZORPAY_VERIFY_DUPLICATE: Order ${razorpay_order_id} already verified for user ${session.user.id}`
            );
            return NextResponse.json({
                success: true,
                message: "Payment already verified. Pro plan is active.",
                expiresAt: existingSub.endDate
                    ? typeof existingSub.endDate.toDate === "function"
                        ? existingSub.endDate.toDate().toISOString()
                        : new Date(existingSub.endDate).toISOString()
                    : null,
                duplicate: true,
            });
        }

        // Signature is valid — activate Pro plan
        const userId = session.user.id;
        const now = Timestamp.now();
        const expiresAt = Timestamp.fromDate(
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );

        // Update user document atomically
        await firestore.runTransaction(async (transaction) => {
            const userRef = firestore.collection("users").doc(userId);
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                throw new Error("User not found");
            }

            transaction.update(userRef, {
                plan: "pro",
                planExpiresAt: expiresAt,
                updatedAt: now,
            });
        });

        // Create subscription document
        await firestore.collection("subscriptions").add({
            userId,
            plan: "pro",
            amount: 500,
            currency: "INR",
            status: "active",
            startDate: now,
            endDate: expiresAt,
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            createdAt: now,
            cancelledAt: null,
        });

        // Log credit transaction
        const userData = await firestore
            .collection("users")
            .doc(userId)
            .get();
        const credits = userData.data()?.credits ?? 0;

        await logCreditTransaction({
            userId,
            type: "pro_subscription",
            amount: 0,
            balanceBefore: credits,
            balanceAfter: credits,
            reason:
                "Pro plan activated — ₹500/month (Payment: " +
                razorpay_payment_id +
                ")",
            performedBy: null,
            relatedAnalysisId: null,
        });

        console.log(
            `RAZORPAY_PAYMENT_SUCCESS: User ${session.user.email} (${userId}) upgraded to Pro. Payment: ${razorpay_payment_id}, Order: ${razorpay_order_id}`
        );

        return NextResponse.json({
            success: true,
            message: "Pro plan activated successfully",
            expiresAt: expiresAt.toDate().toISOString(),
        });
    } catch (err) {
        console.error("RAZORPAY_VERIFY_ERROR:", err);
        const message =
            err instanceof Error ? err.message : "Payment verification failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}