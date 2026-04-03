'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  LogOut,
  LayoutDashboard,
  Shield,
  Settings,
  Info,
  Coins,
  Zap,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { UserRole, UserStatus, UserPlan } from '@/types/auth';

// ── Helpers ─────────────────────────────────────────────

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// ── Props ───────────────────────────────────────────────

interface UserMenuProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
    status: UserStatus;
    credits: number;
    plan: UserPlan;
    planExpiresAt?: string | null;
  };
  className?: string;
}

// ── Component ───────────────────────────────────────────

export function UserMenu({ user, className }: UserMenuProps) {
  const isAdmin = user.role === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'h-8 w-8 rounded-full ring-2 ring-surface-border hover:ring-surface-border-light transition-all flex-shrink-0 focus:outline-none focus:ring-brand-500/50',
            className
          )}
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || 'User'}
            />
            <AvatarFallback className="bg-brand-600/30 text-brand-300 text-xs font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 bg-surface-elevated border-surface-border-light shadow-brand-xl rounded-lg"
      >
        {/* User info section */}
        <DropdownMenuLabel className="font-normal px-3 py-2.5">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-text-brand-primary truncate">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-text-brand-muted truncate">
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {user.plan === 'pro' ? (
                <Badge
                  variant="outline"
                  className="text-[0.65rem] h-5 px-2 bg-pro-gradient text-text-brand-inverse border-0 font-semibold"
                >
                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                  Pro
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[0.65rem] h-5 px-2 bg-surface-overlay text-text-brand-secondary border-surface-border-light"
                >
                  Free
                </Badge>
              )}
              <span className="text-[0.65rem] text-text-brand-muted">
                •
              </span>
              <span className="flex items-center gap-1 text-[0.65rem] text-amber-400">
                <Coins className="h-2.5 w-2.5" />
                {user.credits}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-surface-border" />

        {/* Navigation items */}
        <DropdownMenuItem asChild className="cursor-pointer px-3 py-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-text-brand-secondary hover:text-text-brand-primary text-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        {isAdmin && (
          <DropdownMenuItem asChild className="cursor-pointer px-3 py-2">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 text-text-brand-secondary hover:text-text-brand-primary text-sm"
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild className="cursor-pointer px-3 py-2">
          <Link
            href="/pricing"
            className="flex items-center gap-2.5 text-text-brand-secondary hover:text-text-brand-primary text-sm"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-surface-border" />

        <DropdownMenuItem asChild className="cursor-pointer px-3 py-2">
          <Link
            href="#"
            className="flex items-center gap-2.5 text-text-brand-secondary hover:text-text-brand-primary text-sm"
          >
            <Info className="h-4 w-4" />
            About FindLOS
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-surface-border" />

        {/* Sign out */}
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="cursor-pointer px-3 py-2 text-status-danger hover:text-status-danger-light focus:text-status-danger"
        >
          <LogOut className="h-4 w-4 mr-2.5" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;