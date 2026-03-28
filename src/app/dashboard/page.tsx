// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    BarChart3,
    Coins,
    Activity,
    Calendar,
    Radio,
    Cable,
    ListChecks,
    Download,
    ArrowRight,
    Zap,
    ChevronLeft,
    ChevronRight,
    Filter,
    Crown,
    Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import AppHeader from "@/components/layout/app-header";
import RazorpayCheckout from "@/components/razorpay-checkout";
import { useAuth } from "@/hooks/use-auth";
import {
    getDashboardStats,
    getAnalysisHistory,
    exportHistoryCsv,
    getSubscriptionHistory,
    type DashboardStats,
    type AnalysisHistoryItem,
    type SubscriptionHistoryItem,
} from "./actions";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

function getInitials(name: string | null | undefined): string {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2)
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

function getStatusColor(status: string): string {
    switch (status) {
        case "approved":
            return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
        case "pending_approval":
            return "bg-amber-500/20 text-amber-400 border-amber-500/30";
        case "suspended":
        case "rejected":
            return "bg-red-500/20 text-red-400 border-red-500/30";
        default:
            return "bg-white/10 text-white/50 border-white/20";
    }
}

function getStatusLabel(status: string): string {
    switch (status) {
        case "approved":
            return "Approved";
        case "pending_approval":
            return "Pending";
        case "suspended":
            return "Suspended";
        case "rejected":
            return "Rejected";
        default:
            return "Unknown";
    }
}

function getTypeIcon(type: string) {
    switch (type) {
        case "single_los":
            return <Radio className="h-3.5 w-3.5 text-teal-400" />;
        case "fiber_path":
            return <Cable className="h-3.5 w-3.5 text-purple-400" />;
        case "bulk_los":
            return <ListChecks className="h-3.5 w-3.5 text-blue-400" />;
        default:
            return <Activity className="h-3.5 w-3.5 text-white/40" />;
    }
}

function getTypeLabel(type: string): string {
    switch (type) {
        case "single_los":
            return "LOS";
        case "fiber_path":
            return "Fiber";
        case "bulk_los":
            return "Bulk";
        default:
            return type;
    }
}

export default function DashboardPage() {
    const { user, isPro, plan, planExpiresAt, credits } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
    const [historyTotal, setHistoryTotal] = useState(0);
    const [subscriptions, setSubscriptions] = useState<SubscriptionHistoryItem[]>([]);
    const [page, setPage] = useState(1);
    const [filterType, setFilterType] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const pageSize = 10;

    // Derived values: use session data as primary, stats as supplementary
    const currentPlan = stats?.plan || plan || "free";
    const currentCredits = stats?.creditsRemaining ?? credits;
    const currentStatus = stats?.status || user?.status || "pending_approval";
    const currentPlanExpiresAt = stats?.planExpiresAt || planExpiresAt;
    const activePro = isPro || currentPlan === "pro";
    const isProExpired = currentPlan === "pro" && currentPlanExpiresAt && new Date(currentPlanExpiresAt) < new Date();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [statsResult, historyResult, subsResult] = await Promise.all([
                getDashboardStats(),
                getAnalysisHistory(page, pageSize, filterType),
                getSubscriptionHistory(),
            ]);

            if (statsResult.success) setStats(statsResult.data);
            if (historyResult.success) {
                setHistory(historyResult.data.items);
                setHistoryTotal(historyResult.data.total);
            }
            if (subsResult.success) setSubscriptions(subsResult.data);
        } catch (err) {
            console.error("DASHBOARD_LOAD_ERROR:", err);
            toast({
                title: "Error",
                description: "Failed to load dashboard data.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [page, filterType, pageSize, toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleExportCsv = async () => {
        setIsExporting(true);
        try {
            const result = await exportHistoryCsv();
            if (result.success) {
                const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `findlos_analysis_history_${format(new Date(), "yyyy-MM-dd")}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast({ title: "CSV Exported", description: "Your analysis history has been downloaded." });
            } else {
                toast({ title: "Export Failed", description: result.error, variant: "destructive" });
            }
        } catch {
            toast({ title: "Export Failed", description: "An error occurred.", variant: "destructive" });
        } finally {
            setIsExporting(false);
        }
    };

    const handlePaymentSuccess = () => {
        router.push("/payment/success");
    };

    const totalPages = Math.ceil(historyTotal / pageSize);
    const creditsUsed = stats?.creditsUsed ?? 0;
    const totalCreditsGranted = stats?.totalCreditsGranted ?? (currentCredits + creditsUsed);
    const creditUsagePercent =
        totalCreditsGranted > 0
            ? Math.min(100, (creditsUsed / totalCreditsGranted) * 100)
            : 0;

    return (
        <>
            <AppHeader />
            <div className="flex-1 overflow-y-auto bg-background">
                <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
                    {/* ── Account Overview ── */}
                    <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <Avatar className="h-14 w-14 ring-2 ring-white/10">
                                    <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
                                    <AvatarFallback className="bg-teal-600/30 text-teal-300 text-lg font-semibold">
                                        {getInitials(user?.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h2 className="text-lg font-semibold text-white truncate">
                                            {user?.name || "User"}
                                        </h2>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${getStatusColor(currentStatus)}`}
                                        >
                                            {getStatusLabel(currentStatus)}
                                        </Badge>
                                        {activePro && !isProExpired && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30"
                                            >
                                                PRO
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-white/40 truncate">{user?.email}</p>
                                    {stats && (
                                        <p className="text-xs text-white/30 mt-1">
                                            Member since {format(new Date(stats.memberSince), "MMM d, yyyy")}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                    {activePro && !isProExpired ? (
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-purple-400">Unlimited</span>
                                            <span className="text-xs text-white/30 ml-1.5">analyses</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-right">
                                                <span className="text-2xl font-bold text-teal-400">
                                                    {currentCredits}
                                                </span>
                                                <span className="text-xs text-white/30 ml-1.5">credits</span>
                                            </div>
                                            <Progress value={100 - creditUsagePercent} className="w-32 h-1.5" />
                                            <span className="text-[0.6rem] text-white/30">
                                                {creditsUsed} / {totalCreditsGranted} used
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Subscription Status ── */}
                    <Card className={`bg-card/80 backdrop-blur-sm border-white/[0.06] ${activePro && !isProExpired ? "border-purple-500/20" : ""}`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                                    <Crown className="h-4 w-4 text-purple-400" />
                                    Subscription
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {activePro && !isProExpired ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-purple-400">Pro Plan — Active</p>
                                            {currentPlanExpiresAt && (
                                                <p className="text-xs text-white/40 mt-0.5">
                                                    Expires {formatDistanceToNow(new Date(currentPlanExpiresAt), { addSuffix: true })}
                                                    {" · "}
                                                    {format(new Date(currentPlanExpiresAt), "MMM d, yyyy")}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                                            ₹500/month
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-white/40">
                                        <span className="flex items-center gap-1">
                                            <Zap className="h-3 w-3 text-purple-400" /> Unlimited analyses
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ListChecks className="h-3 w-3 text-purple-400" /> Bulk analysis enabled
                                        </span>
                                    </div>
                                </div>
                            ) : isProExpired ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-red-400">Pro Plan — Expired</p>
                                            <p className="text-xs text-white/40 mt-0.5">
                                                Your Pro plan has expired. Renew to continue unlimited analyses.
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                                            Expired
                                        </Badge>
                                    </div>
                                    <RazorpayCheckout
                                        onSuccess={handlePaymentSuccess}
                                        variant="compact"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-white/70">Free Plan</p>
                                            <p className="text-xs text-white/40 mt-0.5">
                                                {currentCredits} credit{currentCredits !== 1 ? "s" : ""} remaining
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="bg-white/5 text-white/40 border-white/10">
                                            Free
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RazorpayCheckout
                                            onSuccess={handlePaymentSuccess}
                                            variant="compact"
                                        />
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                            className="text-xs text-white/40 hover:text-white"
                                        >
                                            <Link href="/pricing">View Plans</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Subscription History */}
                            {subscriptions.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                                    <p className="text-xs font-medium text-white/40 mb-2">Payment History</p>
                                    <div className="space-y-2">
                                        {subscriptions.map((sub) => (
                                            <div key={sub.id} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3 text-white/25" />
                                                    <span className="text-white/50">
                                                        {format(new Date(sub.startDate), "MMM d, yyyy")}
                                                    </span>
                                                </div>
                                                <span className="text-white/40">₹{sub.amount}</span>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[0.6rem] ${sub.status === "active"
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : "bg-white/5 text-white/30 border-white/10"
                                                        }`}
                                                >
                                                    {sub.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ── Usage Stats ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                            <CardContent className="pt-5 pb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                                        <BarChart3 className="h-5 w-5 text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40">Total Analyses</p>
                                        <p className="text-xl font-bold text-white">
                                            {stats?.totalAnalyses ?? 0}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                            <CardContent className="pt-5 pb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                        <Coins className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40">Credits Used</p>
                                        <p className="text-xl font-bold text-white">
                                            {creditsUsed}{" "}
                                            <span className="text-xs font-normal text-white/30">
                                                / {totalCreditsGranted}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                            <CardContent className="pt-5 pb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40">Last Analysis</p>
                                        <p className="text-sm font-semibold text-white">
                                            {stats?.lastAnalysisAt
                                                ? format(new Date(stats.lastAnalysisAt), "MMM d, h:mm a")
                                                : "No analyses yet"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Quick Actions ── */}
                    <div className="flex flex-wrap gap-3">
                        <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-500 text-white">
                            <Link href="/">
                                <Radio className="h-3.5 w-3.5 mr-2" />
                                New Analysis
                            </Link>
                        </Button>
                        {!activePro && (
                            <Button asChild size="sm" variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                                <Link href="/pricing">
                                    <Zap className="h-3.5 w-3.5 mr-2" />
                                    Upgrade to Pro
                                </Link>
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleExportCsv}
                            disabled={isExporting || historyTotal === 0}
                            className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                        >
                            <Download className="h-3.5 w-3.5 mr-2" />
                            {isExporting ? "Exporting..." : "Download History"}
                        </Button>
                    </div>

                    {/* ── Analysis History ── */}
                    <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <CardTitle className="text-base font-semibold text-white">
                                    Analysis History
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Filter className="h-3.5 w-3.5 text-white/30" />
                                    <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(1); }}>
                                        <SelectTrigger className="w-[140px] h-8 text-xs bg-white/5 border-white/10">
                                            <SelectValue placeholder="Filter type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="single_los">LOS Only</SelectItem>
                                            <SelectItem value="fiber_path">Fiber Only</SelectItem>
                                            <SelectItem value="bulk_los">Bulk Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="h-6 w-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mx-auto" />
                                    <p className="text-sm text-white/30 mt-3">Loading history...</p>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-12 space-y-3">
                                    <Activity className="h-10 w-10 text-white/10 mx-auto" />
                                    <p className="text-sm text-white/40">No analyses found.</p>
                                    <Button asChild size="sm" variant="outline" className="border-teal-500/20 text-teal-400 hover:bg-teal-500/10">
                                        <Link href="/">
                                            Run Your First Analysis <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-white/[0.06]">
                                                    <th className="text-left py-2.5 px-3 text-xs font-medium text-white/40">Date</th>
                                                    <th className="text-left py-2.5 px-3 text-xs font-medium text-white/40">Type</th>
                                                    <th className="text-left py-2.5 px-3 text-xs font-medium text-white/40">Route</th>
                                                    <th className="text-right py-2.5 px-3 text-xs font-medium text-white/40">Distance</th>
                                                    <th className="text-center py-2.5 px-3 text-xs font-medium text-white/40">Result</th>
                                                    <th className="text-right py-2.5 px-3 text-xs font-medium text-white/40">Credits</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.map((item) => (
                                                    <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                                        <td className="py-2.5 px-3 text-xs text-white/50 whitespace-nowrap">
                                                            {format(new Date(item.createdAt), "MMM d, h:mm a")}
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <div className="flex items-center gap-1.5">
                                                                {getTypeIcon(item.analysisType)}
                                                                <span className="text-xs text-white/60">{getTypeLabel(item.analysisType)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-xs text-white/70 max-w-[200px] truncate">
                                                            {item.pointAName} → {item.pointBName}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-xs text-white/50 text-right whitespace-nowrap">
                                                            {item.distance.toFixed(2)} km
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-[0.6rem] px-1.5 ${item.isFeasible
                                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                                                    }`}
                                                            >
                                                                {item.isFeasible ? "Pass" : "Fail"}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-xs text-white/40 text-right">
                                                            {item.creditsCost}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between pt-4">
                                            <p className="text-xs text-white/30">
                                                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, historyTotal)} of{" "}
                                                {historyTotal}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                    disabled={page === 1}
                                                    className="h-7 w-7 p-0 text-white/40 hover:text-white"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <span className="text-xs text-white/50 px-2">
                                                    {page} / {totalPages}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                    disabled={page === totalPages}
                                                    className="h-7 w-7 p-0 text-white/40 hover:text-white"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}