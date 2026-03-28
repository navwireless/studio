// src/components/layout/app-header.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LogOut,
  LayoutDashboard,
  Shield,
  Coins,
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

// ── Nav items ───────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  pageId: string;
}

const NAV_ITEMS: NavItem[] = [
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

// ── Component ───────────────────────────────────────────

export default function AppHeader() {
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
    <header className="bg-slate-900/80 backdrop-blur-xl h-11 flex items-center justify-between px-3 z-50 relative print:hidden border-b border-white/[0.04] flex-shrink-0">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0 mr-1"
        >
          <span className="text-sm font-bold text-white tracking-wide">
            FindLOS
          </span>
        </Link>

        {/* Nav pills */}
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.pageId;
          return (
            <Link key={item.pageId} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all",
                  isActive
                    ? "bg-white/10 border-white/15 text-white"
                    : "bg-transparent border-transparent text-white/40 hover:text-white/70 hover:bg-white/5"
                )}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Right: Credits + User */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Credits */}
        {isAuthenticated && (
          <Badge
            variant="outline"
            className="text-[0.6rem] h-5 px-2 bg-teal-500/10 text-teal-400 border-teal-500/20 font-medium hidden sm:flex"
          >
            <Coins className="h-2.5 w-2.5 mr-1" />
            {credits}
          </Badge>
        )}

        {/* User menu */}
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-7 w-7 rounded-full ring-2 ring-white/10 hover:ring-white/20 transition-all flex-shrink-0"
                aria-label="User menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.name || "User"}
                  />
                  <AvatarFallback className="bg-teal-600/30 text-teal-300 text-[0.55rem] font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-64 bg-slate-900/98 backdrop-blur-2xl border-white/10 shadow-2xl"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-medium text-white/90 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-white/40 truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant="outline"
                      className={`text-[0.6rem] h-4 px-1.5 ${getStatusColor(status)}`}
                    >
                      {getStatusLabel(status)}
                    </Badge>
                    {user.plan === "pro" && (
                      <Badge
                        variant="outline"
                        className="text-[0.6rem] h-4 px-1.5 bg-purple-500/20 text-purple-400 border-purple-500/30"
                      >
                        PRO
                      </Badge>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-white/5" />

              <DropdownMenuItem
                disabled
                className="flex items-center justify-between opacity-100"
              >
                <span className="flex items-center gap-2 text-white/60">
                  <Coins className="h-3.5 w-3.5" />
                  Credits
                </span>
                <Badge
                  variant="outline"
                  className="text-xs bg-teal-500/10 text-teal-400 border-teal-500/30 font-semibold"
                >
                  {credits}
                </Badge>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/5" />

              <DropdownMenuItem asChild className="cursor-pointer">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-white/70 hover:text-white"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              </DropdownMenuItem>

              {isAdmin && (
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-white/70 hover:text-white"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-white/5" />

              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="cursor-pointer text-red-400/80 hover:text-red-400 focus:text-red-400"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/auth/signin"
            className="text-xs font-medium text-teal-400 hover:text-teal-300 px-3 py-1.5 rounded-full border border-teal-500/20 hover:bg-teal-500/10 transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}