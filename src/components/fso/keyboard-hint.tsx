'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface KeyboardHintProps {
    show: boolean;
}

export default function KeyboardHint({ show }: KeyboardHintProps) {
    const [dismissed, setDismissed] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Check if user already dismissed
        try {
            if (localStorage.getItem('findlos_kb_hint_dismissed') === 'true') {
                setDismissed(true);
                return;
            }
        } catch { /* ignore */ }

        // Show after 3 seconds on first desktop visit
        if (show && !dismissed) {
            const timer = setTimeout(() => setVisible(true), 3000);
            const autoHide = setTimeout(() => {
                setVisible(false);
                setDismissed(true);
                try { localStorage.setItem('findlos_kb_hint_dismissed', 'true'); } catch { /* ignore */ }
            }, 12000);
            return () => {
                clearTimeout(timer);
                clearTimeout(autoHide);
            };
        }
    }, [show, dismissed]);

    if (!visible || dismissed) return null;

    return (
        <div className={cn(
            'absolute bottom-4 left-1/2 -translate-x-1/2 z-30',
            'bg-slate-900/95 backdrop-blur-2xl rounded-2xl px-5 py-3',
            'border border-slate-700/40 shadow-2xl shadow-black/50',
            'animate-in fade-in slide-in-from-bottom-4 duration-500',
            'hidden lg:block' // Desktop only
        )}>
            <div className="flex items-center gap-4 text-[0.65rem] text-slate-400">
                <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[0.6rem]">A</kbd>
                    <span>Place Site A</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[0.6rem]">B</kbd>
                    <span>Place Site B</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[0.6rem]">Enter</kbd>
                    <span>Analyze</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[0.6rem]">S</kbd>
                    <span>Save</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[0.6rem]">Esc</kbd>
                    <span>Cancel</span>
                </div>
                <button
                    onClick={() => {
                        setVisible(false);
                        setDismissed(true);
                        try { localStorage.setItem('findlos_kb_hint_dismissed', 'true'); } catch { /* ignore */ }
                    }}
                    className="ml-2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}