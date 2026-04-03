// src/components/onboarding/tour-step.tsx
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { COLORS, RADIUS, SHADOWS, Z_INDEX } from '@/styles/design-tokens';
import type { TourStep } from '@/content/tour-steps';

interface TourStepTooltipProps {
    step: TourStep;
    stepIndex: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
    onSkip: (dontShowAgain: boolean) => void;
    onComplete: () => void;
    isFirst: boolean;
    isLast: boolean;
    isWelcome: boolean;
}

interface TooltipPosition {
    top: number;
    left: number;
    arrowSide: 'top' | 'bottom' | 'left' | 'right' | 'none';
}

const TOOLTIP_MAX_WIDTH = 360;
const TOOLTIP_MIN_WIDTH = 280;
const VIEWPORT_PADDING = 16;
const ARROW_SIZE = 12;

function calculatePosition(
    target: string,
    preferredPosition: TourStep['position']
): TooltipPosition {
    // Center position — place in middle of screen
    if (target === 'center' || preferredPosition === 'center') {
        return {
            top: window.innerHeight / 2,
            left: window.innerWidth / 2,
            arrowSide: 'none',
        };
    }

    try {
        const el = document.querySelector(target);
        if (!el) {
            return {
                top: window.innerHeight / 2,
                left: window.innerWidth / 2,
                arrowSide: 'none',
            };
        }

        const rect = el.getBoundingClientRect();
        const tooltipWidth = Math.min(TOOLTIP_MAX_WIDTH, window.innerWidth - VIEWPORT_PADDING * 2);

        let top = 0;
        let left = 0;
        let arrowSide: TooltipPosition['arrowSide'] = 'none';

        switch (preferredPosition) {
            case 'right': {
                top = rect.top + rect.height / 2;
                left = rect.right + ARROW_SIZE + 12;
                arrowSide = 'left';

                // Flip to left if overflows right
                if (left + tooltipWidth > window.innerWidth - VIEWPORT_PADDING) {
                    left = rect.left - tooltipWidth - ARROW_SIZE - 12;
                    arrowSide = 'right';
                }
                break;
            }
            case 'left': {
                top = rect.top + rect.height / 2;
                left = rect.left - tooltipWidth - ARROW_SIZE - 12;
                arrowSide = 'right';

                // Flip to right if overflows left
                if (left < VIEWPORT_PADDING) {
                    left = rect.right + ARROW_SIZE + 12;
                    arrowSide = 'left';
                }
                break;
            }
            case 'bottom': {
                top = rect.bottom + ARROW_SIZE + 12;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                arrowSide = 'top';

                // Flip to top if overflows bottom
                if (top + 200 > window.innerHeight - VIEWPORT_PADDING) {
                    top = rect.top - ARROW_SIZE - 12;
                    arrowSide = 'bottom';
                }
                break;
            }
            case 'top': {
                top = rect.top - ARROW_SIZE - 12;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                arrowSide = 'bottom';

                // Flip to bottom if overflows top
                if (top < VIEWPORT_PADDING + 100) {
                    top = rect.bottom + ARROW_SIZE + 12;
                    arrowSide = 'top';
                }
                break;
            }
            default: {
                top = rect.bottom + ARROW_SIZE + 12;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                arrowSide = 'top';
            }
        }

        // Clamp horizontal position
        left = Math.max(VIEWPORT_PADDING, Math.min(left, window.innerWidth - tooltipWidth - VIEWPORT_PADDING));

        // Clamp vertical position
        top = Math.max(VIEWPORT_PADDING, Math.min(top, window.innerHeight - 100));

        return { top, left, arrowSide };
    } catch {
        return {
            top: window.innerHeight / 2,
            left: window.innerWidth / 2,
            arrowSide: 'none',
        };
    }
}

export function TourStepTooltip({
    step,
    stepIndex,
    totalSteps,
    onNext,
    onPrev,
    onSkip,
    onComplete,
    isFirst,
    isLast,
    isWelcome,
}: TourStepTooltipProps) {
    const [position, setPosition] = useState<TooltipPosition>({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        arrowSide: 'none',
    });
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const updatePosition = useCallback(() => {
        const pos = calculatePosition(step.target, step.position);
        setPosition(pos);
    }, [step.target, step.position]);

    useEffect(() => {
        updatePosition();

        // Fade in after a tick
        const fadeTimer = setTimeout(() => setIsVisible(true), 50);

        const handleResize = () => requestAnimationFrame(updatePosition);
        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(fadeTimer);
            window.removeEventListener('resize', handleResize);
        };
    }, [updatePosition]);

    // Reset visibility on step change
    useEffect(() => {
        setIsVisible(false);
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, [stepIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                e.preventDefault();
                if (isLast) onComplete();
                else onNext();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (!isFirst && !isWelcome) onPrev();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onSkip(dontShowAgain);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFirst, isLast, isWelcome, onNext, onPrev, onSkip, onComplete, dontShowAgain]);

    // Focus trap
    useEffect(() => {
        if (tooltipRef.current) {
            tooltipRef.current.focus();
        }
    }, [stepIndex]);

    const isCentered = step.position === 'center' || step.target === 'center';
    const showDontShowAgain = stepIndex >= totalSteps - 2;

    // Determine transform for centered vs positioned
    const tooltipStyle: React.CSSProperties = isCentered
        ? {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.95})`,
            opacity: isVisible ? 1 : 0,
            zIndex: Z_INDEX.modal,
            maxWidth: TOOLTIP_MAX_WIDTH,
            minWidth: TOOLTIP_MIN_WIDTH,
            transition: 'opacity 200ms ease, transform 200ms ease',
        }
        : {
            position: 'fixed',
            top: position.arrowSide === 'bottom' ? 'auto' : position.top,
            bottom: position.arrowSide === 'bottom' ? window.innerHeight - position.top : 'auto',
            left: position.left,
            transform: `translateY(${position.arrowSide === 'left' || position.arrowSide === 'right' ? '-50%' : '0'}) scale(${isVisible ? 1 : 0.95})`,
            opacity: isVisible ? 1 : 0,
            zIndex: Z_INDEX.modal,
            maxWidth: TOOLTIP_MAX_WIDTH,
            minWidth: TOOLTIP_MIN_WIDTH,
            transition: 'opacity 200ms ease, transform 200ms ease, top 300ms ease, left 300ms ease',
        };

    const arrowStyle = getArrowStyle(position.arrowSide);

    return (
        <div
            ref={tooltipRef}
            role="dialog"
            aria-label={step.title}
            aria-describedby={`tour-step-desc-${step.id}`}
            tabIndex={-1}
            className="outline-none"
            style={tooltipStyle}
        >
            <div
                className="relative"
                style={{
                    backgroundColor: COLORS.surface.elevated,
                    border: `1px solid ${COLORS.surface.borderLight}`,
                    borderRadius: RADIUS.xl,
                    boxShadow: SHADOWS.xl,
                    padding: '20px 24px',
                }}
            >
                {/* Arrow */}
                {!isCentered && position.arrowSide !== 'none' && (
                    <div style={arrowStyle} />
                )}

                {/* Step counter */}
                {!isWelcome && !isLast && (
                    <p
                        className="mb-2"
                        style={{ fontSize: '0.75rem', color: COLORS.text.muted }}
                    >
                        Step {stepIndex + 1} of {totalSteps}
                    </p>
                )}

                {/* Title */}
                <h3
                    className="mb-2"
                    style={{
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        color: COLORS.text.primary,
                        lineHeight: 1.3,
                    }}
                >
                    {step.title}
                </h3>

                {/* Description */}
                <p
                    id={`tour-step-desc-${step.id}`}
                    className="mb-5"
                    style={{
                        fontSize: '0.8125rem',
                        color: COLORS.text.secondary,
                        lineHeight: 1.75,
                    }}
                >
                    {step.description}
                </p>

                {/* Don't show again checkbox */}
                {showDontShowAgain && (
                    <label
                        className="flex items-center gap-2 mb-4 cursor-pointer select-none"
                        style={{ fontSize: '0.75rem', color: COLORS.text.muted }}
                    >
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 h-3.5 w-3.5"
                        />
                        Don&apos;t show this tour again
                    </label>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-2">
                    {/* Back button */}
                    {!isFirst && !isWelcome && (
                        <button
                            onClick={onPrev}
                            className="px-3 h-9 rounded-md text-xs font-medium transition-colors hover:bg-white/5"
                            style={{ color: COLORS.text.muted }}
                        >
                            Back
                        </button>
                    )}

                    {/* Skip button */}
                    <button
                        onClick={() => onSkip(dontShowAgain)}
                        className="px-3 h-9 rounded-md text-xs font-medium transition-colors hover:bg-white/5"
                        style={{ color: COLORS.text.muted }}
                    >
                        {isWelcome ? 'Skip Tour' : 'Skip'}
                    </button>

                    <div className="flex-1" />

                    {/* Next / Start / Complete button */}
                    {isWelcome ? (
                        <button
                            onClick={onNext}
                            className="px-4 h-9 rounded-md text-xs font-semibold text-white transition-colors"
                            style={{
                                backgroundColor: COLORS.primary[500],
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = COLORS.primary[600];
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = COLORS.primary[500];
                            }}
                        >
                            Start Tour →
                        </button>
                    ) : isLast ? (
                        <button
                            onClick={onComplete}
                            className="px-4 h-9 rounded-md text-xs font-semibold text-white transition-colors"
                            style={{
                                backgroundColor: COLORS.primary[500],
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = COLORS.primary[600];
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = COLORS.primary[500];
                            }}
                        >
                            Get Started! →
                        </button>
                    ) : (
                        <button
                            onClick={onNext}
                            className="px-4 h-9 rounded-md text-xs font-semibold text-white transition-colors"
                            style={{
                                backgroundColor: COLORS.primary[500],
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = COLORS.primary[600];
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = COLORS.primary[500];
                            }}
                        >
                            Next →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function getArrowStyle(
    side: TooltipPosition['arrowSide']
): React.CSSProperties {
    const base: React.CSSProperties = {
        position: 'absolute',
        width: 0,
        height: 0,
        borderStyle: 'solid',
    };

    const color = COLORS.surface.elevated;

    switch (side) {
        case 'top':
            return {
                ...base,
                top: -ARROW_SIZE,
                left: '50%',
                marginLeft: -ARROW_SIZE,
                borderWidth: `0 ${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px`,
                borderColor: `transparent transparent ${color} transparent`,
            };
        case 'bottom':
            return {
                ...base,
                bottom: -ARROW_SIZE,
                left: '50%',
                marginLeft: -ARROW_SIZE,
                borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px 0 ${ARROW_SIZE}px`,
                borderColor: `${color} transparent transparent transparent`,
            };
        case 'left':
            return {
                ...base,
                left: -ARROW_SIZE,
                top: '50%',
                marginTop: -ARROW_SIZE,
                borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px 0`,
                borderColor: `transparent ${color} transparent transparent`,
            };
        case 'right':
            return {
                ...base,
                right: -ARROW_SIZE,
                top: '50%',
                marginTop: -ARROW_SIZE,
                borderWidth: `${ARROW_SIZE}px 0 ${ARROW_SIZE}px ${ARROW_SIZE}px`,
                borderColor: `transparent transparent transparent ${color}`,
            };
        default:
            return { display: 'none' };
    }
}