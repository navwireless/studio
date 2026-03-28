// src/components/layout/map-header.tsx
"use client";

import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
    LogOut,
    LayoutDashboard,
    Shield,
    Coins,
    Menu,
    Radio,
    ListChecks,
    Cable,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import MapSearchBar from "@/components/fso/map-search-bar";
import type { PlacementMode } from "@/types";

// ── Helpers ─────────────────────────────────────────────

function getInitials(name: string | null | undefined): string {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function getStatusColor(status: string | null): string {
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

function getStatusLabel(status: string | null): string {
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

// ── Nav pill data ───────────────────────────────────────

interface NavPill {
    href: string;
    label: string;
    icon: React.ReactNode;
    pageId: string;
}

const NAV_PILLS: NavPill[] = [
    {
        href: "/",
        label: "Single",
        icon: <Radio className="h-3.5 w-3.5" />,
        pageId: "home",
    },
    {
        href: "/bulk-los-analyzer",
        label: "Bulk",
        icon: <ListChecks className="h-3.5 w-3.5" />,
        pageId: "bulk",
    },
    {
        href: "/fiber-calculator",
        label: "Fiber",
        icon: <Cable className="h-3.5 w-3.5" />,
        pageId: "fiber",
    },
];

// ── Props ───────────────────────────────────────────────

interface MapHeaderProps {
    onToggleSidePanel?: () => void;
    showHamburger?: boolean;
    onSearchPlaceSelected?: (lat: number, lng: number, name: string) => void;
    onSearchPlaceA?: (lat: number, lng: number, name: string) => void;
    onSearchPlaceB?: (lat: number, lng: number, name: string) => void;
    onSearchNavigateOnly?: (lat: number, lng: number, name: string) => void;
    placementMode?: PlacementMode;
    showSearch?: boolean;
}

export default function MapHeader({
    onToggleSidePanel,
    showHamburger = true,
    onSearchPlaceSelected,
    onSearchPlaceA,
    onSearchPlaceB,
    onSearchNavigateOnly,
    placementMode = null,
    showSearch = true,
}: MapHeaderProps) {
    const { user, isAuthenticated, isAdmin, credits, status } = useAuth();
    const pathname = usePathname();

    const currentPage =
        pathname === "/"
            ? "home"
            : pathname.startsWith("/bulk")
                ? "bulk"
                : pathname.startsWith("/fiber")
                    ? "fiber"
                    : "";

    return (
        <div className="absolute top-0 left-0 right-0 z-20 flex flex-col gap-2 px-3 pt-3 pb-1 pointer-events-none">
            {/* ── Row 1: Search bar with hamburger + avatar ── */}
            <div className="flex items-center gap-2.5 pointer-events-auto">
                {/* Hamburger (mobile only — opens side panel) */}
                {showHamburger && onToggleSidePanel && (
                    <button
                        onClick={onToggleSidePanel}
                        className="lg:hidden w-12 h-12 rounded-full bg-white shadow-md shadow-black/15 flex items-center justify-center text-gray-700 hover:bg-gray-50 flex-shrink-0 touch-manipulation active:scale-95 transition-all"
                        aria-label="Open side panel"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                )}

                {/* Search bar (fills center) */}
                {showSearch && onSearchPlaceSelected ? (
                    <div className="flex-1 min-w-0 bg-white rounded-full shadow-md shadow-black/15 flex items-center overflow-hidden">
                        <MapSearchBar
                            onPlaceSelected={onSearchPlaceSelected}
                            onPlaceASelected={onSearchPlaceA}
                            onPlaceBSelected={onSearchPlaceB}
                            onNavigateOnly={onSearchNavigateOnly}
                            placementMode={placementMode ?? null}
                            className="flex-1 min-w-0 [&_>_div]:bg-transparent [&_>_div]:border-0 [&_>_div]:shadow-none [&_>_div]:rounded-none [&_>_div]:backdrop-blur-none [&_input]:text-gray-800 [&_input]:placeholder:text-gray-400 [&_svg.lucide-search]:text-gray-400"
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 bg-white rounded-full px-5 py-3 shadow-md shadow-black/15 flex-shrink-0">
                        <span className="text-sm font-bold text-gray-800 tracking-wide">
                            FindLOS
                        </span>
                    </div>
                )}

                {/* User avatar button */}
                {isAuthenticated && user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="w-12 h-12 rounded-full bg-white shadow-md shadow-black/15 flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0 touch-manipulation active:scale-95 p-0.5"
                                aria-label="User menu"
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage
                                        src={user.image || undefined}
                                        alt={user.name || "User"}
                                        className="rounded-full"
                                    />
                                    <AvatarFallback className="bg-teal-600 text-white text-sm font-semibold">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            sideOffset={8}
                            className="w-72 bg-white border-gray-200 shadow-xl rounded-2xl"
                        >
                            {/* User info */}
                            <DropdownMenuLabel className="font-normal px-4 py-3">
                                <div className="flex flex-col gap-1.5">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                            variant="outline"
                                            className={`text-[0.65rem] h-5 px-2 ${getStatusColor(status)}`}
                                        >
                                            {getStatusLabel(status)}
                                        </Badge>
                                        {user.plan === "pro" && (
                                            <Badge
                                                variant="outline"
                                                className="text-[0.65rem] h-5 px-2 bg-purple-50 text-purple-600 border-purple-200"
                                            >
                                                PRO
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator className="bg-gray-100" />

                            {/* Credits */}
                            <DropdownMenuItem
                                disabled
                                className="flex items-center justify-between opacity-100 px-4 py-2.5"
                            >
                                <span className="flex items-center gap-2.5 text-gray-600 text-sm">
                                    <Coins className="h-4 w-4" />
                                    Credits
                                </span>
                                <Badge className="bg-teal-50 text-teal-700 border-teal-200 font-semibold text-sm px-2.5">
                                    {credits}
                                </Badge>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-gray-100" />

                            <DropdownMenuItem asChild className="cursor-pointer px-4 py-2.5">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2.5 text-gray-700 hover:text-gray-900 text-sm"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                            </DropdownMenuItem>

                            {isAdmin && (
                                <DropdownMenuItem asChild className="cursor-pointer px-4 py-2.5">
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-2.5 text-gray-700 hover:text-gray-900 text-sm"
                                    >
                                        <Shield className="h-4 w-4" />
                                        Admin Panel
                                    </Link>
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="bg-gray-100" />

                            <DropdownMenuItem
                                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                                className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700 px-4 py-2.5 text-sm"
                            >
                                <LogOut className="h-4 w-4 mr-2.5" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link
                        href="/auth/signin"
                        className="h-12 px-5 rounded-full bg-white shadow-md shadow-black/15 flex items-center justify-center text-sm font-semibold text-gray-700 hover:shadow-lg transition-all flex-shrink-0"
                    >
                        Sign In
                    </Link>
                )}
            </div>

            {/* ── Row 2: Horizontal scrollable nav pills ── */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pointer-events-auto pl-1 pr-1">
                {NAV_PILLS.map((pill) => {
                    const isActive = currentPage === pill.pageId;
                    return (
                        <Link key={pill.pageId} href={pill.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all touch-manipulation active:scale-95",
                                    "shadow-sm shadow-black/10",
                                    isActive
                                        ? "bg-white text-gray-900 shadow-md shadow-black/15 ring-1 ring-black/5"
                                        : "bg-gray-800/75 backdrop-blur-md text-white/90 hover:bg-gray-700/80"
                                )}
                            >
                                {pill.icon}
                                {pill.label}
                            </div>
                        </Link>
                    );
                })}

                {/* Credits pill */}
                {isAuthenticated && (
                    <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-gray-800/75 backdrop-blur-md text-teal-300 text-sm font-semibold whitespace-nowrap shadow-sm shadow-black/10">
                        <Coins className="h-3.5 w-3.5" />
                        {credits}
                    </div>
                )}
            </div>
        </div>
    );
}