// src/lib/credits.ts
// Server-only credit checking and deduction utilities
import { db } from "@/lib/firebaseAdmin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import type { FirestoreUser, AnalysisType, AnalysisHistoryDoc } from "@/types/auth";
import { logCreditTransaction } from "@/lib/firestore";

// ============================================
// Credit cost configuration
// ============================================

export function getCreditCost(analysisType: AnalysisType): number {
    switch (analysisType) {
        case "single_los":
            return 1;
        case "fiber_path":
            return 1;
        case "bulk_los":
            return 1; // per pair — caller is responsible for multiplying
        default:
            return 1;
    }
}

// ============================================
// Credit check + atomic deduction
// ============================================

export interface CreditCheckResult {
    success: boolean;
    creditsRemaining: number;
    error?: string;
}

/**
 * Atomically checks user status/credits and deducts if eligible.
 * Uses a Firestore transaction for safety.
 *
 * - Pro users with a valid plan expiry get unlimited usage (no deduction).
 * - Free users must have status === 'approved' and credits > 0.
 */
export async function checkAndDeductCredit(
    userId: string,
    analysisType: AnalysisType
): Promise<CreditCheckResult> {
    const firestore = db();
    const userRef = firestore.collection("users").doc(userId);
    const cost = getCreditCost(analysisType);

    try {
        const result = await firestore.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                return { success: false, creditsRemaining: 0, error: "User account not found." };
            }

            const userData = userDoc.data() as FirestoreUser;

            // Check account status
            if (userData.status !== "approved") {
                const statusMessages: Record<string, string> = {
                    pending_approval: "Your account is pending admin approval. Please wait for approval before running analyses.",
                    suspended: "Your account has been suspended. Please contact support.",
                    rejected: "Your account request was not approved. Please contact support.",
                };
                return {
                    success: false,
                    creditsRemaining: userData.credits,
                    error: statusMessages[userData.status] || "Your account is not approved for analysis.",
                };
            }

            // Pro plan with valid expiry → unlimited
            if (userData.plan === "pro" && userData.planExpiresAt) {
                const expiresAt = userData.planExpiresAt.toDate();
                if (expiresAt > new Date()) {
                    // Pro user — don't deduct credits, just track usage
                    transaction.update(userRef, {
                        totalCreditsUsed: FieldValue.increment(cost),
                        updatedAt: Timestamp.now(),
                    });
                    return { success: true, creditsRemaining: userData.credits };
                }
                // Plan expired — fall through to credit-based check
            }

            // Free plan / expired pro — check credits
            if (userData.credits < cost) {
                return {
                    success: false,
                    creditsRemaining: userData.credits,
                    error: `Not enough credits. You have ${userData.credits} credit(s) but need ${cost}. Upgrade to Pro for unlimited analyses.`,
                };
            }

            const newBalance = userData.credits - cost;

            transaction.update(userRef, {
                credits: newBalance,
                totalCreditsUsed: FieldValue.increment(cost),
                updatedAt: Timestamp.now(),
            });

            return {
                success: true,
                creditsRemaining: newBalance,
                balanceBefore: userData.credits,
            };
        });

        // If deduction happened (free user), log the credit transaction outside the Firestore transaction
        if (
            result.success &&
            "balanceBefore" in result &&
            typeof result.balanceBefore === "number"
        ) {
            await logCreditTransaction({
                userId,
                type: "analysis_deduction",
                amount: -cost,
                balanceBefore: result.balanceBefore,
                balanceAfter: result.creditsRemaining,
                reason: `Analysis: ${analysisType}`,
                performedBy: null,
                relatedAnalysisId: null,
            });
        }

        return {
            success: result.success,
            creditsRemaining: result.creditsRemaining,
            error: result.error,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`CREDIT_CHECK_ERROR: Failed for user ${userId}:`, errorMessage);
        return {
            success: false,
            creditsRemaining: 0,
            error: "An error occurred while processing credits. Please try again.",
        };
    }
}

// ============================================
// Get fresh credits from Firestore
// ============================================

export async function getUserCredits(userId: string): Promise<number> {
    const firestore = db();
    const doc = await firestore.collection("users").doc(userId).get();
    if (!doc.exists) return 0;
    const data = doc.data() as FirestoreUser;
    return data.credits;
}

// ============================================
// Log analysis to history
// ============================================

/**
 * Logs an analysis to the analysisHistory Firestore collection.
 * @param userId - User who ran the analysis
 * @param userEmail - User's email
 * @param analysisType - Type of analysis performed
 * @param pointA - Site A details
 * @param pointB - Site B details
 * @param resultSummary - Summary of analysis results including optional device selection
 * @returns Firestore document ID of the created log entry
 */
export async function logAnalysisHistory(
    userId: string,
    userEmail: string,
    analysisType: AnalysisType,
    pointA: { name: string; lat: number; lng: number; towerHeight: number },
    pointB: { name: string; lat: number; lng: number; towerHeight: number },
    resultSummary: {
        isFeasible: boolean;
        distance: number;
        minClearance: number | null;
        additionalHeightNeeded: number | null;
        selectedDeviceId?: string | null;
    }
): Promise<string> {
    const firestore = db();
    const now = Timestamp.now();
    const cost = getCreditCost(analysisType);

    const doc: AnalysisHistoryDoc = {
        userId,
        userEmail,
        analysisType,
        pointA,
        pointB,
        resultSummary,
        creditsCost: cost,
        createdAt: now,
    };

    const ref = await firestore.collection("analysisHistory").add(doc);
    return ref.id;
}