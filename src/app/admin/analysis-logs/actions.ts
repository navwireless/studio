// src/app/admin/analysis-logs/actions.ts
"use server";

import { db } from "@/lib/firebaseAdmin";
import { verifyAdmin } from "@/lib/admin";
import type { AnalysisHistoryDoc } from "@/types/auth";

// ============================================
// Types
// ============================================

export interface AnalysisLogItem {
    id: string;
    userId: string;
    userEmail: string;
    analysisType: string;
    pointAName: string;
    pointBName: string;
    distance: number;
    isFeasible: boolean;
    minClearance: number | null;
    additionalHeightNeeded: number | null;
    creditsCost: number;
    createdAt: string;
}

export interface PaginatedAnalysisLogs {
    items: AnalysisLogItem[];
    total: number;
    page: number;
    pageSize: number;
}

// ============================================
// Get All Analysis History
// ============================================

export async function getAllAnalysisHistory(
    page: number = 1,
    pageSize: number = 25,
    filters?: {
        userEmail?: string;
        analysisType?: string;
        result?: string;
    }
): Promise<
    { success: true; data: PaginatedAnalysisLogs } | { success: false; error: string }
> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();

        // If filtering by userEmail or result, we need in-memory filtering
        const needsInMemoryFilter =
            (filters?.userEmail && filters.userEmail.trim().length > 0) ||
            (filters?.result && filters.result !== "all");

        if (needsInMemoryFilter) {
            let baseRef: FirebaseFirestore.Query = firestore.collection("analysisHistory");

            if (filters?.analysisType && filters.analysisType !== "all") {
                baseRef = baseRef.where("analysisType", "==", filters.analysisType);
            }

            const snapshot = await baseRef
                .orderBy("createdAt", "desc")
                .limit(1000)
                .get();

            let allItems = snapshot.docs.map((doc) => {
                const data = doc.data() as AnalysisHistoryDoc;
                return {
                    id: doc.id,
                    userId: data.userId,
                    userEmail: data.userEmail,
                    analysisType: data.analysisType,
                    pointAName: data.pointA.name,
                    pointBName: data.pointB.name,
                    distance: data.resultSummary.distance,
                    isFeasible: data.resultSummary.isFeasible,
                    minClearance: data.resultSummary.minClearance,
                    additionalHeightNeeded: data.resultSummary.additionalHeightNeeded,
                    creditsCost: data.creditsCost,
                    createdAt: data.createdAt.toDate().toISOString(),
                };
            });

            // Apply in-memory filters
            if (filters?.userEmail && filters.userEmail.trim().length > 0) {
                const query = filters.userEmail.trim().toLowerCase();
                allItems = allItems.filter((item) =>
                    item.userEmail.toLowerCase().includes(query)
                );
            }

            if (filters?.result === "pass") {
                allItems = allItems.filter((item) => item.isFeasible);
            } else if (filters?.result === "fail") {
                allItems = allItems.filter((item) => !item.isFeasible);
            }

            const total = allItems.length;
            const offset = (page - 1) * pageSize;
            const paged = allItems.slice(offset, offset + pageSize);

            return {
                success: true,
                data: { items: paged, total, page, pageSize },
            };
        }

        // No in-memory filter needed — use Firestore pagination
        let baseRef: FirebaseFirestore.Query = firestore.collection("analysisHistory");

        if (filters?.analysisType && filters.analysisType !== "all") {
            baseRef = baseRef.where("analysisType", "==", filters.analysisType);
        }

        const countSnap = await baseRef.count().get();
        const total = countSnap.data().count;

        const offset = (page - 1) * pageSize;
        const snapshot = await baseRef
            .orderBy("createdAt", "desc")
            .offset(offset)
            .limit(pageSize)
            .get();

        const items: AnalysisLogItem[] = snapshot.docs.map((doc) => {
            const data = doc.data() as AnalysisHistoryDoc;
            return {
                id: doc.id,
                userId: data.userId,
                userEmail: data.userEmail,
                analysisType: data.analysisType,
                pointAName: data.pointA.name,
                pointBName: data.pointB.name,
                distance: data.resultSummary.distance,
                isFeasible: data.resultSummary.isFeasible,
                minClearance: data.resultSummary.minClearance,
                additionalHeightNeeded: data.resultSummary.additionalHeightNeeded,
                creditsCost: data.creditsCost,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });

        return {
            success: true,
            data: { items, total, page, pageSize },
        };
    } catch (err) {
        console.error("ADMIN_ANALYSIS_LOGS_ERROR:", err);
        return { success: false, error: "Failed to load analysis logs" };
    }
}