// src/app/admin/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    Users,
    UserCheck,
    Clock,
    BarChart3,
    Radio,
    UserPlus,
    Shield,
    Activity,
    ArrowRight,
    IndianRupee,
    Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    getAdminDashboardStats,
    getRecentSignups,
    getRecentAnalyses,
    getDailyStats,
    getActivityFeed,
    type AdminDashboardStats,
    type RecentUserItem,
    type RecentAnalysisItem,
    type DailyStatItem,
    type ActivityFeedItem,
} from "./actions";
import { formatDistanceToNow } from "date-fns";

// ── Helpers ─────────────────────────────────

function getInitials(name: string | null | undefined): string {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2)
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

function getStatusBadge(status: string) {
    switch (status) {
        case "approved":
            return (
                <Badge variant="outline" className="text-[0.6rem] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Approved
                </Badge>
            );
        case "pending_approval":
            return (
                <Badge variant="outline" className="text-[0.6rem] bg-amber-500/10 text-amber-400 border-amber-500/20">
                    Pending
                </Badge>
            );
        case "suspended":
            return (
                <Badge variant="outline" className="text-[0.6rem] bg-red-500/10 text-red-400 border-red-500/20">
                    Suspended
                </Badge>
            );
        case "rejected":
            return (
                <Badge variant="outline" className="text-[0.6rem] bg-red-500/10 text-red-400 border-red-500/20">
                    Rejected
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="text-[0.6rem] bg-white/10 text-white/50 border-white/20">
                    {status}
                </Badge>
            );
    }
}

function getActivityIcon(type: string) {
    switch (type) {
        case "signup":
            return <UserPlus className="h-3.5 w-3.5 text-teal-400" />;
        case "analysis":
            return <Radio className="h-3.5 w-3.5 text-blue-400" />;
        case "admin_action":
            return <Shield className="h-3.5 w-3.5 text-purple-400" />;
        default:
            return <Activity className="h-3.5 w-3.5 text-white/40" />;
    }
}

// ── Component ───────────────────────────────

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [recentUsers, setRecentUsers] = useState<RecentUserItem[]>([]);
    const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysisItem[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStatItem[]>([]);
    const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [statsRes, usersRes, analysesRes, dailyRes, feedRes] = await Promise.all([
                getAdminDashboardStats(),
                getRecentSignups(),
                getRecentAnalyses(),
                getDailyStats(),
                getActivityFeed(),
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (usersRes.success) setRecentUsers(usersRes.data);
            if (analysesRes.success) setRecentAnalyses(analysesRes.data);
            if (dailyRes.success) setDailyStats(dailyRes.data);
            if (feedRes.success) setActivityFeed(feedRes.data);
        } catch (err) {
            console.error("ADMIN_DASHBOARD_LOAD_ERROR:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="h-8 w-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-white/30 mt-3">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    const maxDailyAnalyses = Math.max(...dailyStats.map((d) => d.analyses), 1);
    const maxDailySignups = Math.max(...dailyStats.map((d) => d.signups), 1);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-white/40 mt-1">Platform overview and quick actions</p>
            </div>

            {/* KPI Cards — Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                    <CardContent className="pt-5 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-white/40">Total Users</p>
                                <p className="text-xl font-bold text-white">{stats?.totalUsers ?? 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`bg-card/80 backdrop-blur-sm border-white/[0.06] ${(stats?.pendingApproval ?? 0) > 0 ? "ring-1 ring-amber-500/30" : ""}`}>
                    <CardContent className="pt-5 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-xs text-white/40">Pending Approval</p>
                                <p className="text-xl font-bold text-amber-400">{stats?.pendingApproval ?? 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                    <CardContent className="pt-5 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs text-white/40">Active Users</p>
                                <p className="text-xl font-bold text-white">{stats?.approvedUsers ?? 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                    <CardContent className="pt-5 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-teal-400" />
                            </div>
                            <div>
                                <p className="text-xs text-white/40">Analyses</p>
                                <p className="text-xl font-bold text-white">
                                    {stats?.totalAnalysesAllTime ?? 0}
                                    <span className="text-xs font-normal text-white/30 ml-1">
                                        ({stats?.totalAnalysesToday ?? 0} today)
                                    </span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                    <CardContent className="pt-5 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                <IndianRupee className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs text-white/40">Revenue</p>
                                <p className="text-xl font-bold text-white">₹{stats?.totalRevenue ?? 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* KPI Cards — Row 2: Revenue details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                    <CardContent className="pt-5 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                <Crown className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs text-white/40">Active Pro Users</p>
                                <p className="text-xl font-bold text-purple-400">{stats?.activeProUsers ?? 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                    <CardContent className="pt-5 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <IndianRupee className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs text-white/40">Monthly Revenue (MRR)</p>
                                <p className="text-xl font-bold text-emerald-400">₹{stats?.monthlyRevenue ?? 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                {(stats?.pendingApproval ?? 0) > 0 && (
                    <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-500 text-white">
                        <Link href="/admin/users?status=pending_approval">
                            <Clock className="h-3.5 w-3.5 mr-2" />
                            Review Pending ({stats?.pendingApproval})
                        </Link>
                    </Button>
                )}
                <Button asChild size="sm" variant="outline" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
                    <Link href="/admin/users">
                        <Users className="h-3.5 w-3.5 mr-2" />
                        Manage Users
                    </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
                    <Link href="/admin/analysis-logs">
                        <Radio className="h-3.5 w-3.5 mr-2" />
                        Analysis Logs
                    </Link>
                </Button>
            </div>

            {/* 7-Day Activity Chart */}
            <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-white">7-Day Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-2 h-32">
                        {dailyStats.map((day) => (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex flex-col items-center gap-0.5" style={{ height: "96px" }}>
                                    <div
                                        className="w-full max-w-[24px] bg-teal-500/40 rounded-t transition-all"
                                        style={{
                                            height: `${Math.max(4, (day.analyses / maxDailyAnalyses) * 80)}px`,
                                        }}
                                        title={`${day.analyses} analyses`}
                                    />
                                    <div
                                        className="w-full max-w-[24px] bg-blue-500/40 rounded-t transition-all"
                                        style={{
                                            height: `${Math.max(2, (day.signups / maxDailySignups) * 40)}px`,
                                        }}
                                        title={`${day.signups} signups`}
                                    />
                                </div>
                                <span className="text-[0.6rem] text-white/30">{day.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm bg-teal-500/40" />
                            <span className="text-[0.6rem] text-white/40">Analyses</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/40" />
                            <span className="text-[0.6rem] text-white/40">Signups</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Grid: Recent Signups + Recent Analyses + Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Signups */}
                <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-white">Recent Signups</CardTitle>
                            <Button asChild variant="ghost" size="sm" className="h-6 text-xs text-white/40 hover:text-white">
                                <Link href="/admin/users">
                                    View All <ArrowRight className="h-3 w-3 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentUsers.length === 0 ? (
                            <p className="text-sm text-white/30 text-center py-4">No signups yet</p>
                        ) : (
                            recentUsers.map((u) => (
                                <div key={u.id} className="flex items-center gap-3">
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={u.photoURL || undefined} alt={u.displayName || u.email} />
                                        <AvatarFallback className="bg-teal-600/20 text-teal-300 text-[0.5rem]">
                                            {getInitials(u.displayName || u.email)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white/70 truncate">{u.displayName || u.email}</p>
                                        <p className="text-[0.6rem] text-white/30">
                                            {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {getStatusBadge(u.status)}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Recent Analyses */}
                <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-white">Recent Analyses</CardTitle>
                            <Button asChild variant="ghost" size="sm" className="h-6 text-xs text-white/40 hover:text-white">
                                <Link href="/admin/analysis-logs">
                                    View All <ArrowRight className="h-3 w-3 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentAnalyses.length === 0 ? (
                            <p className="text-sm text-white/30 text-center py-4">No analyses yet</p>
                        ) : (
                            recentAnalyses.map((a) => (
                                <div key={a.id} className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <Radio className="h-3.5 w-3.5 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white/70 truncate">
                                            {a.pointAName} → {a.pointBName}
                                        </p>
                                        <p className="text-[0.6rem] text-white/30">{a.userEmail}</p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`text-[0.6rem] ${a.isFeasible
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                            }`}
                                    >
                                        {a.isFeasible ? "Pass" : "Fail"}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Activity Feed */}
                <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-white">Activity Feed</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {activityFeed.length === 0 ? (
                            <p className="text-sm text-white/30 text-center py-4">No activity yet</p>
                        ) : (
                            activityFeed.map((item) => (
                                <div key={item.id} className="flex items-start gap-2.5 py-1">
                                    <div className="mt-0.5">{getActivityIcon(item.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white/60 leading-relaxed">{item.message}</p>
                                        <p className="text-[0.6rem] text-white/25">
                                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <Separator className="bg-white/[0.04]" />

            <p className="text-xs text-white/20 text-center pb-4">
                FindLOS Admin Panel • Nav Wireless Technologies Pvt. Ltd.
            </p>
        </div>
    );
}