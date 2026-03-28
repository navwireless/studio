// src/types/auth.ts
import type { Timestamp } from "firebase-admin/firestore";

// ============================================
// Auth & User Enums / Literal Types
// ============================================

export type UserRole = "user" | "admin";
export type UserStatus =
    | "pending_approval"
    | "approved"
    | "suspended"
    | "rejected";
export type UserPlan = "free" | "pro";
export type CreditTransactionType =
    | "initial_grant"
    | "analysis_deduction"
    | "admin_adjustment"
    | "pro_subscription"
    | "refund";
export type AnalysisType = "single_los" | "fiber_path" | "bulk_los";

export type AdminAction =
    | "approve_user"
    | "reject_user"
    | "suspend_user"
    | "reactivate_user"
    | "add_credits"
    | "remove_credits"
    | "change_role"
    | "bulk_approve"
    | "bulk_reject";

// ============================================
// Firestore Document Interfaces
// ============================================

export interface FirestoreUser {
    email: string;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    status: UserStatus;
    credits: number;
    totalCreditsUsed: number;
    plan: UserPlan;
    planExpiresAt: Timestamp | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastLoginAt: Timestamp;
    approvedBy: string | null;
    approvedAt: Timestamp | null;
    metadata: Record<string, unknown> | null;
}

export interface AnalysisHistoryDoc {
    userId: string;
    userEmail: string;
    analysisType: AnalysisType;
    pointA: {
        name: string;
        lat: number;
        lng: number;
        towerHeight: number;
    };
    pointB: {
        name: string;
        lat: number;
        lng: number;
        towerHeight: number;
    };
    resultSummary: {
        isFeasible: boolean;
        distance: number;
        minClearance: number | null;
        additionalHeightNeeded: number | null;
    };
    creditsCost: number;
    createdAt: Timestamp;
}

export interface CreditTransactionDoc {
    userId: string;
    type: CreditTransactionType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reason: string;
    performedBy: string | null;
    relatedAnalysisId: string | null;
    createdAt: Timestamp;
}

export interface AdminLogDoc {
    adminId: string;
    adminEmail: string;
    action: AdminAction;
    targetUserId: string | null;
    targetUserEmail: string | null;
    details: Record<string, unknown> | null;
    createdAt: Timestamp;
}

export interface SubscriptionDoc {
    userId: string;
    plan: UserPlan;
    amount: number;
    currency: string;
    status: string;
    startDate: Timestamp;
    endDate: Timestamp;
    razorpayPaymentId: string | null;
    razorpayOrderId: string | null;
    createdAt: Timestamp;
    cancelledAt: Timestamp | null;
}

// ============================================
// NextAuth Session Extension
// ============================================

export interface SessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
    status: UserStatus;
    credits: number;
    plan: UserPlan;
}