// src/app/admin/users/[userId]/actions.ts
"use server";

import { db } from "@/lib/firebaseAdmin";
import { verifyAdmin } from "@/lib/admin";
import type { FirestoreUser, AnalysisHistoryDoc, CreditTransactionDoc, AdminLogDoc } from "@/types/auth";

// ============================================
// Types
// ============================================

export interface UserDetailData {
    id: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    role: string;
    status: string;
    plan: string;
    credits: number;
    totalCreditsUsed: number;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
    approvedBy: string | null;
    approvedAt: string | null;
}

export interface UserAnalysisItem {
    id: string;
    analysisType: string;
    pointAName: string;
    pointBName: string;
    distance: number;
    isFeasible: boolean;
    creditsCost: number;
    createdAt: string;
}

export interface UserCreditItem {
    id: string;
    type: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reason: string;
    performedBy: string | null;
    createdAt: string;
}

export interface UserAdminLogItem {
    id: string;
    adminEmail: string;
    action: string;
    details: Record<string, unknown> | null;
    createdAt: string;
}

// ============================================
// Get User Detail
// ============================================

export async function getUserDetail(
    userId: string
): Promise<{ success: true; data: UserDetailData } | { success: false; error: string }> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        const doc = await firestore.collection("users").doc(userId).get();

        if (!doc.exists) return { success: false, error: "User not found" };

        const data = doc.data() as FirestoreUser;

        return {
            success: true,
            data: {
                id: doc.id,
                email: data.email,
                displayName: data.displayName,
                photoURL: data.photoURL,
                role: data.role,
                status: data.status,
                plan: data.plan,
                credits: data.credits,
                totalCreditsUsed: data.totalCreditsUsed,
                createdAt: data.createdAt.toDate().toISOString(),
                updatedAt: data.updatedAt.toDate().toISOString(),
                lastLoginAt: data.lastLoginAt.toDate().toISOString(),
                approvedBy: data.approvedBy,
                approvedAt: data.approvedAt?.toDate().toISOString() ?? null,
            },
        };
    } catch (err) {
        console.error("ADMIN_USER_DETAIL_ERROR:", err);
        return { success: false, error: "Failed to load user detail" };
    }
}

// ============================================
// Get User Analysis History
// ============================================

export async function getUserAnalyses(
    userId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<
    { success: true; data: { items: UserAnalysisItem[]; total: number } } | { success: false; error: string }
> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        const baseQuery = firestore.collection("analysisHistory").where("userId", "==", userId);

        const countSnap = await baseQuery.count().get();
        const total = countSnap.data().count;

        const offset = (page - 1) * pageSize;
        const snapshot = await baseQuery
            .orderBy("createdAt", "desc")
            .offset(offset)
            .limit(pageSize)
            .get();

        const items: UserAnalysisItem[] = snapshot.docs.map((doc) => {
            const data = doc.data() as AnalysisHistoryDoc;
            return {
                id: doc.id,
                analysisType: data.analysisType,
                pointAName: data.pointA.name,
                pointBName: data.pointB.name,
                distance: data.resultSummary.distance,
                isFeasible: data.resultSummary.isFeasible,
                creditsCost: data.creditsCost,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });

        return { success: true, data: { items, total } };
    } catch (err) {
        console.error("ADMIN_USER_ANALYSES_ERROR:", err);
        return { success: false, error: "Failed to load user analyses" };
    }
}

// ============================================
// Get User Credit Transactions
// ============================================

export async function getUserCreditTransactions(
    userId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<
    { success: true; data: { items: UserCreditItem[]; total: number } } | { success: false; error: string }
> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        const baseQuery = firestore.collection("creditTransactions").where("userId", "==", userId);

        const countSnap = await baseQuery.count().get();
        const total = countSnap.data().count;

        const offset = (page - 1) * pageSize;
        const snapshot = await baseQuery
            .orderBy("createdAt", "desc")
            .offset(offset)
            .limit(pageSize)
            .get();

        const items: UserCreditItem[] = snapshot.docs.map((doc) => {
            const data = doc.data() as CreditTransactionDoc;
            return {
                id: doc.id,
                type: data.type,
                amount: data.amount,
                balanceBefore: data.balanceBefore,
                balanceAfter: data.balanceAfter,
                reason: data.reason,
                performedBy: data.performedBy,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });

        return { success: true, data: { items, total } };
    } catch (err) {
        console.error("ADMIN_USER_CREDITS_ERROR:", err);
        return { success: false, error: "Failed to load credit transactions" };
    }
}

// ============================================
// Get Admin Actions on User
// ============================================

export async function getUserAdminLogs(
    userId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<
    { success: true; data: { items: UserAdminLogItem[]; total: number } } | { success: false; error: string }
> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        const baseQuery = firestore.collection("adminLogs").where("targetUserId", "==", userId);

        const countSnap = await baseQuery.count().get();
        const total = countSnap.data().count;

        const offset = (page - 1) * pageSize;
        const snapshot = await baseQuery
            .orderBy("createdAt", "desc")
            .offset(offset)
            .limit(pageSize)
            .get();

        const items: UserAdminLogItem[] = snapshot.docs.map((doc) => {
            const data = doc.data() as AdminLogDoc;
            return {
                id: doc.id,
                adminEmail: data.adminEmail,
                action: data.action,
                details: data.details,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });

        return { success: true, data: { items, total } };
    } catch (err) {
        console.error("ADMIN_USER_LOGS_ERROR:", err);
        return { success: false, error: "Failed to load admin logs" };
    }
}