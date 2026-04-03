'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    X,
    Radio,
    ListChecks,
    Cable,
    CreditCard,
    LayoutDashboard,
    Shield,
    Settings,
    Info,
    LogOut,
    Coins,
    Zap,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { FindLOSLogo } from '@/components/ui/findlos-logo';
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

// ── Nav items ───────────────────────────────────────────

interface MobileNavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    matchExact?: boolean;
    requiresApproval?: boolean;
    requiresAdmin?: boolean;
    dividerBefore?: boolean;
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
    { label: 'Analysis', href: '/', icon: <Radio className="h-5 w-5" />, matchExact: true, requiresApproval: true },
    { label: 'Bulk Analyzer', href: '/bulk-los-analyzer', icon: <ListChecks className="h-5 w-5" />, requiresApproval: true },
    { label: 'Fiber Calculator', href: '/fiber-calculator', icon: <Cable className="h-5 w-5" />, requiresApproval: true },
    { label: 'Pricing', href: '/pricing', icon: <CreditCard className="h-5 w-5" /> },
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, dividerBefore: true },
    { label: 'Settings', href: '/pricing', icon: <Settings className="h-5 w-5" /> },
    { label: 'About', href: '#', icon: <Info className="h-5 w-5" /> },
    { label: 'Admin Panel', href: '/admin', icon: <Shield className="h-5 w-5" />, requiresAdmin: true, dividerBefore: true },
];

// ── Props ───────────────────────────────────────────────

interface MobileNavProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role: UserRole;
        status: UserStatus;
        credits: number;
        plan: UserPlan;
    } | null;
}

// ── Component ───────────────────────────────────────────

export function MobileNav({ isOpen, onClose, user }: MobileNavProps) {
    const pathname = usePathname();
    const isAdmin = user?.role === 'admin';
    const isApproved = user?.status === 'approved' || isAdmin;

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Close on route change
    useEffect(() => {
        onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    if (!isOpen) return null;

    const filteredItems = MOBILE_NAV_ITEMS.filter((item) => {
        if (item.requiresAdmin && !isAdmin) return false;
        if (item.requiresApproval && !isApproved) return false;
        return true;
    });

    function isActive(href: string, matchExact?: boolean): boolean {
        if (matchExact) return pathname === href;
        return pathname.startsWith(href);
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-overlay bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                className="fixed top-0 right-0 bottom-0 w-[280px] max-w-[85vw] z-modal bg-surface-card border-l border-surface-border shadow-brand-xl animate-slide-in-right flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
                    <FindLOSLogo variant="wordmark" size="sm" />
                    <button
                        onClick={onClose}
                        className="h-9 w-9 flex items-center justify-center rounded-md text-text-brand-muted hover:text-text-brand-primary hover:bg-surface-overlay transition-colors"
                        aria-label="Close navigation"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* User info */}
                {user && (
                    <div className="px-4 py-4 border-b border-surface-border">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                                <AvatarFallback className="bg-brand-600/30 text-brand-300 text-sm font-semibold">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-text-brand-primary truncate">
                                    {user.name || 'User'}
                                </p>
                                <p className="text-xs text-text-brand-muted truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                            {user.plan === 'pro' ? (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pro-gradient text-text-brand-inverse text-xs font-semibold">
                                    <Zap className="h-3 w-3" />
                                    Pro
                                </span>
                            ) : (
                                <span className="text-xs text-text-brand-muted">Free Plan</span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                                <Coins className="h-3 w-3" />
                                {user.credits} credits
                            </span>
                        </div>
                    </div>
                )}

                {/* Nav links */}
                <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                    {filteredItems.map((item, index) => {
                        const active = isActive(item.href, item.matchExact);
                        return (
                            <React.Fragment key={item.href + item.label}>
                                {item.dividerBefore && index > 0 && (
                                    <div className="my-1 mx-4 border-t border-surface-border" />
                                )}
                                <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className={cn(
                                        'flex items-center gap-3 mx-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors touch-target',
                                        active
                                            ? 'bg-brand-500/10 text-brand-400'
                                            : 'text-text-brand-secondary hover:text-text-brand-primary hover:bg-surface-overlay/50'
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Sign out */}
                {user && (
                    <div className="border-t border-surface-border px-2 py-2">
                        <button
                            onClick={() => {
                                onClose();
                                signOut({ callbackUrl: '/auth/signin' });
                            }}
                            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-status-danger hover:bg-status-danger/10 transition-colors touch-target"
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default MobileNav;