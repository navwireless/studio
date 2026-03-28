// src/app/admin/credit-logs/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import {
    getAllCreditTransactions,
    type CreditLogItem,
} from "./actions";

// ── Helpers ─────────────────────────────────

function getTypeBadge(type: string) {
    const map: Record<string, { label: string; className: string }> = {
        initial_grant: {
            label: "Initial Grant",
            className: "bg-teal-500/10 text-teal-400 border-teal-500/20",
        },
        analysis_deduction: {
            label: "Analysis",
            className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        },
        admin_adjustment: {
            label: "Admin",
            className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        },
        pro_subscription: {
            label: "Pro Sub",
            className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        },
        refund: {
            label: "Refund",
            className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        },
    };
    const s = map[type] || {
        label: type.replace(/_/g, " "),
        className: "bg-white/5 text-white/40 border-white/10",
    };
    return (
        <Badge variant="outline" className={`text-[0.6rem] ${s.className}`}>
            {s.label}
        </Badge>
    );
}

// ── Component ───────────────────────────────

export default function CreditLogsPage() {
    const { toast } = useToast();

    const [items, setItems] = useState<CreditLogItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [emailFilter, setEmailFilter] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    const pageSize = 25;

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getAllCreditTransactions(page, pageSize, {
                userEmail: emailFilter,
                type: typeFilter,
            });
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
                description: "Failed to load credit logs",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [page, emailFilter, typeFilter, toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSearch = () => {
        setEmailFilter(emailInput.trim());
        setPage(1);
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-white">Credit Logs</h1>
                <p className="text-sm text-white/40 mt-1">
                    All credit transactions across the platform ({total} total)
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2 flex-1">
                    <Input
                        placeholder="Filter by user email..."
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 flex-1"
                    />
                    <Button
                        onClick={handleSearch}
                        size="sm"
                        variant="outline"
                        className="border-white/10 text-white/60 hover:text-white"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
                <Select
                    value={typeFilter}
                    onValueChange={(v) => {
                        setTypeFilter(v);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-[160px] h-9 text-xs bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="initial_grant">Initial Grant</SelectItem>
                        <SelectItem value="analysis_deduction">Analysis</SelectItem>
                        <SelectItem value="admin_adjustment">Admin Adjustment</SelectItem>
                        <SelectItem value="pro_subscription">Pro Subscription</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-semibold text-white">
                        Transactions
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="h-6 w-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mx-auto" />
                            <p className="text-sm text-white/30 mt-3">Loading transactions...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-white/40">No transactions found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                                        <TableHead className="text-xs text-white/40">Date</TableHead>
                                        <TableHead className="text-xs text-white/40">User</TableHead>
                                        <TableHead className="text-xs text-white/40">Type</TableHead>
                                        <TableHead className="text-xs text-white/40 text-right">Amount</TableHead>
                                        <TableHead className="text-xs text-white/40 text-right">Balance</TableHead>
                                        <TableHead className="text-xs text-white/40">Reason</TableHead>
                                        <TableHead className="text-xs text-white/40">By</TableHead>
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
                                            <TableCell>
                                                <Link
                                                    href={`/admin/users/${item.userId}`}
                                                    className="text-xs text-teal-400 hover:text-teal-300 hover:underline truncate max-w-[160px] block"
                                                >
                                                    {item.userEmail}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{getTypeBadge(item.type)}</TableCell>
                                            <TableCell className="text-right">
                                                <span
                                                    className={`text-xs font-mono font-semibold ${item.amount > 0 ? "text-emerald-400" : "text-red-400"
                                                        }`}
                                                >
                                                    {item.amount > 0 ? "+" : ""}
                                                    {item.amount}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-white/40 text-right whitespace-nowrap">
                                                {item.balanceBefore} → {item.balanceAfter}
                                            </TableCell>
                                            <TableCell className="text-xs text-white/50 max-w-[200px] truncate">
                                                {item.reason}
                                            </TableCell>
                                            <TableCell className="text-xs text-white/30 whitespace-nowrap">
                                                {item.performedBy || "System"}
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