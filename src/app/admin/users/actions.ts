// src/app/admin/users/actions.ts
"use server";

import { db } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { verifyAdmin, logAdminAction, adjustUserCredits } from "@/lib/admin";
import type { FirestoreUser } from "@/types/auth";

// ============================================
// Types
// ============================================

export interface AdminUserItem {
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
    lastLoginAt: string;
}

export interface PaginatedUsers {
    items: AdminUserItem[];
    total: number;
    page: number;
    pageSize: number;
}

// ============================================
// Get Users (paginated, filtered, searchable)
// ============================================

export async function getAdminUsers(
    page: number = 1,
    pageSize: number = 20,
    statusFilter?: string,
    searchQuery?: string
): Promise<{ success: true; data: PaginatedUsers } | { success: false; error: string }> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();

        if (searchQuery && searchQuery.trim().length > 0) {
            // Search mode: fetch up to 500 users matching filter, then search in-memory
            const query = searchQuery.trim().toLowerCase();
            let baseRef: FirebaseFirestore.Query = firestore.collection("users");

            if (statusFilter && statusFilter !== "all") {
                baseRef = baseRef.where("status", "==", statusFilter);
            }

            const snapshot = await baseRef.orderBy("createdAt", "desc").limit(500).get();

            const allMatching = snapshot.docs
                .map((doc) => {
                    const data = doc.data() as FirestoreUser;
                    return { id: doc.id, ...data };
                })
                .filter((u) => {
                    const emailMatch = u.email.toLowerCase().includes(query);
                    const nameMatch = u.displayName?.toLowerCase().includes(query) ?? false;
                    return emailMatch || nameMatch;
                });

            const total = allMatching.length;
            const offset = (page - 1) * pageSize;
            const paged = allMatching.slice(offset, offset + pageSize);

            const items: AdminUserItem[] = paged.map((u) => ({
                id: u.id,
                email: u.email,
                displayName: u.displayName,
                photoURL: u.photoURL,
                role: u.role,
                status: u.status,
                plan: u.plan,
                credits: u.credits,
                totalCreditsUsed: u.totalCreditsUsed,
                createdAt: u.createdAt.toDate().toISOString(),
                lastLoginAt: u.lastLoginAt.toDate().toISOString(),
            }));

            return { success: true, data: { items, total, page, pageSize } };
        }

        // Non-search mode: use Firestore pagination
        let baseRef: FirebaseFirestore.Query = firestore.collection("users");

        if (statusFilter && statusFilter !== "all") {
            baseRef = baseRef.where("status", "==", statusFilter);
        }

        const countSnap = await baseRef.count().get();
        const total = countSnap.data().count;

        const offset = (page - 1) * pageSize;
        const snapshot = await baseRef
            .orderBy("createdAt", "desc")
            .offset(offset)
            .limit(pageSize)
            .get();

        const items: AdminUserItem[] = snapshot.docs.map((doc) => {
            const data = doc.data() as FirestoreUser;
            return {
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
                lastLoginAt: data.lastLoginAt.toDate().toISOString(),
            };
        });

        return { success: true, data: { items, total, page, pageSize } };
    } catch (err) {
        console.error("ADMIN_GET_USERS_ERROR:", err);
        return { success: false, error: "Failed to load users" };
    }
}

// ============================================
// Approve User
// ============================================

export async function approveUser(
    targetUserId: string
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        const userRef = firestore.collection("users").doc(targetUserId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) return { success: false, error: "User not found" };

        const userData = userDoc.data() as FirestoreUser;
        const previousStatus = userData.status;

        await userRef.update({
            status: "approved",
            approvedBy: auth.admin.adminId,
            approvedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        await logAdminAction(auth.admin, "approve_user", targetUserId, userData.email, {
            previousStatus,
            newStatus: "approved",
        });

        return { success: true };
    } catch (err) {
        console.error("ADMIN_APPROVE_USER_ERROR:", err);
        return { success: false, error: "Failed to approve user" };
    }
}

// ============================================
// Reject User
// ============================================

export async function rejectUser(
    targetUserId: string
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        const userRef = firestore.collection("users").doc(targetUserId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) return { success: false, error: "User not found" };

        const userData = userDoc.data() as FirestoreUser;
        const previousStatus = userData.status;

        await userRef.update({
            status: "rejected",
            updatedAt: Timestamp.now(),
        });

        await logAdminAction(auth.admin, "reject_user", targetUserId, userData.email, {
            previousStatus,
            newStatus: "rejected",
        });

        return { success: true };
    } catch (err) {
        console.error("ADMIN_REJECT_USER_ERROR:", err);
        return { success: false, error: "Failed to reject user" };
    }
}

// ============================================
// Suspend User
// ============================================

export async function suspendUser(
    targetUserId: string
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        const userRef = firestore.collection("users").doc(targetUserId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) return { success: false, error: "User not found" };

        const userData = userDoc.data() as FirestoreUser;
        const previousStatus = userData.status;

        await userRef.update({
            status: "suspended",
            updatedAt: Timestamp.now(),
        });

        await logAdminAction(auth.admin, "suspend_user", targetUserId, userData.email, {
            previousStatus,
            newStatus: "suspended",
        });

        return { success: true };
    } catch (err) {
        console.error("ADMIN_SUSPEND_USER_ERROR:", err);
        return { success: false, error: "Failed to suspend user" };
    }
}

// ============================================
// Reactivate User
// ============================================

export async function reactivateUser(
    targetUserId: string
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        const userRef = firestore.collection("users").doc(targetUserId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) return { success: false, error: "User not found" };

        const userData = userDoc.data() as FirestoreUser;
        const previousStatus = userData.status;

        await userRef.update({
            status: "approved",
            approvedBy: auth.admin.adminId,
            approvedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        await logAdminAction(auth.admin, "reactivate_user", targetUserId, userData.email, {
            previousStatus,
            newStatus: "approved",
        });

        return { success: true };
    } catch (err) {
        console.error("ADMIN_REACTIVATE_USER_ERROR:", err);
        return { success: false, error: "Failed to reactivate user" };
    }
}

// ============================================
// Change User Role
// ============================================

export async function changeUserRole(
    targetUserId: string,
    newRole: "user" | "admin"
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        const userRef = firestore.collection("users").doc(targetUserId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) return { success: false, error: "User not found" };

        const userData = userDoc.data() as FirestoreUser;
        const previousRole = userData.role;

        await userRef.update({
            role: newRole,
            updatedAt: Timestamp.now(),
        });

        await logAdminAction(auth.admin, "change_role", targetUserId, userData.email, {
            previousRole,
            newRole,
        });

        return { success: true };
    } catch (err) {
        console.error("ADMIN_CHANGE_ROLE_ERROR:", err);
        return { success: false, error: "Failed to change user role" };
    }
}

// ============================================
// Adjust Credits (wraps lib/admin.ts)
// ============================================

export async function adminAdjustCredits(
    targetUserId: string,
    amount: number,
    reason: string
): Promise<{ success: true; newBalance: number } | { success: false; error: string }> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        return await adjustUserCredits(auth.admin, targetUserId, amount, reason);
    } catch (err) {
        console.error("ADMIN_ADJUST_CREDITS_ERROR:", err);
        return { success: false, error: "Failed to adjust credits" };
    }
}

// ============================================
// Bulk Approve
// ============================================

export async function bulkApproveUsers(
    targetUserIds: string[]
): Promise<{ success: true; count: number } | { success: false; error: string }> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        let approvedCount = 0;

        for (const userId of targetUserIds) {
            const userRef = firestore.collection("users").doc(userId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) continue;

            const userData = userDoc.data() as FirestoreUser;
            const previousStatus = userData.status;

            await userRef.update({
                status: "approved",
                approvedBy: auth.admin.adminId,
                approvedAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            approvedCount++;

            await logAdminAction(auth.admin, "bulk_approve", userId, userData.email, {
                previousStatus,
                newStatus: "approved",
                batchSize: targetUserIds.length,
            });
        }

        return { success: true, count: approvedCount };
    } catch (err) {
        console.error("ADMIN_BULK_APPROVE_ERROR:", err);
        return { success: false, error: "Failed to bulk approve users" };
    }
}

// ============================================
// Bulk Reject
// ============================================

export async function bulkRejectUsers(
    targetUserIds: string[]
): Promise<{ success: true; count: number } | { success: false; error: string }> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        let rejectedCount = 0;

        for (const userId of targetUserIds) {
            const userRef = firestore.collection("users").doc(userId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) continue;

            const userData = userDoc.data() as FirestoreUser;
            const previousStatus = userData.status;

            await userRef.update({
                status: "rejected",
                updatedAt: Timestamp.now(),
            });

            rejectedCount++;

            await logAdminAction(auth.admin, "bulk_reject", userId, userData.email, {
                previousStatus,
                newStatus: "rejected",
                batchSize: targetUserIds.length,
            });
        }

        return { success: true, count: rejectedCount };
    } catch (err) {
        console.error("ADMIN_BULK_REJECT_ERROR:", err);
        return { success: false, error: "Failed to bulk reject users" };
    }
}