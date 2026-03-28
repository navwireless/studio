// src/app/admin/credit-logs/actions.ts
"use server";

import { db } from "@/lib/firebaseAdmin";
import { verifyAdmin } from "@/lib/admin";
import type { CreditTransactionDoc } from "@/types/auth";

// ============================================
// Types
// ============================================

export interface CreditLogItem {
    id: string;
    userId: string;
    userEmail: string;
    type: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reason: string;
    performedBy: string | null;
    createdAt: string;
}

export interface PaginatedCreditLogs {
    items: CreditLogItem[];
    total: number;
    page: number;
    pageSize: number;
}

// ============================================
// Get All Credit Transactions
// ============================================

export async function getAllCreditTransactions(
    page: number = 1,
    pageSize: number = 25,
    filters?: {
        userEmail?: string;
        type?: string;
    }
): Promise<
    { success: true; data: PaginatedCreditLogs } | { success: false; error: string }
> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();

        // Type filter can be applied at Firestore level
        // userEmail requires joining with users collection or in-memory filter
        const needsInMemoryFilter =
            filters?.userEmail && filters.userEmail.trim().length > 0;

        if (needsInMemoryFilter) {
            // First find matching user IDs
            const userQuery = filters!.userEmail!.trim().toLowerCase();
            const usersSnap = await firestore
                .collection("users")
                .orderBy("email")
                .limit(500)
                .get();

            const matchingUserIds = new Set<string>();
            const userEmailMap = new Map<string, string>();

            usersSnap.docs.forEach((doc) => {
                const email = (doc.data().email as string) || "";
                userEmailMap.set(doc.id, email);
                if (email.toLowerCase().includes(userQuery)) {
                    matchingUserIds.add(doc.id);
                }
            });

            if (matchingUserIds.size === 0) {
                return {
                    success: true,
                    data: { items: [], total: 0, page, pageSize },
                };
            }

            // Fetch transactions for matching users
            let baseRef: FirebaseFirestore.Query = firestore.collection("creditTransactions");

            if (filters?.type && filters.type !== "all") {
                baseRef = baseRef.where("type", "==", filters.type);
            }

            const snapshot = await baseRef
                .orderBy("createdAt", "desc")
                .limit(1000)
                .get();

            const allItems = snapshot.docs
                .map((doc) => {
                    const data = doc.data() as CreditTransactionDoc;
                    return {
                        id: doc.id,
                        userId: data.userId,
                        userEmail: userEmailMap.get(data.userId) || "unknown",
                        type: data.type,
                        amount: data.amount,
                        balanceBefore: data.balanceBefore,
                        balanceAfter: data.balanceAfter,
                        reason: data.reason,
                        performedBy: data.performedBy,
                        createdAt: data.createdAt.toDate().toISOString(),
                    };
                })
                .filter((item) => matchingUserIds.has(item.userId));

            const total = allItems.length;
            const offset = (page - 1) * pageSize;
            const paged = allItems.slice(offset, offset + pageSize);

            return {
                success: true,
                data: { items: paged, total, page, pageSize },
            };
        }

        // No email filter — use Firestore pagination
        let baseRef: FirebaseFirestore.Query = firestore.collection("creditTransactions");

        if (filters?.type && filters.type !== "all") {
            baseRef = baseRef.where("type", "==", filters.type);
        }

        const countSnap = await baseRef.count().get();
        const total = countSnap.data().count;

        const offset = (page - 1) * pageSize;
        const snapshot = await baseRef
            .orderBy("createdAt", "desc")
            .offset(offset)
            .limit(pageSize)
            .get();

        // We need user emails — batch lookup
        const userIds = new Set<string>();
        snapshot.docs.forEach((doc) => {
            userIds.add((doc.data() as CreditTransactionDoc).userId);
        });

        const userEmailMap = new Map<string, string>();
        const userIdArray = Array.from(userIds);

        // Firestore getAll for batch lookup
        if (userIdArray.length > 0) {
            const userRefs = userIdArray.map((id) =>
                firestore.collection("users").doc(id)
            );
            const userDocs = await firestore.getAll(...userRefs);
            userDocs.forEach((doc) => {
                if (doc.exists) {
                    userEmailMap.set(doc.id, (doc.data()!.email as string) || "unknown");
                }
            });
        }

        const items: CreditLogItem[] = snapshot.docs.map((doc) => {
            const data = doc.data() as CreditTransactionDoc;
            return {
                id: doc.id,
                userId: data.userId,
                userEmail: userEmailMap.get(data.userId) || "unknown",
                type: data.type,
                amount: data.amount,
                balanceBefore: data.balanceBefore,
                balanceAfter: data.balanceAfter,
                reason: data.reason,
                performedBy: data.performedBy,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });

        return {
            success: true,
            data: { items, total, page, pageSize },
        };
    } catch (err) {
        console.error("ADMIN_CREDIT_LOGS_ERROR:", err);
        return { success: false, error: "Failed to load credit logs" };
    }
}