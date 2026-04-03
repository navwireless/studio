// src/components/help/whats-new-modal.tsx
'use client';

import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import { COLORS, SHADOWS, Z_INDEX, RADIUS } from '@/styles/design-tokens';
import type { WhatsNewItem } from '@/content/whats-new';

interface WhatsNewModalProps {
    items: WhatsNewItem[];
    isOpen: boolean;
    onClose: () => void;
}

export function WhatsNewModal({ items, isOpen, onClose }: WhatsNewModalProps) {
    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen || items.length === 0) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 transition-opacity duration-200"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: Z_INDEX.modal - 1,
                    opacity: isOpen ? 1 : 0,
                }}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                role="dialog"
                aria-label="What's New in FindLOS"
                aria-modal="true"
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 transition-all duration-200"
                style={{
                    zIndex: Z_INDEX.modal,
                    opacity: isOpen ? 1 : 0,
                    transform: `translate(-50%, -50%) scale(${isOpen ? 1 : 0.95})`,
                }}
            >
                <div
                    className="overflow-hidden"
                    style={{
                        backgroundColor: COLORS.surface.elevated,
                        border: `1px solid ${COLORS.surface.borderLight}`,
                        borderRadius: RADIUS.xl,
                        boxShadow: SHADOWS.xl,
                    }}
                >
                    {/* Header */}
                    <div className="px-6 pt-6 pb-2">
                        <h2
                            style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: COLORS.text.primary,
                            }}
                        >
                            🚀 What&apos;s New in FindLOS
                        </h2>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-4 max-h-[60vh] overflow-y-auto space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-lg p-4"
                                style={{
                                    backgroundColor: COLORS.surface.card,
                                    border: `1px solid ${COLORS.surface.border}`,
                                }}
                            >
                                {/* Version + date */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span
                                        className="inline-flex px-2 py-0.5 rounded-full text-white"
                                        style={{
                                            fontSize: '0.6875rem',
                                            fontWeight: 600,
                                            backgroundColor: COLORS.primary[500],
                                        }}
                                    >
                                        v{item.version}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: COLORS.text.muted }}>
                                        {new Date(item.date).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3
                                    className="mb-1"
                                    style={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: COLORS.text.primary,
                                    }}
                                >
                                    {item.title}
                                </h3>

                                {/* Description */}
                                <p
                                    className="mb-3"
                                    style={{
                                        fontSize: '0.8125rem',
                                        color: COLORS.text.secondary,
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {item.description}
                                </p>

                                {/* Features */}
                                <ul className="space-y-1.5">
                                    {item.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <Check
                                                className="h-3.5 w-3.5 mt-0.5 flex-shrink-0"
                                                style={{ color: COLORS.success.DEFAULT }}
                                            />
                                            <span
                                                style={{
                                                    fontSize: '0.8125rem',
                                                    color: COLORS.text.secondary,
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6 pt-2">
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-lg text-white text-sm font-semibold transition-colors"
                            style={{
                                backgroundColor: COLORS.primary[500],
                                borderRadius: RADIUS.lg,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = COLORS.primary[600];
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = COLORS.primary[500];
                            }}
                        >
                            Awesome, let&apos;s go! →
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}