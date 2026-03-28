// src/lib/razorpay.ts
// Server-only Razorpay utility functions
import Razorpay from "razorpay";
import crypto from "crypto";

// ============================================
// Environment validation
// ============================================

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error(
        "RAZORPAY_CONFIG_ERROR: Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment variables."
    );
}

// ============================================
// Razorpay Instance (lazy singleton)
// ============================================

let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
    if (!razorpayInstance) {
        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            throw new Error("Razorpay API keys are not configured.");
        }
        razorpayInstance = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
}

// ============================================
// Create Order
// ============================================

export interface CreateOrderResult {
    orderId: string;
    amount: number;
    currency: string;
    key: string;
}

/**
 * Creates a Razorpay order for ₹500 Pro subscription.
 * Amount is in paise (50000 = ₹500).
 */
export async function createOrder(
    userId: string,
    userEmail: string
): Promise<CreateOrderResult> {
    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
        amount: 50000, // ₹500 in paise
        currency: "INR",
        receipt: `pro_${userId}_${Date.now()}`,
        notes: {
            userId,
            userEmail,
            plan: "pro",
            description: "FindLOS Pro Monthly Subscription",
        },
    });

    return {
        orderId: order.id,
        amount: order.amount as number,
        currency: order.currency,
        key: RAZORPAY_KEY_ID!,
    };
}

// ============================================
// Verify Payment Signature
// ============================================

/**
 * Verifies Razorpay payment signature using HMAC-SHA256.
 * Returns true if signature is valid.
 */
export function verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    if (!RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay key secret is not configured.");
    }

    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    return expectedSignature === signature;
}

// ============================================
// Verify Webhook Signature
// ============================================

/**
 * Verifies Razorpay webhook signature.
 * Returns true if valid.
 */
export function verifyWebhookSignature(
    body: string,
    signature: string
): boolean {
    if (!RAZORPAY_WEBHOOK_SECRET) {
        console.error("RAZORPAY_WEBHOOK_ERROR: Webhook secret not configured.");
        return false;
    }

    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

    return expectedSignature === signature;
}

// ============================================
// Fetch Payment Details (for webhook backup)
// ============================================

export async function fetchPaymentDetails(paymentId: string) {
    const razorpay = getRazorpay();
    return razorpay.payments.fetch(paymentId);
}