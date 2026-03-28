// src/app/admin/users/[userId]/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Radio,
    Cable,
    ListChecks,
    Activity,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format, formatDistanceToNow } from "date-fns";
import {
    getUserDetail,
    getUserAnalyses,
    getUserCreditTransactions,
    getUserAdminLogs,
    type UserDetailData,
    type UserAnalysisItem,
    type UserCreditItem,
    type UserAdminLogItem,
} from "./actions";

// ── Helpers ─────────────────────────────────

function getInitials(name: string | null | undefined): string {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2)
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

function getStatusBadge(status: string) {
    const map: Record<string, { label: string; className: string }> = {
        approved: { label: "Approved", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
        pending_approval: { label: "Pending", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
        suspended: { label: "Suspended", className: "bg-red-500/10 text-red-400 border-red-500/20" },
        rejected: { label: "Rejected", className: "bg-red-500/10 text-red-400 border-red-500/20" },
    };
    const s = map[status] || { label: status, className: "bg-white/10 text-white/50 border-white/20" };
    return <Badge variant="outline" className={s.className}>{s.label}</Badge>;
}

function getTypeIcon(type: string) {
    switch (type) {
        case "single_los": return <Radio className="h-3.5 w-3.5 text-teal-400" />;
        case "fiber_path": return <Cable className="h-3.5 w-3.5 text-purple-400" />;
        case "bulk_los": return <ListChecks className="h-3.5 w-3.5 text-blue-400" />;
        default: return <Activity className="h-3.5 w-3.5 text-white/40" />;
    }
}

// ── Pagination Component ────────────────────

function SimplePagination({
    page,
    totalPages,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
}) {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-end gap-1.5 pt-4">
            <Button size="sm" variant="ghost" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="h-7 w-7 p-0 text-white/40">
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-white/50 px-2">{page} / {totalPages}</span>
            <Button size="sm" variant="ghost" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="h-7 w-7 p-0 text-white/40">
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}

// ── Component ───────────────────────────────

export default function UserDetailPage() {
    const params = useParams();
    const userId = params.userId as string;

    const [user, setUser] = useState<UserDetailData | null>(null);
    const [analyses, setAnalyses] = useState<UserAnalysisItem[]>([]);
    const [analysesTotal, setAnalysesTotal] = useState(0);
    const [analysesPage, setAnalysesPage] = useState(1);
    const [credits, setCredits] = useState<UserCreditItem[]>([]);
    const [creditsTotal, setCreditsTotal] = useState(0);
    const [creditsPage, setCreditsPage] = useState(1);
    const [adminLogs, setAdminLogs] = useState<UserAdminLogItem[]>([]);
    const [adminLogsTotal, setAdminLogsTotal] = useState(0);
    const [adminLogsPage, setAdminLogsPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const pageSize = 10;

    const loadUser = useCallback(async () => {
        setIsLoading(true);
        const result = await getUserDetail(userId);
        if (result.success) setUser(result.data);
        setIsLoading(false);
    }, [userId]);

    const loadAnalyses = useCallback(async () => {
        const result = await getUserAnalyses(userId, analysesPage, pageSize);
        if (result.success) {
            setAnalyses(result.data.items);
            setAnalysesTotal(result.data.total);
        }
    }, [userId, analysesPage]);

    const loadCredits = useCallback(async () => {
        const result = await getUserCreditTransactions(userId, creditsPage, pageSize);
        if (result.success) {
            setCredits(result.data.items);
            setCreditsTotal(result.data.total);
        }
    }, [userId, creditsPage]);

    const loadAdminLogs = useCallback(async () => {
        const result = await getUserAdminLogs(userId, adminLogsPage, pageSize);
        if (result.success) {
            setAdminLogs(result.data.items);
            setAdminLogsTotal(result.data.total);
        }
    }, [userId, adminLogsPage]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    useEffect(() => {
        loadAnalyses();
    }, [loadAnalyses]);

    useEffect(() => {
        loadCredits();
    }, [loadCredits]);

    useEffect(() => {
        loadAdminLogs();
    }, [loadAdminLogs]);

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="h-8 w-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-white/30 mt-3">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-6 text-center">
                <p className="text-white/40">User not found.</p>
                <Button asChild variant="ghost" className="mt-4 text-white/60">
                    <Link href="/admin/users"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Users</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Back Button */}
            <Button asChild variant="ghost" size="sm" className="text-white/40 hover:text-white -ml-2">
                <Link href="/admin/users"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Users</Link>
            </Button>

            {/* User Profile Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Avatar className="h-14 w-14 ring-2 ring-white/10">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email} />
                            <AvatarFallback className="bg-teal-600/30 text-teal-300 text-lg">{getInitials(user.displayName || user.email)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-lg font-semibold text-white">{user.displayName || "—"}</h2>
                                {getStatusBadge(user.status)}
                                {user.role === "admin" && (
                                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">Admin</Badge>
                                )}
                                {user.plan === "pro" && (
                                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">Pro</Badge>
                                )}
                            </div>
                            <p className="text-sm text-white/40">{user.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-bold text-teal-400">{user.credits}</p>
                            <p className="text-xs text-white/30">credits remaining</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/[0.06]">
                        <div>
                            <p className="text-[0.6rem] text-white/30 uppercase tracking-wider">Joined</p>
                            <p className="text-xs text-white/60 mt-1">{format(new Date(user.createdAt), "MMM d, yyyy")}</p>
                        </div>
                        <div>
                            <p className="text-[0.6rem] text-white/30 uppercase tracking-wider">Last Login</p>
                            <p className="text-xs text-white/60 mt-1">{formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}</p>
                        </div>
                        <div>
                            <p className="text-[0.6rem] text-white/30 uppercase tracking-wider">Credits Used</p>
                            <p className="text-xs text-white/60 mt-1">{user.totalCreditsUsed}</p>
                        </div>
                        <div>
                            <p className="text-[0.6rem] text-white/30 uppercase tracking-wider">Approved By</p>
                            <p className="text-xs text-white/60 mt-1">{user.approvedBy || "—"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="analyses" className="space-y-4">
                <TabsList className="bg-white/5 border border-white/[0.06]">
                    <TabsTrigger value="analyses" className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white">
                        Analyses ({analysesTotal})
                    </TabsTrigger>
                    <TabsTrigger value="credits" className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white">
                        Credit Log ({creditsTotal})
                    </TabsTrigger>
                    <TabsTrigger value="admin-logs" className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white">
                        Admin Actions ({adminLogsTotal})
                    </TabsTrigger>
                </TabsList>

                {/* Analysis History Tab */}
                <TabsContent value="analyses">
                    <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-sm text-white">Analysis History</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {analyses.length === 0 ? (
                                <p className="text-sm text-white/30 text-center py-8">No analyses found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-white/[0.06] hover:bg-transparent">
                                                <TableHead className="text-xs text-white/40">Date</TableHead>
                                                <TableHead className="text-xs text-white/40">Type</TableHead>
                                                <TableHead className="text-xs text-white/40">Route</TableHead>
                                                <TableHead className="text-xs text-white/40 text-right">Distance</TableHead>
                                                <TableHead className="text-xs text-white/40 text-center">Result</TableHead>
                                                <TableHead className="text-xs text-white/40 text-right">Credits</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {analyses.map((item) => (
                                                <TableRow key={item.id} className="border-white/[0.03]">
                                                    <TableCell className="text-xs text-white/50 whitespace-nowrap">
                                                        {format(new Date(item.createdAt), "MMM d, h:mm a")}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            {getTypeIcon(item.analysisType)}
                                                            <span className="text-xs text-white/60">{item.analysisType.replace("_", " ")}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-white/70 max-w-[200px] truncate">
                                                        {item.pointAName} → {item.pointBName}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-white/50 text-right">{item.distance.toFixed(2)} km</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className={`text-[0.6rem] ${item.isFeasible ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                                                            {item.isFeasible ? "Pass" : "Fail"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-white/40 text-right">{item.creditsCost}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                            <SimplePagination page={analysesPage} totalPages={Math.ceil(analysesTotal / pageSize)} onPageChange={setAnalysesPage} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Credit Transactions Tab */}
                <TabsContent value="credits">
                    <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-sm text-white">Credit Transactions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {credits.length === 0 ? (
                                <p className="text-sm text-white/30 text-center py-8">No transactions found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-white/[0.06] hover:bg-transparent">
                                                <TableHead className="text-xs text-white/40">Date</TableHead>
                                                <TableHead className="text-xs text-white/40">Type</TableHead>
                                                <TableHead className="text-xs text-white/40 text-right">Amount</TableHead>
                                                <TableHead className="text-xs text-white/40 text-right">Balance</TableHead>
                                                <TableHead className="text-xs text-white/40">Reason</TableHead>
                                                <TableHead className="text-xs text-white/40">By</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {credits.map((item) => (
                                                <TableRow key={item.id} className="border-white/[0.03]">
                                                    <TableCell className="text-xs text-white/50 whitespace-nowrap">
                                                        {format(new Date(item.createdAt), "MMM d, h:mm a")}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-[0.6rem] bg-white/5 text-white/50 border-white/10">
                                                            {item.type.replace(/_/g, " ")}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={`text-xs font-mono ${item.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                                            {item.amount > 0 ? "+" : ""}{item.amount}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-white/40 text-right">
                                                        {item.balanceBefore} → {item.balanceAfter}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-white/50 max-w-[200px] truncate">{item.reason}</TableCell>
                                                    <TableCell className="text-xs text-white/30">{item.performedBy || "System"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                            <SimplePagination page={creditsPage} totalPages={Math.ceil(creditsTotal / pageSize)} onPageChange={setCreditsPage} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Admin Actions Tab */}
                <TabsContent value="admin-logs">
                    <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-sm text-white">Admin Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {adminLogs.length === 0 ? (
                                <p className="text-sm text-white/30 text-center py-8">No admin actions recorded.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-white/[0.06] hover:bg-transparent">
                                                <TableHead className="text-xs text-white/40">Date</TableHead>
                                                <TableHead className="text-xs text-white/40">Admin</TableHead>
                                                <TableHead className="text-xs text-white/40">Action</TableHead>
                                                <TableHead className="text-xs text-white/40">Details</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {adminLogs.map((item) => (
                                                <TableRow key={item.id} className="border-white/[0.03]">
                                                    <TableCell className="text-xs text-white/50 whitespace-nowrap">
                                                        {format(new Date(item.createdAt), "MMM d, h:mm a")}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-white/60">{item.adminEmail}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-[0.6rem] bg-purple-500/10 text-purple-400 border-purple-500/20">
                                                            {item.action.replace(/_/g, " ")}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-white/40 max-w-[250px] truncate">
                                                        {item.details ? JSON.stringify(item.details) : "—"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                            <SimplePagination page={adminLogsPage} totalPages={Math.ceil(adminLogsTotal / pageSize)} onPageChange={setAdminLogsPage} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}