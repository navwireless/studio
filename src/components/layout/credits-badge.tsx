'use client';

import React from 'react';
import Link from 'next/link';
import { Coins, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserPlan } from '@/types/auth';

interface CreditsBadgeProps {
    credits: number;
    plan: UserPlan | null;
    className?: string;
}

export function CreditsBadge({ credits, plan, className }: CreditsBadgeProps) {
    if (plan === 'pro') {
        return (
            <div
                className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                    'bg-pro-gradient text-text-brand-inverse',
                    className
                )}
            >
                <Zap className="h-3 w-3" />
                <span>Pro</span>
            </div>
        );
    }

    return (
        <Link
            href="/pricing"
            className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                'bg-surface-overlay text-text-brand-secondary hover:bg-surface-overlay/80 hover:text-text-brand-primary',
                className
            )}
            title="View pricing plans"
        >
            <Coins className="h-3 w-3 text-amber-400" />
            <span>{credits}</span>
        </Link>
    );
}

export default CreditsBadge;