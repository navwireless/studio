'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type LogoVariant = 'full' | 'icon' | 'wordmark';
type LogoSize = 'sm' | 'md' | 'lg';

interface FindLOSLogoProps {
    variant?: LogoVariant;
    size?: LogoSize;
    className?: string;
}

const SIZES: Record<LogoSize, { height: number; iconSize: number }> = {
    sm: { height: 24, iconSize: 20 },
    md: { height: 32, iconSize: 28 },
    lg: { height: 48, iconSize: 40 },
};

const FONT_SIZES: Record<LogoSize, number> = {
    sm: 20,
    md: 26,
    lg: 40,
};

const WORDMARK_WIDTHS: Record<LogoSize, number> = {
    sm: 100,
    md: 132,
    lg: 200,
};

const FULL_WIDTHS: Record<LogoSize, number> = {
    sm: 128,
    md: 168,
    lg: 252,
};

function IconMark({ size, className }: { size: LogoSize; className?: string }) {
    const s = SIZES[size].iconSize;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="none"
            width={s}
            height={s}
            className={className}
            aria-hidden="true"
        >
            {/* Rounded square background */}
            <rect x="1" y="1" width="30" height="30" rx="7" fill="#0A0F18" stroke="#1E293B" strokeWidth="1" />
            {/* Crosshair circles */}
            <circle cx="16" cy="16" r="8" stroke="#334155" strokeWidth="1.5" fill="none" />
            <circle cx="16" cy="16" r="3" stroke="#334155" strokeWidth="1.5" fill="none" />
            {/* Crosshair lines */}
            <line x1="16" y1="4" x2="16" y2="11" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="21" x2="16" y2="28" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="4" y1="16" x2="11" y2="16" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="21" y1="16" x2="28" y2="16" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
            {/* LOS line — brand blue diagonal */}
            <line x1="7" y1="25" x2="25" y2="7" stroke="#0066FF" strokeWidth="2.5" strokeLinecap="round" />
            {/* Site markers */}
            <circle cx="7" cy="25" r="2.5" fill="#0066FF" />
            <circle cx="25" cy="7" r="2.5" fill="#0066FF" />
        </svg>
    );
}

function Wordmark({ size, className }: { size: LogoSize; className?: string }) {
    const h = SIZES[size].height;
    const w = WORDMARK_WIDTHS[size];
    const fs = FONT_SIZES[size];
    // Baseline offset: roughly 75% of height for proper text alignment
    const baseline = Math.round(h * 0.75);

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${w} ${h}`}
            width={w}
            height={h}
            fill="none"
            className={className}
            aria-label="FindLOS"
            role="img"
        >
            <text
                x="0"
                y={baseline}
                fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                fontSize={fs}
                fontWeight="700"
                letterSpacing="-0.5"
            >
                <tspan fill="#F8FAFC">Find</tspan>
                <tspan fill="#0066FF">LOS</tspan>
            </text>
        </svg>
    );
}

export function FindLOSLogo({
    variant = 'full',
    size = 'md',
    className,
}: FindLOSLogoProps) {
    if (variant === 'icon') {
        return <IconMark size={size} className={className} />;
    }

    if (variant === 'wordmark') {
        return <Wordmark size={size} className={className} />;
    }

    // Full variant: icon + wordmark side by side
    const h = SIZES[size].height;
    const iconS = SIZES[size].iconSize;
    const fs = FONT_SIZES[size];
    const gap = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
    const totalW = FULL_WIDTHS[size];
    const textX = iconS + gap;
    const baseline = Math.round(h * 0.75);

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${totalW} ${h}`}
            width={totalW}
            height={h}
            fill="none"
            className={cn('shrink-0', className)}
            aria-label="FindLOS"
            role="img"
        >
            {/* Icon mark — scaled and centered vertically */}
            <g transform={`translate(0, ${(h - iconS) / 2})`}>
                <svg
                    viewBox="0 0 32 32"
                    width={iconS}
                    height={iconS}
                >
                    <rect x="1" y="1" width="30" height="30" rx="7" fill="#0A0F18" stroke="#1E293B" strokeWidth="1" />
                    <circle cx="16" cy="16" r="8" stroke="#334155" strokeWidth="1.5" fill="none" />
                    <circle cx="16" cy="16" r="3" stroke="#334155" strokeWidth="1.5" fill="none" />
                    <line x1="16" y1="4" x2="16" y2="11" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="16" y1="21" x2="16" y2="28" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="4" y1="16" x2="11" y2="16" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="21" y1="16" x2="28" y2="16" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="7" y1="25" x2="25" y2="7" stroke="#0066FF" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="7" cy="25" r="2.5" fill="#0066FF" />
                    <circle cx="25" cy="7" r="2.5" fill="#0066FF" />
                </svg>
            </g>

            {/* Wordmark text */}
            <text
                x={textX}
                y={baseline}
                fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                fontSize={fs}
                fontWeight="700"
                letterSpacing="-0.5"
            >
                <tspan fill="#F8FAFC">Find</tspan>
                <tspan fill="#0066FF">LOS</tspan>
            </text>
        </svg>
    );
}

export default FindLOSLogo;