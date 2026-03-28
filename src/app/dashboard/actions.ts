// src/app/dashboard/actions.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/lib/firebaseAdmin";
import type { AnalysisHistoryDoc, SubscriptionDoc } from "@/types/auth";

// ============================================
// Types
// ============================================

export interface DashboardStats {
    totalAnalyses: number;
    creditsUsed: number;
    creditsRemaining: number;
    totalCreditsGranted: number;
    lastAnalysisAt: string | null;
    plan: string;
    planExpiresAt: string | null;
    status: string;
    memberSince: string;
}

export interface AnalysisHistoryItem {
    id: string;
    analysisType: string;
    pointAName: string;
    pointBName: string;
    distance: number;
    isFeasible: boolean;
    creditsCost: number;
    createdAt: string;
}

export interface PaginatedHistory {
    items: AnalysisHistoryItem[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export interface SubscriptionHistoryItem {
    id: string;
    plan: string;
    amount: number;
    currency: string;
    status: string;
    startDate: string;
    endDate: string;
    razorpayPaymentId: string | null;
    createdAt: string;
}

// ============================================
// Dashboard Stats
// ============================================

export async function getDashboardStats(): Promise<
    { success: true; data: DashboardStats } | { success: false; error: string }
> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const firestore = db();
        const userId = session.user.id;

        // Get user doc
        const userDoc = await firestore.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return { success: false, error: "User not found" };
        }
        const userData = userDoc.data()!;

        // Count total analyses
        const analysisSnapshot = await firestore
            .collection("analysisHistory")
            .where("userId", "==", userId)
            .count()
            .get();
        const totalAnalyses = analysisSnapshot.data().count;

        // Get last analysis
        const lastAnalysisSnapshot = await firestore
            .collection("analysisHistory")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .limit(1)
            .get();

        let lastAnalysisAt: string | null = null;
        if (!lastAnalysisSnapshot.empty) {
            const lastDoc = lastAnalysisSnapshot.docs[0].data() as AnalysisHistoryDoc;
            lastAnalysisAt = lastDoc.createdAt.toDate().toISOString();
        }

        // Calculate total credits granted from transactions
        const grantSnapshot = await firestore
            .collection("creditTransactions")
            .where("userId", "==", userId)
            .where("amount", ">", 0)
            .get();

        let totalGranted = 0;
        grantSnapshot.forEach((doc) => {
            totalGranted += doc.data().amount;
        });

        // Get plan expiry
        let planExpiresAt: string | null = null;
        if (userData.planExpiresAt) {
            planExpiresAt = userData.planExpiresAt.toDate().toISOString();
        }

        const stats: DashboardStats = {
            totalAnalyses,
            creditsUsed: userData.totalCreditsUsed || 0,
            creditsRemaining: userData.credits || 0,
            totalCreditsGranted: totalGranted,
            lastAnalysisAt,
            plan: userData.plan || "free",
            planExpiresAt,
            status: userData.status || "pending_approval",
            memberSince: userData.createdAt?.toDate().toISOString() || new Date().toISOString(),
        };

        return { success: true, data: stats };
    } catch (err) {
        console.error("DASHBOARD_STATS_ERROR:", err);
        return { success: false, error: "Failed to load dashboard stats" };
    }
}

// ============================================
// Analysis History (paginated)
// ============================================

export async function getAnalysisHistory(
    page: number = 1,
    pageSize: number = 10,
    filterType?: string
): Promise<
    { success: true; data: PaginatedHistory } | { success: false; error: string }
> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const firestore = db();
        const userId = session.user.id;

        // Build query
        let baseQuery = firestore
            .collection("analysisHistory")
            .where("userId", "==", userId) as FirebaseFirestore.Query;

        if (filterType && filterType !== "all") {
            baseQuery = baseQuery.where("analysisType", "==", filterType);
        }

        // Get total count
        const countSnapshot = await baseQuery.count().get();
        const total = countSnapshot.data().count;

        // Get paginated results
        const offset = (page - 1) * pageSize;
        const snapshot = await baseQuery
            .orderBy("createdAt", "desc")
            .offset(offset)
            .limit(pageSize)
            .get();

        const items: AnalysisHistoryItem[] = snapshot.docs.map((doc) => {
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

        return {
            success: true,
            data: {
                items,
                total,
                page,
                pageSize,
                hasMore: offset + items.length < total,
            },
        };
    } catch (err) {
        console.error("ANALYSIS_HISTORY_ERROR:", err);
        return { success: false, error: "Failed to load analysis history" };
    }
}

// ============================================
// Subscription History
// ============================================

export async function getSubscriptionHistory(): Promise<
    { success: true; data: SubscriptionHistoryItem[] } | { success: false; error: string }
> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const firestore = db();
        const userId = session.user.id;

        const snapshot = await firestore
            .collection("subscriptions")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .limit(10)
            .get();

        const items: SubscriptionHistoryItem[] = snapshot.docs.map((doc) => {
            const data = doc.data() as SubscriptionDoc;
            return {
                id: doc.id,
                plan: data.plan,
                amount: data.amount,
                currency: data.currency,
                status: data.status,
                startDate: data.startDate.toDate().toISOString(),
                endDate: data.endDate.toDate().toISOString(),
                razorpayPaymentId: data.razorpayPaymentId,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });

        return { success: true, data: items };
    } catch (err) {
        console.error("SUBSCRIPTION_HISTORY_ERROR:", err);
        return { success: false, error: "Failed to load subscription history" };
    }
}

// ============================================
// Export History as CSV
// ============================================

export async function exportHistoryCsv(): Promise<
    { success: true; data: string } | { success: false; error: string }
> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const firestore = db();
        const userId = session.user.id;

        const snapshot = await firestore
            .collection("analysisHistory")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        if (snapshot.empty) {
            return { success: false, error: "No analysis history to export" };
        }

        const headers = [
            "Date",
            "Type",
            "Site A",
            "Site A Lat",
            "Site A Lng",
            "Site A Height (m)",
            "Site B",
            "Site B Lat",
            "Site B Lng",
            "Site B Height (m)",
            "Distance (km)",
            "Feasible",
            "Min Clearance (m)",
            "Additional Height Needed (m)",
            "Credits Used",
        ].join(",");

        const rows = snapshot.docs.map((doc) => {
            const d = doc.data() as AnalysisHistoryDoc;
            return [
                d.createdAt.toDate().toISOString(),
                d.analysisType,
                `"${d.pointA.name.replace(/"/g, '""')}"`,
                d.pointA.lat.toFixed(6),
                d.pointA.lng.toFixed(6),
                d.pointA.towerHeight,
                `"${d.pointB.name.replace(/"/g, '""')}"`,
                d.pointB.lat.toFixed(6),
                d.pointB.lng.toFixed(6),
                d.pointB.towerHeight,
                d.resultSummary.distance.toFixed(2),
                d.resultSummary.isFeasible ? "Yes" : "No",
                d.resultSummary.minClearance !== null ? d.resultSummary.minClearance.toFixed(1) : "N/A",
                d.resultSummary.additionalHeightNeeded !== null
                    ? d.resultSummary.additionalHeightNeeded.toFixed(1)
                    : "N/A",
                d.creditsCost,
            ].join(",");
        });

        const csv = [headers, ...rows].join("\n");
        return { success: true, data: csv };
    } catch (err) {
        console.error("EXPORT_CSV_ERROR:", err);
        return { success: false, error: "Failed to export history" };
    }
}