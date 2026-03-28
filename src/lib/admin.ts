// src/lib/admin.ts
// Server-only admin utility functions
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/lib/firebaseAdmin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { logCreditTransaction } from "@/lib/firestore";
import type { AdminAction } from "@/types/auth";

// ============================================
// Admin Verification
// ============================================

export interface AdminContext {
    adminId: string;
    adminEmail: string;
}

export async function verifyAdmin(): Promise<
    { success: true; admin: AdminContext } | { success: false; error: string }
> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }
    if (session.user.role !== "admin") {
        return { success: false, error: "Unauthorized: Admin access required" };
    }
    return {
        success: true,
        admin: {
            adminId: session.user.id,
            adminEmail: session.user.email || "unknown",
        },
    };
}

// ============================================
// Admin Action Logging
// ============================================

export async function logAdminAction(
    admin: AdminContext,
    action: AdminAction,
    targetUserId: string | null,
    targetUserEmail: string | null,
    details: Record<string, unknown> | null
): Promise<string> {
    const firestore = db();
    const ref = await firestore.collection("adminLogs").add({
        adminId: admin.adminId,
        adminEmail: admin.adminEmail,
        action,
        targetUserId,
        targetUserEmail,
        details,
        createdAt: Timestamp.now(),
    });
    return ref.id;
}

// ============================================
// Credit Adjustment (Admin)
// ============================================

export async function adjustUserCredits(
    admin: AdminContext,
    targetUserId: string,
    amount: number,
    reason: string
): Promise<{ success: true; newBalance: number } | { success: false; error: string }> {
    const firestore = db();
    const userRef = firestore.collection("users").doc(targetUserId);

    try {
        const result = await firestore.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error("User not found");
            }

            const userData = userDoc.data()!;
            const currentCredits = userData.credits as number;
            const newBalance = currentCredits + amount;

            if (newBalance < 0) {
                throw new Error(
                    `Cannot remove ${Math.abs(amount)} credits. User only has ${currentCredits}.`
                );
            }

            transaction.update(userRef, {
                credits: newBalance,
                totalCreditsUsed:
                    amount < 0 ? FieldValue.increment(Math.abs(amount)) : userData.totalCreditsUsed,
                updatedAt: Timestamp.now(),
            });

            return {
                newBalance,
                balanceBefore: currentCredits,
                userEmail: userData.email as string,
            };
        });

        await logCreditTransaction({
            userId: targetUserId,
            type: "admin_adjustment",
            amount,
            balanceBefore: result.balanceBefore,
            balanceAfter: result.newBalance,
            reason,
            performedBy: admin.adminId,
            relatedAnalysisId: null,
        });

        const actionType = amount > 0 ? "add_credits" : "remove_credits";
        await logAdminAction(admin, actionType, targetUserId, result.userEmail, {
            amount,
            balanceBefore: result.balanceBefore,
            balanceAfter: result.newBalance,
            reason,
        });

        return { success: true, newBalance: result.newBalance };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("ADMIN_ADJUST_CREDITS_ERROR:", msg);
        return { success: false, error: msg };
    }
}