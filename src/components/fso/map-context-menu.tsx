'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { MapContextMenuState } from '@/types';
import { cn } from '@/lib/utils';
import { MapPin, Copy, Info, X } from 'lucide-react';

interface MapContextMenuProps {
    state: MapContextMenuState;
    onClose: () => void;
    onPlaceSite: (site: 'A' | 'B', lat: number, lng: number) => void;
    onCopyCoordinates: (lat: number, lng: number) => void;
    onNavigateHere: (lat: number, lng: number) => void;
    onWhatsHere: (lat: number, lng: number) => void;
}

function formatDMS(decimal: number, isLat: boolean): string {
    const abs = Math.abs(decimal);
    const d = Math.floor(abs);
    const mFloat = (abs - d) * 60;
    const m = Math.floor(mFloat);
    const s = ((mFloat - m) * 60).toFixed(1);
    const dir = isLat ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
    return `${d}\u00B0${m}'${s}"${dir}`;
}

export default function MapContextMenu({
    state,
    onClose,
    onPlaceSite,
    onCopyCoordinates,
    onWhatsHere,
}: MapContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
    const [reverseResult, setReverseResult] = useState<string | null>(null);
    const [isReversing, setIsReversing] = useState(false);
    const [adjustedPos, setAdjustedPos] = useState({ x: state.x, y: state.y });
    const [isMobile, setIsMobile] = useState(false);

    // Swipe-to-dismiss refs for mobile bottom sheet
    const sheetDragStartY = useRef(0);
    const sheetDragCurrentY = useRef(0);
    const sheetDragging = useRef(false);

    // Detect mobile
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Reset state when menu opens
    useEffect(() => {
        if (state.isOpen) {
            setReverseResult(null);
            setIsReversing(false);
        }
    }, [state.isOpen]);

    // Adjust desktop position to keep menu within viewport
    useEffect(() => {
        if (!state.isOpen || !menuRef.current || isMobile) return;
        const rect = menuRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let x = state.x;
        let y = state.y;
        if (x + rect.width > vw - 8) x = vw - rect.width - 8;
        if (y + rect.height > vh - 8) y = vh - rect.height - 8;
        if (x < 8) x = 8;
        if (y < 8) y = 8;
        setAdjustedPos({ x, y });
    }, [state, isMobile]);

    // Close on outside click/touch
    useEffect(() => {
        if (!state.isOpen) return;
        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node;
            const ref = isMobile ? sheetRef.current : menuRef.current;
            if (ref && !ref.contains(target)) {
                onClose();
            }
        };
        const handleScroll = () => { if (!isMobile) onClose(); };
        window.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('touchstart', handlePointerDown, { passive: true });
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            window.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('touchstart', handlePointerDown);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [state.isOpen, onClose, isMobile]);

    // Close on Escape
    useEffect(() => {
        if (!state.isOpen) return;
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [state.isOpen, onClose]);

    // Mobile bottom sheet swipe-to-dismiss
    useEffect(() => {
        if (!state.isOpen || !isMobile) return;
        const sheet = sheetRef.current;
        if (!sheet) return;

        const onTouchStart = (e: TouchEvent) => {
            sheetDragStartY.current = e.touches[0].clientY;
            sheetDragCurrentY.current = e.touches[0].clientY;
            sheetDragging.current = true;
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!sheetDragging.current) return;
            const y = e.touches[0].clientY;
            const dy = y - sheetDragStartY.current;
            sheetDragCurrentY.current = y;
            // Only allow dragging down
            if (dy > 0) {
                sheet.style.transform = `translateY(${dy}px)`;
                sheet.style.transition = 'none';
            }
        };

        const onTouchEnd = () => {
            if (!sheetDragging.current) return;
            sheetDragging.current = false;
            const dy = sheetDragCurrentY.current - sheetDragStartY.current;
            const velocity = dy / 300; // rough velocity estimate
            if (dy > 80 || velocity > 0.5) {
                // Dismiss
                sheet.style.transition = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)';
                sheet.style.transform = 'translateY(100%)';
                setTimeout(onClose, 250);
            } else {
                // Snap back
                sheet.style.transition = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)';
                sheet.style.transform = 'translateY(0)';
            }
        };

        sheet.addEventListener('touchstart', onTouchStart, { passive: true });
        sheet.addEventListener('touchmove', onTouchMove, { passive: true });
        sheet.addEventListener('touchend', onTouchEnd, { passive: true });
        return () => {
            sheet.removeEventListener('touchstart', onTouchStart);
            sheet.removeEventListener('touchmove', onTouchMove);
            sheet.removeEventListener('touchend', onTouchEnd);
        };
    }, [state.isOpen, isMobile, onClose]);

    const handleWhatsHere = useCallback(async () => {
        setIsReversing(true);
        setReverseResult(null);
        try {
            if (typeof google !== 'undefined' && google.maps) {
                const geocoder = new google.maps.Geocoder();
                const result = await geocoder.geocode({ location: { lat: state.lat, lng: state.lng } });
                if (result.results?.[0]) {
                    setReverseResult(result.results[0].formatted_address);
                } else {
                    setReverseResult('No address found');
                }
            }
        } catch {
            setReverseResult('Geocoding failed');
        } finally {
            setIsReversing(false);
        }
        onWhatsHere(state.lat, state.lng);
    }, [state.lat, state.lng, onWhatsHere]);

    if (!state.isOpen) return null;

    const menuActions = [
        {
            icon: <MapPin className="h-4 w-4 text-emerald-400" />,
            label: 'Place Site A here',
            shortcut: 'A',
            onClick: () => { onPlaceSite('A', state.lat, state.lng); onClose(); },
        },
        {
            icon: <MapPin className="h-4 w-4 text-blue-400" />,
            label: 'Place Site B here',
            shortcut: 'B',
            onClick: () => { onPlaceSite('B', state.lat, state.lng); onClose(); },
        },
        { type: 'divider' as const },
        {
            icon: <Copy className="h-4 w-4" />,
            label: 'Copy coordinates',
            onClick: () => { onCopyCoordinates(state.lat, state.lng); onClose(); },
        },
        {
            icon: <Info className="h-4 w-4" />,
            label: "What's here?",
            onClick: handleWhatsHere,
        },
    ];

    // ═══════════════════════════════════════════════════════
    // MOBILE: Bottom Sheet
    // ═══════════════════════════════════════════════════════
    if (isMobile) {
        return (
            <>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-[99] bg-black/50 sheet-backdrop"
                    onClick={onClose}
                />

                {/* Bottom Sheet */}
                <div
                    ref={sheetRef}
                    className={cn(
                        'fixed bottom-0 left-0 right-0 z-[100]',
                        'bg-slate-900/98 backdrop-blur-2xl',
                        'border-t border-slate-700/50',
                        'rounded-t-2xl shadow-2xl shadow-black/60',
                        'sheet-enter',
                        'pb-safe'
                    )}
                >
                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-slate-600" />
                    </div>

                    {/* Coordinate header */}
                    <div className="px-5 py-3 border-b border-slate-700/30 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-mono text-slate-200 leading-relaxed">
                                {state.lat.toFixed(6)}, {state.lng.toFixed(6)}
                            </p>
                            <p className="text-xs font-mono text-muted-foreground/60 mt-0.5">
                                {formatDMS(state.lat, true)} {formatDMS(state.lng, false)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-1 -mt-1 rounded-full hover:bg-slate-700/40 text-muted-foreground touch-target touch-manipulation"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="py-2 px-2">
                        {menuActions.map((item, i) => {
                            if ('type' in item && item.type === 'divider') {
                                return <div key={i} className="my-1.5 mx-3 border-t border-slate-700/30" />;
                            }
                            const action = item as { icon: React.ReactNode; label: string; shortcut?: string; onClick: () => void };
                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (navigator.vibrate) navigator.vibrate(15);
                                        action.onClick();
                                    }}
                                    className={cn(
                                        'w-full flex items-center gap-3.5 px-4 py-3.5 text-left',
                                        'text-sm text-slate-200 active:bg-white/[0.08]',
                                        'rounded-xl transition-colors touch-target-lg touch-manipulation'
                                    )}
                                >
                                    <span className="text-muted-foreground">{action.icon}</span>
                                    <span className="flex-1 font-medium">{action.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Reverse geocode result */}
                    {(isReversing || reverseResult) && (
                        <div className="px-5 py-3 border-t border-slate-700/30 mb-1">
                            {isReversing ? (
                                <p className="text-xs text-muted-foreground animate-pulse">Looking up address...</p>
                            ) : reverseResult ? (
                                <p className="text-xs text-slate-300 leading-relaxed">{reverseResult}</p>
                            ) : null}
                        </div>
                    )}
                </div>
            </>
        );
    }

    // ═══════════════════════════════════════════════════════
    // DESKTOP: Floating context menu (unchanged behavior)
    // ═══════════════════════════════════════════════════════
    return (
        <div
            ref={menuRef}
            className={cn(
                'fixed z-[100] min-w-[220px] max-w-[300px]',
                'bg-slate-900/98 backdrop-blur-2xl border border-slate-700/50',
                'rounded-xl shadow-2xl shadow-black/40',
                'animate-in fade-in zoom-in-95 duration-150',
                'overflow-hidden'
            )}
            style={{ left: adjustedPos.x, top: adjustedPos.y }}
        >
            {/* Coordinate header */}
            <div className="px-3 py-2 border-b border-slate-700/30">
                <p className="text-[0.65rem] font-mono text-muted-foreground leading-relaxed">
                    {state.lat.toFixed(6)}, {state.lng.toFixed(6)}
                </p>
                <p className="text-[0.55rem] font-mono text-muted-foreground/60">
                    {formatDMS(state.lat, true)} {formatDMS(state.lng, false)}
                </p>
            </div>

            {/* Menu items */}
            <div className="py-1">
                {menuActions.map((item, i) => {
                    if ('type' in item && item.type === 'divider') {
                        return <div key={i} className="my-1 border-t border-slate-700/30" />;
                    }
                    const menuItem = item as { icon: React.ReactNode; label: string; shortcut?: string; onClick: () => void };
                    return (
                        <button
                            key={i}
                            onClick={menuItem.onClick}
                            className={cn(
                                'w-full flex items-center gap-2.5 px-3 py-2 text-left',
                                'text-xs text-slate-200 hover:bg-white/[0.06]',
                                'transition-colors duration-100'
                            )}
                        >
                            <span className="text-muted-foreground">{menuItem.icon}</span>
                            <span className="flex-1">{menuItem.label}</span>
                            {menuItem.shortcut && (
                                <kbd className="text-[0.55rem] text-muted-foreground/50 bg-slate-800/80 px-1.5 py-0.5 rounded font-mono">
                                    {menuItem.shortcut}
                                </kbd>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Reverse geocode result */}
            {(isReversing || reverseResult) && (
                <div className="px-3 py-2 border-t border-slate-700/30">
                    {isReversing ? (
                        <p className="text-[0.6rem] text-muted-foreground animate-pulse">Looking up address...</p>
                    ) : reverseResult ? (
                        <p className="text-[0.6rem] text-slate-300 leading-relaxed">{reverseResult}</p>
                    ) : null}
                </div>
            )}
        </div>
    );
}