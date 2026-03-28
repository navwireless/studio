// src/app/admin/audit-log/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getAdminAuditLog, type AuditLogItem } from "./actions";

// ── Helpers ─────────────────────────────────

function getActionBadge(action: string) {
    const colorMap: Record<string, string> = {
        approve_user: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        reject_user: "bg-red-500/10 text-red-400 border-red-500/20",
        suspend_user: "bg-red-500/10 text-red-400 border-red-500/20",
        reactivate_user: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        add_credits: "bg-teal-500/10 text-teal-400 border-teal-500/20",
        remove_credits: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        change_role: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        bulk_approve: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        bulk_reject: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    const className =
        colorMap[action] || "bg-white/5 text-white/40 border-white/10";
    return (
        <Badge variant="outline" className={`text-[0.6rem] ${className}`}>
            {action.replace(/_/g, " ")}
        </Badge>
    );
}

function formatDetails(details: Record<string, unknown> | null): string {
    if (!details) return "—";
    const parts: string[] = [];
    if (details.previousStatus && details.newStatus) {
        parts.push(`${details.previousStatus} → ${details.newStatus}`);
    }
    if (details.previousRole && details.newRole) {
        parts.push(`role: ${details.previousRole} → ${details.newRole}`);
    }
    if (details.amount !== undefined) {
        const amt = details.amount as number;
        parts.push(`${amt > 0 ? "+" : ""}${amt} credits`);
    }
    if (details.reason) {
        parts.push(`"${details.reason}"`);
    }
    if (details.batchSize) {
        parts.push(`batch of ${details.batchSize}`);
    }
    return parts.length > 0 ? parts.join(" · ") : JSON.stringify(details);
}

// ── Component ───────────────────────────────

export default function AuditLogPage() {
    const { toast } = useToast();

    const [items, setItems] = useState<AuditLogItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const pageSize = 25;

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getAdminAuditLog(page, pageSize);
            if (result.success) {
                setItems(result.data.items);
                setTotal(result.data.total);
            } else {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to load audit log",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [page, toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Admin Audit Log</h1>
                    <p className="text-sm text-white/40 mt-0.5">
                        All admin actions ({total} total) — read-only
                    </p>
                </div>
            </div>

            {/* Table */}
            <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-semibold text-white">
                        Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="h-6 w-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mx-auto" />
                            <p className="text-sm text-white/30 mt-3">Loading audit log...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-white/40">
                                No admin actions recorded yet.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                                        <TableHead className="text-xs text-white/40">Date</TableHead>
                                        <TableHead className="text-xs text-white/40">Admin</TableHead>
                                        <TableHead className="text-xs text-white/40">Action</TableHead>
                                        <TableHead className="text-xs text-white/40">
                                            Target User
                                        </TableHead>
                                        <TableHead className="text-xs text-white/40">
                                            Details
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className="border-white/[0.03] hover:bg-white/[0.02]"
                                        >
                                            <TableCell className="text-xs text-white/50 whitespace-nowrap">
                                                {format(new Date(item.createdAt), "MMM d, h:mm a")}
                                            </TableCell>
                                            <TableCell className="text-xs text-purple-400 whitespace-nowrap">
                                                {item.adminEmail}
                                            </TableCell>
                                            <TableCell>{getActionBadge(item.action)}</TableCell>
                                            <TableCell>
                                                {item.targetUserId ? (
                                                    <Link
                                                        href={`/admin/users/${item.targetUserId}`}
                                                        className="text-xs text-teal-400 hover:text-teal-300 hover:underline truncate max-w-[160px] block"
                                                    >
                                                        {item.targetUserEmail || item.targetUserId}
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-white/30">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-white/40 max-w-[300px] truncate">
                                                {formatDetails(item.details)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-xs text-white/30">
                                Showing {(page - 1) * pageSize + 1}–
                                {Math.min(page * pageSize, total)} of {total}
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
                </CardContent>
            </Card>
        </div>
    );
}