// src/app/admin/users/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    UserCheck,
    UserX,
    Ban,
    Unlock,
    Plus,
    Minus,
    Shield,
    ShieldOff,
    Eye,
    CheckSquare,
    XSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
    getAdminUsers,
    approveUser,
    rejectUser,
    suspendUser,
    reactivateUser,
    changeUserRole,
    adminAdjustCredits,
    bulkApproveUsers,
    bulkRejectUsers,
    type AdminUserItem,
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
        approved: {
            label: "Approved",
            className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        },
        pending_approval: {
            label: "Pending",
            className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        },
        suspended: {
            label: "Suspended",
            className: "bg-red-500/10 text-red-400 border-red-500/20",
        },
        rejected: {
            label: "Rejected",
            className: "bg-red-500/10 text-red-400 border-red-500/20",
        },
    };
    const s = map[status] || { label: status, className: "bg-white/10 text-white/50 border-white/20" };
    return (
        <Badge variant="outline" className={`text-[0.6rem] ${s.className}`}>
            {s.label}
        </Badge>
    );
}

function getRoleBadge(role: string) {
    if (role === "admin") {
        return (
            <Badge variant="outline" className="text-[0.6rem] bg-purple-500/10 text-purple-400 border-purple-500/20">
                Admin
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="text-[0.6rem] bg-white/5 text-white/40 border-white/10">
            User
        </Badge>
    );
}

function getPlanBadge(plan: string) {
    if (plan === "pro") {
        return (
            <Badge variant="outline" className="text-[0.6rem] bg-amber-500/10 text-amber-400 border-amber-500/20">
                Pro
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="text-[0.6rem] bg-white/5 text-white/30 border-white/10">
            Free
        </Badge>
    );
}

// ── Filter Tabs ─────────────────────────────

const STATUS_TABS = [
    { value: "all", label: "All" },
    { value: "pending_approval", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "suspended", label: "Suspended" },
    { value: "rejected", label: "Rejected" },
];

// ── Component ───────────────────────────────

export default function AdminUsersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const initialStatus = searchParams.get("status") || "all";

    const [users, setUsers] = useState<AdminUserItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Dialog state
    const [creditDialog, setCreditDialog] = useState<{ open: boolean; user: AdminUserItem | null; mode: "add" | "remove" }>({
        open: false,
        user: null,
        mode: "add",
    });
    const [creditAmount, setCreditAmount] = useState("");
    const [creditReason, setCreditReason] = useState("");
    const [creditLoading, setCreditLoading] = useState(false);

    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        action: () => Promise<void>;
        variant: "default" | "destructive";
    }>({ open: false, title: "", description: "", action: async () => { }, variant: "default" });

    const pageSize = 20;

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getAdminUsers(page, pageSize, statusFilter, searchQuery);
            if (result.success) {
                setUsers(result.data.items);
                setTotal(result.data.total);
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [page, statusFilter, searchQuery, toast]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        setSelectedIds(new Set());
    }, [page, statusFilter, searchQuery]);

    const handleSearch = () => {
        setSearchQuery(searchInput.trim());
        setPage(1);
    };

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        setPage(1);
        router.push(`/admin/users${value !== "all" ? `?status=${value}` : ""}`, { scroll: false });
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === users.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(users.map((u) => u.id)));
        }
    };

    // ── Action Handlers ────────────────────────

    const handleApprove = (user: AdminUserItem) => {
        setConfirmDialog({
            open: true,
            title: "Approve User",
            description: `Approve ${user.displayName || user.email}? They will be able to use the platform.`,
            variant: "default",
            action: async () => {
                const result = await approveUser(user.id);
                if (result.success) {
                    toast({ title: "User Approved", description: `${user.email} has been approved.` });
                    loadUsers();
                } else {
                    toast({ title: "Error", description: result.error, variant: "destructive" });
                }
            },
        });
    };

    const handleReject = (user: AdminUserItem) => {
        setConfirmDialog({
            open: true,
            title: "Reject User",
            description: `Reject ${user.displayName || user.email}? They will not be able to access the platform.`,
            variant: "destructive",
            action: async () => {
                const result = await rejectUser(user.id);
                if (result.success) {
                    toast({ title: "User Rejected", description: `${user.email} has been rejected.` });
                    loadUsers();
                } else {
                    toast({ title: "Error", description: result.error, variant: "destructive" });
                }
            },
        });
    };

    const handleSuspend = (user: AdminUserItem) => {
        setConfirmDialog({
            open: true,
            title: "Suspend User",
            description: `Suspend ${user.displayName || user.email}? They will lose access immediately.`,
            variant: "destructive",
            action: async () => {
                const result = await suspendUser(user.id);
                if (result.success) {
                    toast({ title: "User Suspended", description: `${user.email} has been suspended.` });
                    loadUsers();
                } else {
                    toast({ title: "Error", description: result.error, variant: "destructive" });
                }
            },
        });
    };

    const handleReactivate = (user: AdminUserItem) => {
        setConfirmDialog({
            open: true,
            title: "Reactivate User",
            description: `Reactivate ${user.displayName || user.email}? They will regain access.`,
            variant: "default",
            action: async () => {
                const result = await reactivateUser(user.id);
                if (result.success) {
                    toast({ title: "User Reactivated", description: `${user.email} has been reactivated.` });
                    loadUsers();
                } else {
                    toast({ title: "Error", description: result.error, variant: "destructive" });
                }
            },
        });
    };

    const handleMakeAdmin = (user: AdminUserItem) => {
        setConfirmDialog({
            open: true,
            title: "Make Admin",
            description: `Grant admin privileges to ${user.displayName || user.email}? They will have full platform control.`,
            variant: "default",
            action: async () => {
                const result = await changeUserRole(user.id, "admin");
                if (result.success) {
                    toast({ title: "Role Changed", description: `${user.email} is now an admin.` });
                    loadUsers();
                } else {
                    toast({ title: "Error", description: result.error, variant: "destructive" });
                }
            },
        });
    };

    const handleRemoveAdmin = (user: AdminUserItem) => {
        setConfirmDialog({
            open: true,
            title: "Remove Admin",
            description: `Remove admin privileges from ${user.displayName || user.email}?`,
            variant: "destructive",
            action: async () => {
                const result = await changeUserRole(user.id, "user");
                if (result.success) {
                    toast({ title: "Role Changed", description: `${user.email} is now a regular user.` });
                    loadUsers();
                } else {
                    toast({ title: "Error", description: result.error, variant: "destructive" });
                }
            },
        });
    };

    const handleCreditSubmit = async () => {
        if (!creditDialog.user || !creditAmount || !creditReason.trim()) return;

        setCreditLoading(true);
        const amt = parseInt(creditAmount, 10);
        const finalAmount = creditDialog.mode === "remove" ? -Math.abs(amt) : Math.abs(amt);

        try {
            const result = await adminAdjustCredits(creditDialog.user.id, finalAmount, creditReason.trim());
            if (result.success) {
                toast({
                    title: "Credits Adjusted",
                    description: `${creditDialog.user.email} now has ${result.newBalance} credits.`,
                });
                setCreditDialog({ open: false, user: null, mode: "add" });
                setCreditAmount("");
                setCreditReason("");
                loadUsers();
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to adjust credits", variant: "destructive" });
        } finally {
            setCreditLoading(false);
        }
    };

    const handleBulkApprove = async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;

        const result = await bulkApproveUsers(ids);
        if (result.success) {
            toast({ title: "Bulk Approve", description: `${result.count} user(s) approved.` });
            setSelectedIds(new Set());
            loadUsers();
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    const handleBulkReject = async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;

        const result = await bulkRejectUsers(ids);
        if (result.success) {
            toast({ title: "Bulk Reject", description: `${result.count} user(s) rejected.` });
            setSelectedIds(new Set());
            loadUsers();
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-white">User Management</h1>
                <p className="text-sm text-white/40 mt-1">
                    {total} user{total !== 1 ? "s" : ""} total
                </p>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2 flex-1">
                    <Input
                        placeholder="Search by name or email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 flex-1"
                    />
                    <Button onClick={handleSearch} size="sm" variant="outline" className="border-white/10 text-white/60 hover:text-white">
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {STATUS_TABS.map((tab) => (
                        <Button
                            key={tab.value}
                            size="sm"
                            variant={statusFilter === tab.value ? "default" : "ghost"}
                            onClick={() => handleFilterChange(tab.value)}
                            className={
                                statusFilter === tab.value
                                    ? "bg-white/10 text-white text-xs"
                                    : "text-white/40 text-xs hover:text-white/70"
                            }
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-sm text-white/60">{selectedIds.size} selected</span>
                    <Button size="sm" onClick={handleBulkApprove} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                        <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                        Approve Selected
                    </Button>
                    <Button size="sm" onClick={handleBulkReject} variant="destructive" className="text-xs">
                        <XSquare className="h-3.5 w-3.5 mr-1.5" />
                        Reject Selected
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} className="text-xs text-white/40">
                        Clear
                    </Button>
                </div>
            )}

            {/* Users Table */}
            <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-semibold text-white">Users</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="h-6 w-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mx-auto" />
                            <p className="text-sm text-white/30 mt-3">Loading users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-white/40">No users found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                                        <TableHead className="w-10">
                                            <Checkbox
                                                checked={selectedIds.size === users.length && users.length > 0}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead className="text-xs text-white/40">User</TableHead>
                                        <TableHead className="text-xs text-white/40">Status</TableHead>
                                        <TableHead className="text-xs text-white/40">Role</TableHead>
                                        <TableHead className="text-xs text-white/40">Plan</TableHead>
                                        <TableHead className="text-xs text-white/40 text-right">Credits</TableHead>
                                        <TableHead className="text-xs text-white/40">Joined</TableHead>
                                        <TableHead className="text-xs text-white/40 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id} className="border-white/[0.03] hover:bg-white/[0.02]">
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedIds.has(user.id)}
                                                    onCheckedChange={() => toggleSelect(user.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-7 w-7">
                                                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email} />
                                                        <AvatarFallback className="bg-teal-600/20 text-teal-300 text-[0.5rem]">
                                                            {getInitials(user.displayName || user.email)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-white/80 truncate max-w-[160px]">
                                                            {user.displayName || "—"}
                                                        </p>
                                                        <p className="text-[0.6rem] text-white/30 truncate max-w-[160px]">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell>{getPlanBadge(user.plan)}</TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-xs text-white/60 font-mono">{user.credits}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-white/40 whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white/40 hover:text-white">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-white/10">
                                                        <DropdownMenuItem asChild className="cursor-pointer text-white/70">
                                                            <Link href={`/admin/users/${user.id}`}>
                                                                <Eye className="h-3.5 w-3.5 mr-2" /> View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/5" />

                                                        {(user.status === "pending_approval" || user.status === "rejected") && (
                                                            <DropdownMenuItem onClick={() => handleApprove(user)} className="cursor-pointer text-emerald-400">
                                                                <UserCheck className="h-3.5 w-3.5 mr-2" /> Approve
                                                            </DropdownMenuItem>
                                                        )}
                                                        {user.status === "pending_approval" && (
                                                            <DropdownMenuItem onClick={() => handleReject(user)} className="cursor-pointer text-red-400">
                                                                <UserX className="h-3.5 w-3.5 mr-2" /> Reject
                                                            </DropdownMenuItem>
                                                        )}
                                                        {user.status === "approved" && (
                                                            <DropdownMenuItem onClick={() => handleSuspend(user)} className="cursor-pointer text-red-400">
                                                                <Ban className="h-3.5 w-3.5 mr-2" /> Suspend
                                                            </DropdownMenuItem>
                                                        )}
                                                        {user.status === "suspended" && (
                                                            <DropdownMenuItem onClick={() => handleReactivate(user)} className="cursor-pointer text-emerald-400">
                                                                <Unlock className="h-3.5 w-3.5 mr-2" /> Reactivate
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuSeparator className="bg-white/5" />

                                                        <DropdownMenuItem
                                                            onClick={() => setCreditDialog({ open: true, user, mode: "add" })}
                                                            className="cursor-pointer text-white/70"
                                                        >
                                                            <Plus className="h-3.5 w-3.5 mr-2" /> Add Credits
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setCreditDialog({ open: true, user, mode: "remove" })}
                                                            className="cursor-pointer text-white/70"
                                                        >
                                                            <Minus className="h-3.5 w-3.5 mr-2" /> Remove Credits
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator className="bg-white/5" />

                                                        {user.role !== "admin" ? (
                                                            <DropdownMenuItem onClick={() => handleMakeAdmin(user)} className="cursor-pointer text-purple-400">
                                                                <Shield className="h-3.5 w-3.5 mr-2" /> Make Admin
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem onClick={() => handleRemoveAdmin(user)} className="cursor-pointer text-red-400">
                                                                <ShieldOff className="h-3.5 w-3.5 mr-2" /> Remove Admin
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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

            {/* Credit Adjustment Dialog */}
            <Dialog
                open={creditDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setCreditDialog({ open: false, user: null, mode: "add" });
                        setCreditAmount("");
                        setCreditReason("");
                    }
                }}
            >
                <DialogContent className="bg-slate-900 border-white/10 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            {creditDialog.mode === "add" ? "Add Credits" : "Remove Credits"}
                        </DialogTitle>
                        <DialogDescription className="text-white/40">
                            {creditDialog.user?.email} — Current balance: {creditDialog.user?.credits} credits
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="text-white/60">Amount</Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="Enter amount"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white/60">Reason</Label>
                            <Textarea
                                placeholder="Reason for adjustment..."
                                value={creditReason}
                                onChange={(e) => setCreditReason(e.target.value)}
                                className="bg-white/5 border-white/10 text-white min-h-[80px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setCreditDialog({ open: false, user: null, mode: "add" })}
                            className="text-white/40"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreditSubmit}
                            disabled={creditLoading || !creditAmount || !creditReason.trim()}
                            className={
                                creditDialog.mode === "add"
                                    ? "bg-teal-600 hover:bg-teal-500 text-white"
                                    : "bg-red-600 hover:bg-red-500 text-white"
                            }
                        >
                            {creditLoading
                                ? "Processing..."
                                : creditDialog.mode === "add"
                                    ? `Add ${creditAmount || 0} Credits`
                                    : `Remove ${creditAmount || 0} Credits`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation AlertDialog */}
            <AlertDialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!open) setConfirmDialog((prev) => ({ ...prev, open: false }));
                }}
            >
                <AlertDialogContent className="bg-slate-900 border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">{confirmDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/40">
                            {confirmDialog.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white/60 hover:bg-white/5 hover:text-white">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                await confirmDialog.action();
                                setConfirmDialog((prev) => ({ ...prev, open: false }));
                            }}
                            className={
                                confirmDialog.variant === "destructive"
                                    ? "bg-red-600 hover:bg-red-500 text-white"
                                    : "bg-teal-600 hover:bg-teal-500 text-white"
                            }
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}