// src/app/admin/analysis-logs/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Radio,
    Cable,
    ListChecks,
    Activity,
} from "lucide-react";
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
    getAllAnalysisHistory,
    type AnalysisLogItem,
} from "./actions";

// ── Helpers ─────────────────────────────────

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
            return "Single LOS";
        case "fiber_path":
            return "Fiber Path";
        case "bulk_los":
            return "Bulk LOS";
        default:
            return type;
    }
}

// ── Component ───────────────────────────────

export default function AnalysisLogsPage() {
    const { toast } = useToast();

    const [items, setItems] = useState<AnalysisLogItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [emailFilter, setEmailFilter] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [resultFilter, setResultFilter] = useState("all");

    const pageSize = 25;

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getAllAnalysisHistory(page, pageSize, {
                userEmail: emailFilter,
                analysisType: typeFilter,
                result: resultFilter,
            });
            if (result.success) {
                setItems(result.data.items);
                setTotal(result.data.total);
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to load analysis logs", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [page, emailFilter, typeFilter, resultFilter, toast]);

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
                <h1 className="text-xl font-bold text-white">Analysis Logs</h1>
                <p className="text-sm text-white/40 mt-1">
                    All analyses across the platform ({total} total)
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
                <div className="flex gap-2">
                    <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[140px] h-9 text-xs bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="single_los">Single LOS</SelectItem>
                            <SelectItem value="fiber_path">Fiber Path</SelectItem>
                            <SelectItem value="bulk_los">Bulk LOS</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={resultFilter} onValueChange={(v) => { setResultFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[120px] h-9 text-xs bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Result" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Results</SelectItem>
                            <SelectItem value="pass">Pass</SelectItem>
                            <SelectItem value="fail">Fail</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-semibold text-white">Analyses</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="h-6 w-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mx-auto" />
                            <p className="text-sm text-white/30 mt-3">Loading analyses...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-white/40">No analyses found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                                        <TableHead className="text-xs text-white/40">Date</TableHead>
                                        <TableHead className="text-xs text-white/40">User</TableHead>
                                        <TableHead className="text-xs text-white/40">Type</TableHead>
                                        <TableHead className="text-xs text-white/40">Route</TableHead>
                                        <TableHead className="text-xs text-white/40 text-right">Distance</TableHead>
                                        <TableHead className="text-xs text-white/40 text-center">Result</TableHead>
                                        <TableHead className="text-xs text-white/40 text-right">Credits</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id} className="border-white/[0.03] hover:bg-white/[0.02]">
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
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    {getTypeIcon(item.analysisType)}
                                                    <span className="text-xs text-white/60">
                                                        {getTypeLabel(item.analysisType)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-white/70 max-w-[200px] truncate">
                                                {item.pointAName} → {item.pointBName}
                                            </TableCell>
                                            <TableCell className="text-xs text-white/50 text-right whitespace-nowrap">
                                                {item.distance.toFixed(2)} km
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[0.6rem] ${item.isFeasible
                                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                                        }`}
                                                >
                                                    {item.isFeasible ? "Pass" : "Fail"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-white/40 text-right">
                                                {item.creditsCost}
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
                                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
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