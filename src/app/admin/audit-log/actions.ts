// src/app/admin/audit-log/actions.ts
"use server";

import { db } from "@/lib/firebaseAdmin";
import { verifyAdmin } from "@/lib/admin";
import type { AdminLogDoc } from "@/types/auth";

// ============================================
// Types
// ============================================

export interface AuditLogItem {
    id: string;
    adminId: string;
    adminEmail: string;
    action: string;
    targetUserId: string | null;
    targetUserEmail: string | null;
    details: Record<string, unknown> | null;
    createdAt: string;
}

export interface PaginatedAuditLogs {
    items: AuditLogItem[];
    total: number;
    page: number;
    pageSize: number;
}

// ============================================
// Get Admin Audit Log
// ============================================

export async function getAdminAuditLog(
    page: number = 1,
    pageSize: number = 25
): Promise<
    { success: true; data: PaginatedAuditLogs } | { success: false; error: string }
> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        const baseRef = firestore.collection("adminLogs");

        const countSnap = await baseRef.count().get();
        const total = countSnap.data().count;

        const offset = (page - 1) * pageSize;
        const snapshot = await baseRef
            .orderBy("createdAt", "desc")
            .offset(offset)
            .limit(pageSize)
            .get();

        const items: AuditLogItem[] = snapshot.docs.map((doc) => {
            const data = doc.data() as AdminLogDoc;
            return {
                id: doc.id,
                adminId: data.adminId,
                adminEmail: data.adminEmail,
                action: data.action,
                targetUserId: data.targetUserId,
                targetUserEmail: data.targetUserEmail,
                details: data.details,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });

        return {
            success: true,
            data: { items, total, page, pageSize },
        };
    } catch (err) {
        console.error("ADMIN_AUDIT_LOG_ERROR:", err);
        return { success: false, error: "Failed to load audit log" };
    }
}