// src/components/layout/admin-sidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Users,
    Radio,
    CreditCard,
    ClipboardList,
    Settings,
    Menu,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ── Nav Item Definition ─────────────────────

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    exact?: boolean;
    disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    {
        href: "/admin",
        label: "Dashboard",
        icon: <BarChart3 className="h-4 w-4" />,
        exact: true,
    },
    {
        href: "/admin/users",
        label: "Users",
        icon: <Users className="h-4 w-4" />,
    },
    {
        href: "/admin/analysis-logs",
        label: "Analysis Logs",
        icon: <Radio className="h-4 w-4" />,
    },
    {
        href: "/admin/credit-logs",
        label: "Credit Logs",
        icon: <CreditCard className="h-4 w-4" />,
    },
    {
        href: "/admin/audit-log",
        label: "Audit Log",
        icon: <ClipboardList className="h-4 w-4" />,
    },
    {
        href: "/admin/settings",
        label: "Settings",
        icon: <Settings className="h-4 w-4" />,
        disabled: true,
    },
];

// ── Sidebar Content (shared between desktop & mobile) ───

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();

    function isActive(item: NavItem): boolean {
        if (item.exact) return pathname === item.href;
        return pathname.startsWith(item.href);
    }

    return (
        <nav className="flex flex-col gap-1 px-2 py-3">
            {NAV_ITEMS.map((item) => {
                if (item.disabled) {
                    return (
                        <div
                            key={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-brand-disabled cursor-not-allowed"
                        >
                            {item.icon}
                            <span className="text-sm">{item.label}</span>
                            <Badge
                                variant="outline"
                                className="ml-auto text-[0.55rem] h-4 px-1.5 border-surface-border text-text-brand-disabled"
                            >
                                Soon
                            </Badge>
                        </div>
                    );
                }

                const active = isActive(item);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            active
                                ? "bg-surface-overlay text-text-brand-primary border border-surface-border-light"
                                : "text-text-brand-muted hover:text-text-brand-secondary hover:bg-surface-elevated border border-transparent"
                        )}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

// ── Main Component ──────────────────────────

export default function AdminSidebar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Mobile trigger — fixed button */}
            <div className="lg:hidden fixed bottom-4 left-4 z-40">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button
                            size="icon"
                            className="h-10 w-10 rounded-full bg-surface-card border border-surface-border shadow-lg hover:bg-surface-elevated"
                        >
                            {open ? (
                                <X className="h-4 w-4 text-text-brand-primary" />
                            ) : (
                                <Menu className="h-4 w-4 text-text-brand-primary" />
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="w-64 bg-surface-card border-r border-surface-border p-0"
                    >
                        <SheetHeader className="px-4 pt-4 pb-2">
                            <SheetTitle className="text-sm font-semibold text-text-brand-secondary">
                                Admin Panel
                            </SheetTitle>
                        </SheetHeader>
                        <Separator className="bg-surface-border" />
                        <SidebarNav onNavigate={() => setOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-surface-card/60 border-r border-surface-border">
                <div className="px-4 py-3">
                    <p className="text-xs font-semibold text-text-brand-muted uppercase tracking-wider">
                        Admin Panel
                    </p>
                </div>
                <Separator className="bg-surface-border" />
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <SidebarNav />
                </div>
            </aside>
        </>
    );
}