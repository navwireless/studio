"use client";

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

export interface InfoTooltipProps {
    /** Tooltip text content */
    text: string;
    /** Preferred side for tooltip placement */
    side?: 'top' | 'right' | 'bottom' | 'left';
    /** Maximum width of tooltip in pixels */
    maxWidth?: number;
    /** Additional class names for the trigger icon */
    className?: string;
    /** Icon size in pixels */
    iconSize?: number;
}

/**
 * A small ⓘ icon that shows an informational tooltip on hover (desktop)
 * or tap (mobile). Uses Radix UI Tooltip for accessible positioning.
 *
 * @example
 * <label>
 *   Tower Height <InfoTooltip text="Height of antenna above ground level in meters." />
 * </label>
 */
export function InfoTooltip({
    text,
    side = 'top',
    maxWidth = 280,
    className,
    iconSize = 14,
}: InfoTooltipProps) {
    return (
        <TooltipPrimitive.Provider delayDuration={300} skipDelayDuration={0}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    <button
                        type="button"
                        className={cn(
                            'inline-flex items-center justify-center rounded-full',
                            'text-text-brand-muted hover:text-text-brand-secondary',
                            'cursor-help transition-colors duration-200',
                            'focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500/50',
                            'touch-manipulation',
                            className
                        )}
                        style={{ width: iconSize, height: iconSize }}
                        aria-label="More information"
                    >
                        <Info style={{ width: iconSize, height: iconSize }} />
                    </button>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side={side}
                        sideOffset={6}
                        className={cn(
                            'z-[700] rounded-md px-3 py-2',
                            'bg-surface-elevated border border-surface-border-light',
                            'shadow-md',
                            'text-xs text-text-brand-secondary leading-relaxed',
                            'animate-in fade-in-0 zoom-in-95',
                            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                            'data-[side=top]:slide-in-from-bottom-2',
                            'data-[side=bottom]:slide-in-from-top-2',
                            'data-[side=left]:slide-in-from-right-2',
                            'data-[side=right]:slide-in-from-left-2',
                        )}
                        style={{ maxWidth }}
                    >
                        {text}
                        <TooltipPrimitive.Arrow
                            className="fill-surface-elevated"
                            width={10}
                            height={5}
                        />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
}

export default InfoTooltip;