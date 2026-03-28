// src/app/admin/actions.ts
"use server";

import { db } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { verifyAdmin } from "@/lib/admin";
import type { FirestoreUser, AnalysisHistoryDoc, SubscriptionDoc } from "@/types/auth";

// ============================================
// Types
// ============================================

export interface AdminDashboardStats {
    totalUsers: number;
    pendingApproval: number;
    approvedUsers: number;
    suspendedUsers: number;
    rejectedUsers: number;
    totalAnalysesToday: number;
    totalAnalysesWeek: number;
    totalAnalysesAllTime: number;
    totalRevenue: number;
    activeProUsers: number;
    monthlyRevenue: number;
}

export interface RecentUserItem {
    id: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    status: string;
    createdAt: string;
}

export interface RecentAnalysisItem {
    id: string;
    userEmail: string;
    analysisType: string;
    pointAName: string;
    pointBName: string;
    distance: number;
    isFeasible: boolean;
    createdAt: string;
}

export interface DailyStatItem {
    date: string;
    label: string;
    signups: number;
    analyses: number;
}

export interface ActivityFeedItem {
    id: string;
    type: "signup" | "analysis" | "admin_action";
    message: string;
    timestamp: string;
}

// ============================================
// Dashboard Stats
// ============================================

export async function getAdminDashboardStats(): Promise<
    { success: true; data: AdminDashboardStats } | { success: false; error: string }
> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const todayTs = Timestamp.fromDate(todayStart);
        const weekTs = Timestamp.fromDate(weekStart);
        const monthTs = Timestamp.fromDate(monthStart);

        const [
            totalSnap,
            pendingSnap,
            approvedSnap,
            suspendedSnap,
            rejectedSnap,
            analysesTodaySnap,
            analysesWeekSnap,
            analysesAllSnap,
            proUsersSnap,
            allSubsSnap,
            monthSubsSnap,
        ] = await Promise.all([
            firestore.collection("users").count().get(),
            firestore.collection("users").where("status", "==", "pending_approval").count().get(),
            firestore.collection("users").where("status", "==", "approved").count().get(),
            firestore.collection("users").where("status", "==", "suspended").count().get(),
            firestore.collection("users").where("status", "==", "rejected").count().get(),
            firestore.collection("analysisHistory").where("createdAt", ">=", todayTs).count().get(),
            firestore.collection("analysisHistory").where("createdAt", ">=", weekTs).count().get(),
            firestore.collection("analysisHistory").count().get(),
            firestore.collection("users").where("plan", "==", "pro").count().get(),
            firestore.collection("subscriptions").where("status", "==", "active").get(),
            firestore.collection("subscriptions").where("createdAt", ">=", monthTs).get(),
        ]);

        // Calculate total revenue from all active subscriptions
        let totalRevenue = 0;
        allSubsSnap.docs.forEach((doc) => {
            const data = doc.data() as SubscriptionDoc;
            totalRevenue += data.amount;
        });

        // Calculate monthly revenue
        let monthlyRevenue = 0;
        monthSubsSnap.docs.forEach((doc) => {
            const data = doc.data() as SubscriptionDoc;
            monthlyRevenue += data.amount;
        });

        const stats: AdminDashboardStats = {
            totalUsers: totalSnap.data().count,
            pendingApproval: pendingSnap.data().count,
            approvedUsers: approvedSnap.data().count,
            suspendedUsers: suspendedSnap.data().count,
            rejectedUsers: rejectedSnap.data().count,
            totalAnalysesToday: analysesTodaySnap.data().count,
            totalAnalysesWeek: analysesWeekSnap.data().count,
            totalAnalysesAllTime: analysesAllSnap.data().count,
            totalRevenue,
            activeProUsers: proUsersSnap.data().count,
            monthlyRevenue,
        };

        return { success: true, data: stats };
    } catch (err) {
        console.error("ADMIN_DASHBOARD_STATS_ERROR:", err);
        return { success: false, error: "Failed to load dashboard stats" };
    }
}

// ============================================
// Recent Signups
// ============================================

export async function getRecentSignups(): Promise<
    { success: true; data: RecentUserItem[] } | { success: false; error: string }
> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        const snapshot = await firestore
            .collection("users")
            .orderBy("createdAt", "desc")
            .limit(5)
            .get();

        const items: RecentUserItem[] = snapshot.docs.map((doc) => {
            const data = doc.data() as FirestoreUser;
            return {
                id: doc.id,
                email: data.email,
                displayName: data.displayName,
                photoURL: data.photoURL,
                status: data.status,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });

        return { success: true, data: items };
    } catch (err) {
        console.error("ADMIN_RECENT_SIGNUPS_ERROR:", err);
        return { success: false, error: "Failed to load recent signups" };
    }
}

// ============================================
// Recent Analyses
// ============================================

export async function getRecentAnalyses(): Promise<
    { success: true; data: RecentAnalysisItem[] } | { success: false; error: string }
> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        const snapshot = await firestore
            .collection("analysisHistory")
            .orderBy("createdAt", "desc")
            .limit(5)
            .get();

        const items: RecentAnalysisItem[] = snapshot.docs.map((doc) => {
            const data = doc.data() as AnalysisHistoryDoc;
            return {
                id: doc.id,
                userEmail: data.userEmail,
                analysisType: data.analysisType,
                pointAName: data.pointA.name,
                pointBName: data.pointB.name,
                distance: data.resultSummary.distance,
                isFeasible: data.resultSummary.isFeasible,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });

        return { success: true, data: items };
    } catch (err) {
        console.error("ADMIN_RECENT_ANALYSES_ERROR:", err);
        return { success: false, error: "Failed to load recent analyses" };
    }
}

// ============================================
// Daily Stats (last 7 days)
// ============================================

export async function getDailyStats(): Promise<
    { success: true; data: DailyStatItem[] } | { success: false; error: string }
> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        const now = new Date();
        const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        const startTs = Timestamp.fromDate(sevenDaysAgo);

        const [signupsSnap, analysesSnap] = await Promise.all([
            firestore.collection("users").where("createdAt", ">=", startTs).get(),
            firestore.collection("analysisHistory").where("createdAt", ">=", startTs).get(),
        ]);

        // Initialize 7-day map
        const dayMap = new Map<string, { signups: number; analyses: number }>();
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const key = d.toISOString().split("T")[0];
            dayMap.set(key, { signups: 0, analyses: 0 });
        }

        signupsSnap.docs.forEach((doc) => {
            const data = doc.data() as FirestoreUser;
            const dateKey = data.createdAt.toDate().toISOString().split("T")[0];
            const entry = dayMap.get(dateKey);
            if (entry) entry.signups++;
        });

        analysesSnap.docs.forEach((doc) => {
            const data = doc.data() as AnalysisHistoryDoc;
            const dateKey = data.createdAt.toDate().toISOString().split("T")[0];
            const entry = dayMap.get(dateKey);
            if (entry) entry.analyses++;
        });

        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const items: DailyStatItem[] = [];
        dayMap.forEach((value, key) => {
            const d = new Date(key + "T00:00:00");
            items.push({
                date: key,
                label: days[d.getDay()],
                signups: value.signups,
                analyses: value.analyses,
            });
        });

        return { success: true, data: items };
    } catch (err) {
        console.error("ADMIN_DAILY_STATS_ERROR:", err);
        return { success: false, error: "Failed to load daily stats" };
    }
}

// ============================================
// Activity Feed
// ============================================

export async function getActivityFeed(): Promise<
    { success: true; data: ActivityFeedItem[] } | { success: false; error: string }
> {
    try {
        const auth = await verifyAdmin();
        if (!auth.success) return { success: false, error: auth.error };

        const firestore = db();
        const items: ActivityFeedItem[] = [];

        const [signupsSnap, analysesSnap, adminSnap] = await Promise.all([
            firestore.collection("users").orderBy("createdAt", "desc").limit(5).get(),
            firestore.collection("analysisHistory").orderBy("createdAt", "desc").limit(5).get(),
            firestore.collection("adminLogs").orderBy("createdAt", "desc").limit(5).get(),
        ]);

        signupsSnap.docs.forEach((doc) => {
            const data = doc.data() as FirestoreUser;
            items.push({
                id: `signup-${doc.id}`,
                type: "signup",
                message: `${data.displayName || data.email} signed up`,
                timestamp: data.createdAt.toDate().toISOString(),
            });
        });

        analysesSnap.docs.forEach((doc) => {
            const data = doc.data() as AnalysisHistoryDoc;
            items.push({
                id: `analysis-${doc.id}`,
                type: "analysis",
                message: `${data.userEmail} ran ${data.analysisType.replace("_", " ")} analysis`,
                timestamp: data.createdAt.toDate().toISOString(),
            });
        });

        adminSnap.docs.forEach((doc) => {
            const data = doc.data();
            items.push({
                id: `admin-${doc.id}`,
                type: "admin_action",
                message: `${data.adminEmail} performed ${(data.action as string).replace(/_/g, " ")}`,
                timestamp: (data.createdAt as Timestamp).toDate().toISOString(),
            });
        });

        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return { success: true, data: items.slice(0, 10) };
    } catch (err) {
        console.error("ADMIN_ACTIVITY_FEED_ERROR:", err);
        return { success: false, error: "Failed to load activity feed" };
    }
}