'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radio, ListChecks, Cable, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavLinkItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    matchExact?: boolean;
}

export const HEADER_NAV_ITEMS: NavLinkItem[] = [
    {
        label: 'Analysis',
        href: '/',
        icon: <Radio className="h-3.5 w-3.5" />,
        matchExact: true,
    },
    {
        label: 'Bulk',
        href: '/bulk-los-analyzer',
        icon: <ListChecks className="h-3.5 w-3.5" />,
    },
    {
        label: 'Fiber',
        href: '/fiber-calculator',
        icon: <Cable className="h-3.5 w-3.5" />,
    },
    {
        label: 'Pricing',
        href: '/pricing',
        icon: <CreditCard className="h-3.5 w-3.5" />,
    },
];

function isLinkActive(pathname: string, href: string, matchExact?: boolean): boolean {
    if (matchExact) {
        return pathname === href;
    }
    return pathname.startsWith(href);
}

interface NavLinksProps {
    className?: string;
    /** Filter items based on user approval status */
    isApproved?: boolean;
}

export function NavLinks({ className, isApproved = true }: NavLinksProps) {
    const pathname = usePathname();

    // Non-approved users can only see Pricing
    const visibleItems = isApproved
        ? HEADER_NAV_ITEMS
        : HEADER_NAV_ITEMS.filter((item) => item.href === '/pricing');

    return (
        <nav className={cn('flex items-center gap-1', className)} aria-label="Main navigation">
            {visibleItems.map((item) => {
                const active = isLinkActive(pathname, item.href, item.matchExact);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-brand-sm font-medium transition-colors whitespace-nowrap',
                            active
                                ? 'text-text-brand-primary'
                                : 'text-text-brand-muted hover:text-text-brand-secondary hover:bg-surface-overlay/50'
                        )}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                        {/* Active indicator — bottom bar */}
                        {active && (
                            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-500 rounded-full" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}

export default NavLinks;