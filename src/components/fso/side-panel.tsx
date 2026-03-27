"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';
import type { AnalysisResult, AnalysisFormValues, PlacementMode, SavedLink } from '@/types';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import TowerHeightControl from './tower-height-control';
import { AnimatedNumber } from '@/components/animated-number';
import { cn } from '@/lib/utils';
import { useGoogleMapsLoader } from '@/components/GoogleMapsLoaderProvider';
import { timeAgo } from '@/hooks/use-saved-links';
import {
    X, Crosshair, Zap, Trash2, Download, Loader2, AlertTriangle,
    Cable, ChevronDown, ChevronRight, Settings2, Ruler, Radio,
    MapPin, FileDown, BookmarkPlus, Search, Check,
    Save, Globe, FileSpreadsheet, FileText, History, CheckCircle, XCircle,
    Plus
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
// Explicit Tailwind color classes (JIT-safe)
// ═══════════════════════════════════════════════════════
const SITE_COLORS = {
    emerald: {
        activeBorder: 'border-emerald-500/50', activeBg: 'bg-emerald-500/5',
        badgeBg: 'bg-emerald-500/20', badgeText: 'text-emerald-400',
        btnActiveBg: 'bg-emerald-500/20', btnActiveText: 'text-emerald-400', btnActiveBorder: 'border-emerald-500/30',
    },
    blue: {
        activeBorder: 'border-blue-500/50', activeBg: 'bg-blue-500/5',
        badgeBg: 'bg-blue-500/20', badgeText: 'text-blue-400',
        btnActiveBg: 'bg-blue-500/20', btnActiveText: 'text-blue-400', btnActiveBorder: 'border-blue-500/30',
    },
} as const;
type SiteColorKey = keyof typeof SITE_COLORS;

// ═══════════════════════════════════════════════════════
// Search Bar (FIXED: stable listener via ref pattern)
// ═══════════════════════════════════════════════════════
interface SearchBarProps { onPlaceSelected: (lat: number, lng: number, name: string) => void; }

function SearchBar({ onPlaceSelected }: SearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const onPlaceSelectedRef = useRef(onPlaceSelected);
    const { isLoaded } = useGoogleMapsLoader();

    useEffect(() => {
        onPlaceSelectedRef.current = onPlaceSelected;
    }, [onPlaceSelected]);

    useEffect(() => {
        if (!isLoaded || !inputRef.current || autocompleteRef.current) return;
        try {
            const ac = new google.maps.places.Autocomplete(inputRef.current, {
                fields: ['geometry', 'name', 'formatted_address'],
            });
            ac.addListener('place_changed', () => {
                const place = ac.getPlace();
                if (place.geometry?.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    const name = place.name || place.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    onPlaceSelectedRef.current(lat, lng, name);
                    if (inputRef.current) inputRef.current.value = '';
                }
            });
            autocompleteRef.current = ac;
        } catch (e) { console.warn('Places Autocomplete init failed:', e); }

        return () => {
            if (autocompleteRef.current) {
                google.maps.event.clearInstanceListeners(autocompleteRef.current);
                autocompleteRef.current = null;
            }
        };
    }, [isLoaded]);

    return (
        <div className="relative px-4 py-2 border-b border-slate-700/30">
            <Search className="absolute left-6.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none z-10" />
            <input ref={inputRef} type="text" placeholder="Search location..."
                className="w-full h-9 pl-8 pr-3 text-sm rounded-lg bg-slate-800/60 border border-slate-700/40 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors touch-manipulation" />
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// Collapsible Section
// ═══════════════════════════════════════════════════════
interface SectionProps { title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode; badge?: React.ReactNode; }
const Section: React.FC<SectionProps> = ({ title, icon, defaultOpen = true, children, badge }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-700/30">
            <button type="button" onClick={() => setOpen(p => !p)}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left touch-manipulation">
                <span className="text-muted-foreground/70">{icon}</span>
                <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-300 flex-1">{title}</span>
                {badge}
                {open ? <ChevronDown className="h-3 w-3 text-muted-foreground/50" /> : <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
            </button>
            <div className={cn("overflow-hidden transition-all duration-200", open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
                <div className="px-4 pb-3 pt-1">{children}</div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// Site Input Block
// ═══════════════════════════════════════════════════════
interface SiteBlockProps {
    id: 'pointA' | 'pointB'; label: string; colorKey: SiteColorKey;
    control: Control<AnalysisFormValues>; register: UseFormRegister<AnalysisFormValues>;
    clientFormErrors: FieldErrors<AnalysisFormValues>; serverFormErrors?: Record<string, string[] | undefined>;
    placementMode: PlacementMode; onPlace: () => void; isPending: boolean;
}
const SiteBlock: React.FC<SiteBlockProps> = ({ id, label, colorKey, control, register, clientFormErrors, serverFormErrors, placementMode, onPlace, isPending }) => {
    const colors = SITE_COLORS[colorKey];
    const isPlacing = placementMode === (id === 'pointA' ? 'A' : 'B');
    const getErr = (field: string) => {
        const nested = field.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let clientErr: any = clientFormErrors;
        for (const key of nested) clientErr = clientErr?.[key];
        const server = serverFormErrors?.[field];
        if (server?.length) return server[0];
        return clientErr?.message as string | undefined;
    };
    return (
        <div className={cn("rounded-lg border p-3 space-y-2 transition-colors",
            isPlacing ? `${colors.activeBorder} ${colors.activeBg}` : "border-slate-700/30 bg-slate-800/30")}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] font-black", colors.badgeBg, colors.badgeText)}>
                        {id === 'pointA' ? 'A' : 'B'}
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{label}</span>
                </div>
                <button type="button" onClick={onPlace} disabled={isPending}
                    className={cn("flex items-center gap-1 text-[0.6rem] px-2.5 py-1.5 rounded-md transition-all font-medium touch-manipulation",
                        isPlacing ? `${colors.btnActiveBg} ${colors.btnActiveText} border ${colors.btnActiveBorder}` : "text-muted-foreground hover:text-foreground hover:bg-slate-700/30")}>
                    <Crosshair className="h-3 w-3" />{isPlacing ? 'Placing...' : 'Map'}
                </button>
            </div>
            <div>
                <Label className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">Name</Label>
                <Input {...register(`${id}.name`)} placeholder="Site name" className="h-8 text-sm bg-slate-900/50 border-slate-700/40 rounded-md mt-0.5" />
                {getErr(`${id}.name`) && <p className="text-[0.6rem] text-destructive mt-0.5">{getErr(`${id}.name`)}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">Latitude</Label>
                    <Input {...register(`${id}.lat`)} placeholder="-90 to 90" className="h-8 text-sm bg-slate-900/50 border-slate-700/40 rounded-md mt-0.5" />
                    {getErr(`${id}.lat`) && <p className="text-[0.6rem] text-destructive mt-0.5">{getErr(`${id}.lat`)}</p>}
                </div>
                <div>
                    <Label className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">Longitude</Label>
                    <Input {...register(`${id}.lng`)} placeholder="-180 to 180" className="h-8 text-sm bg-slate-900/50 border-slate-700/40 rounded-md mt-0.5" />
                    {getErr(`${id}.lng`) && <p className="text-[0.6rem] text-destructive mt-0.5">{getErr(`${id}.lng`)}</p>}
                </div>
            </div>
            <Controller name={`${id}.height`} control={control} defaultValue={20}
                render={({ field }) => <TowerHeightControl label="Tower Height" height={field.value} onChange={field.onChange} min={0} max={100} idSuffix={id} />} />
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// Saved Link Card
// ═══════════════════════════════════════════════════════
interface SavedLinkCardProps {
    link: SavedLink; isSelected: boolean; isSelectionMode: boolean;
    onLoad: () => void; onDelete: () => void; onToggleSelect: () => void;
}
function SavedLinkCard({ link, isSelected, isSelectionMode, onLoad, onDelete, onToggleSelect }: SavedLinkCardProps) {
    const [showDelete, setShowDelete] = useState(false);
    return (
        <div
            onClick={isSelectionMode ? onToggleSelect : onLoad}
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
            className={cn(
                "group relative flex items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer touch-manipulation",
                isSelected ? "border-primary/50 bg-primary/5" : "border-slate-700/20 hover:border-slate-600/40 hover:bg-slate-800/30"
            )}
        >
            {isSelectionMode && (
                <div className={cn("w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                    isSelected ? "bg-primary border-primary" : "border-slate-600")}>
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
            )}
            <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: link.color }} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-200 truncate">{link.name}</span>
                    <span className={cn("text-[0.5rem] px-1 rounded font-bold flex-shrink-0",
                        link.analysisResult.losPossible ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                        {link.analysisResult.losPossible ? '\u2713' : '\u2717'}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[0.55rem] text-muted-foreground">{link.analysisResult.distanceKm.toFixed(1)}km</span>
                    <span className="text-[0.55rem] text-muted-foreground">&middot;</span>
                    <span className="text-[0.55rem] text-muted-foreground">{timeAgo(link.createdAt)}</span>
                    {link.fiberPathResult?.status === 'success' && (
                        <>
                            <span className="text-[0.55rem] text-muted-foreground">&middot;</span>
                            <span className="text-[0.55rem] text-blue-400">
                                <Cable className="h-2.5 w-2.5 inline mr-0.5" />
                                {((link.fiberPathResult.totalDistanceMeters || 0) / 1000).toFixed(1)}km
                            </span>
                        </>
                    )}
                </div>
            </div>
            {!isSelectionMode && showDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute right-1.5 top-1.5 p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors touch-manipulation">
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// History Card
// ═══════════════════════════════════════════════════════
interface HistoryCardProps { item: AnalysisResult; onLoad: () => void; }
function HistoryCard({ item, onLoad }: HistoryCardProps) {
    const ago = timeAgo(item.timestamp);
    return (
        <div onClick={onLoad}
            className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-700/20 hover:border-slate-600/40 hover:bg-slate-800/30 transition-all cursor-pointer touch-manipulation">
            <div className={cn("w-1 self-stretch rounded-full flex-shrink-0",
                item.losPossible ? "bg-emerald-500" : "bg-red-500")} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-200 truncate">
                        {item.pointA.name || 'Site A'} - {item.pointB.name || 'Site B'}
                    </span>
                    <span className={cn("text-[0.5rem] px-1 rounded font-bold flex-shrink-0",
                        item.losPossible ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                        {item.losPossible ? <CheckCircle className="h-2.5 w-2.5 inline" /> : <XCircle className="h-2.5 w-2.5 inline" />}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[0.55rem] text-muted-foreground">{item.distanceKm.toFixed(2)}km</span>
                    <span className="text-[0.55rem] text-muted-foreground">&middot;</span>
                    <span className="text-[0.55rem] text-muted-foreground">{ago}</span>
                    <span className="text-[0.55rem] text-muted-foreground">&middot;</span>
                    <span className="text-[0.55rem] text-muted-foreground">Clearance: {item.minClearance?.toFixed(1) ?? 'N/A'}m</span>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// Main Side Panel
// ═══════════════════════════════════════════════════════
export interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    control: Control<AnalysisFormValues>;
    register: UseFormRegister<AnalysisFormValues>;
    clientFormErrors: FieldErrors<AnalysisFormValues>;
    serverFormErrors?: Record<string, string[] | undefined>;
    placementMode: PlacementMode;
    onSetPlacementMode: (mode: PlacementMode) => void;
    onAnalyze: () => void;
    onClearMap: () => void;
    onNewLink: () => void;
    isActionPending: boolean;
    analysisResult: AnalysisResult | null;
    isStale: boolean;
    onDownloadPdf: () => void;
    isGeneratingPdf: boolean;
    fiberPathResult: FiberPathResult | null;
    isFiberCalculating: boolean;
    fiberPathError: string | null;
    isFiberPathEnabled: boolean;
    onToggleFiberPath: (enabled: boolean) => void;
    snapRadius: number;
    onSnapRadiusChange: (value: string) => void;
    onApplySnapRadius: () => void;
    clearanceThreshold: number;
    onClearanceThresholdChange: (value: number[]) => void;
    isPending: boolean;
    onSearchNavigate?: (lat: number, lng: number, name: string) => void;
    savedLinks: SavedLink[];
    onSaveLink: () => void;
    onLoadSavedLink: (link: SavedLink) => void;
    onDeleteSavedLink: (id: string) => void;
    onDeleteMultipleSavedLinks: (ids: string[]) => void;
    onClearAllSavedLinks: () => void;
    selectedLinkIds: string[];
    onToggleLinkSelection: (id: string) => void;
    onSelectAllLinks: () => void;
    onDeselectAllLinks: () => void;
    isSelectionMode: boolean;
    onSetSelectionMode: (mode: boolean) => void;
    onExportKmz: (links: SavedLink[]) => Promise<void>;
    onExportExcel: (links: SavedLink[]) => Promise<void>;
    onExportCsv: (links: SavedLink[]) => Promise<void>;
    onExportPdf: (links: SavedLink[]) => Promise<void>;
    historyList: AnalysisResult[];
    onLoadHistoryItem: (id: string) => void;
    onClearHistory: () => void;
}

export default function SidePanel({
    isOpen, onClose, control, register, clientFormErrors, serverFormErrors,
    placementMode, onSetPlacementMode, onAnalyze, onClearMap, onNewLink,
    isActionPending, analysisResult, isStale,
    onDownloadPdf, isGeneratingPdf,
    fiberPathResult, isFiberCalculating, fiberPathError,
    isFiberPathEnabled, onToggleFiberPath,
    snapRadius, onSnapRadiusChange, onApplySnapRadius,
    clearanceThreshold, onClearanceThresholdChange, isPending,
    onSearchNavigate,
    savedLinks, onSaveLink, onLoadSavedLink, onDeleteSavedLink,
    onDeleteMultipleSavedLinks, onClearAllSavedLinks,
    selectedLinkIds, onToggleLinkSelection, onSelectAllLinks, onDeselectAllLinks,
    isSelectionMode, onSetSelectionMode,
    onExportKmz, onExportExcel, onExportCsv, onExportPdf,
    historyList, onLoadHistoryItem, onClearHistory,
}: SidePanelProps) {

    const pointAName = useWatch({ control, name: 'pointA.name', defaultValue: "Site A" });
    const pointBName = useWatch({ control, name: 'pointB.name', defaultValue: "Site B" });
    const [exportingFormat, setExportingFormat] = useState<string | null>(null);

    const actualMinClearance = analysisResult?.minClearance ?? null;
    const isClear = analysisResult && actualMinClearance !== null ? actualMinClearance >= clearanceThreshold : false;
    const deficit = !isClear && actualMinClearance !== null ? Math.ceil(clearanceThreshold - actualMinClearance) : 0;
    const anyPending = isActionPending || isGeneratingPdf || isFiberCalculating;

    // ── Swipe-to-close gesture (mobile) ──
    const panelRef = useRef<HTMLElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const swipeState = useRef<{
        startX: number; startY: number; currentX: number;
        decided: boolean; isSwipe: boolean;
    } | null>(null);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isSwipeAnimating, setIsSwipeAnimating] = useState(false);

    useEffect(() => {
        if (!isOpen) { setSwipeOffset(0); return; }
        const panel = panelRef.current;
        if (!panel) return;

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length !== 1) return;
            const t = e.touches[0];
            swipeState.current = { startX: t.clientX, startY: t.clientY, currentX: t.clientX, decided: false, isSwipe: false };
        };
        const onTouchMove = (e: TouchEvent) => {
            const s = swipeState.current;
            if (!s || e.touches.length !== 1) return;
            const t = e.touches[0];
            s.currentX = t.clientX;
            if (!s.decided) {
                const dx = Math.abs(t.clientX - s.startX);
                const dy = Math.abs(t.clientY - s.startY);
                if (dx > 10 || dy > 10) { s.decided = true; s.isSwipe = dx > dy; }
                return;
            }
            if (!s.isSwipe) return;
            const dx = t.clientX - s.startX;
            if (dx < 0) { e.preventDefault(); setSwipeOffset(dx); }
        };
        const onTouchEnd = () => {
            const s = swipeState.current;
            if (!s || !s.isSwipe) { swipeState.current = null; setSwipeOffset(0); return; }
            const dx = s.currentX - s.startX;
            if (dx < -80) {
                setIsSwipeAnimating(true); setSwipeOffset(-320);
                setTimeout(() => { onClose(); setSwipeOffset(0); setIsSwipeAnimating(false); }, 250);
            } else {
                setIsSwipeAnimating(true); setSwipeOffset(0);
                setTimeout(() => setIsSwipeAnimating(false), 250);
            }
            swipeState.current = null;
        };

        panel.addEventListener('touchstart', onTouchStart, { passive: true });
        panel.addEventListener('touchmove', onTouchMove, { passive: false });
        panel.addEventListener('touchend', onTouchEnd, { passive: true });
        panel.addEventListener('touchcancel', onTouchEnd, { passive: true });
        return () => {
            panel.removeEventListener('touchstart', onTouchStart);
            panel.removeEventListener('touchmove', onTouchMove);
            panel.removeEventListener('touchend', onTouchEnd);
            panel.removeEventListener('touchcancel', onTouchEnd);
        };
    }, [isOpen, onClose]);

    const handlePlaceA = useCallback(() => {
        onSetPlacementMode(placementMode === 'A' ? null : 'A');
        if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose();
    }, [placementMode, onSetPlacementMode, onClose]);

    const handlePlaceB = useCallback(() => {
        onSetPlacementMode(placementMode === 'B' ? null : 'B');
        if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose();
    }, [placementMode, onSetPlacementMode, onClose]);

    const handlePlaceSelected = useCallback((lat: number, lng: number, name: string) => {
        if (onSearchNavigate) onSearchNavigate(lat, lng, name);
    }, [onSearchNavigate]);

    const getLinksToExport = useCallback((): SavedLink[] => {
        if (isSelectionMode && selectedLinkIds.length > 0) {
            const idSet = new Set(selectedLinkIds);
            return savedLinks.filter(l => idSet.has(l.id));
        }
        return savedLinks;
    }, [isSelectionMode, selectedLinkIds, savedLinks]);

    const handleExport = useCallback(async (format: string, fn: (links: SavedLink[]) => Promise<void>) => {
        const links = getLinksToExport();
        if (!links.length) return;
        setExportingFormat(format);
        try { await fn(links); } finally { setExportingFormat(null); }
    }, [getLinksToExport]);

    const exportCount = getLinksToExport().length;
    const hasExportLinks = exportCount > 0;
    const isExporting = exportingFormat !== null;
    const sortedHistory = [...historyList].sort((a, b) => b.timestamp - a.timestamp);

    const swipeProgress = Math.min(1, Math.abs(swipeOffset) / 320);
    const backdropOpacity = isOpen ? 1 - swipeProgress * 0.8 : 0;

    return (
        <>
            {isOpen && (
                <div ref={backdropRef} className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    style={{ opacity: backdropOpacity }} onClick={onClose} />
            )}

            <aside
                ref={panelRef}
                className={cn(
                    "flex flex-col bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/40 z-50",
                    "lg:relative lg:w-80 lg:flex-shrink-0 lg:translate-x-0 lg:z-auto",
                    "fixed inset-y-0 left-0 w-80",
                    !swipeOffset && !isSwipeAnimating ? "transition-transform duration-300 ease-out" : "",
                    isSwipeAnimating ? "transition-transform duration-250 ease-out" : "",
                    isOpen && !swipeOffset && !isSwipeAnimating ? "translate-x-0" : "",
                    !isOpen && !swipeOffset ? "-translate-x-full lg:translate-x-0" : "",
                    "pt-safe pl-safe"
                )}
                style={swipeOffset ? { transform: `translateX(${swipeOffset}px)` } : undefined}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/40">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white leading-none">Link Analysis</h2>
                            <p className="text-[0.6rem] text-muted-foreground">LOS & Fiber Path</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-2 rounded-md hover:bg-slate-700/30 text-muted-foreground touch-target touch-manipulation">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <SearchBar onPlaceSelected={handlePlaceSelected} />

                <div className="flex-1 overflow-y-auto overflow-x-hidden pb-safe" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>

                    {/* ── SITES ── */}
                    <Section title="Sites" icon={<MapPin className="h-3.5 w-3.5" />} defaultOpen={true}>
                        <div className="space-y-2">
                            <SiteBlock id="pointA" label={pointAName || "Site A"} colorKey="emerald"
                                control={control} register={register} clientFormErrors={clientFormErrors}
                                serverFormErrors={serverFormErrors} placementMode={placementMode}
                                onPlace={handlePlaceA} isPending={isPending} />
                            <SiteBlock id="pointB" label={pointBName || "Site B"} colorKey="blue"
                                control={control} register={register} clientFormErrors={clientFormErrors}
                                serverFormErrors={serverFormErrors} placementMode={placementMode}
                                onPlace={handlePlaceB} isPending={isPending} />
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Button onClick={onAnalyze} disabled={anyPending} size="sm"
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-10 touch-manipulation">
                                {isActionPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Zap className="mr-1.5 h-3.5 w-3.5" />}
                                {isActionPending ? "Analyzing..." : "Analyze Link"}
                            </Button>
                            <Button onClick={onClearMap} disabled={anyPending} size="sm" variant="outline"
                                className="h-10 px-3 text-xs border-slate-700/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 touch-manipulation">
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </Section>

                    {/* ── RESULTS ── */}
                    {(analysisResult || isActionPending) && (
                        <Section title="Results" icon={<Zap className="h-3.5 w-3.5" />} defaultOpen={true}
                            badge={analysisResult && !isStale ? (
                                <span className={cn("px-1.5 py-0.5 rounded text-[0.6rem] font-bold",
                                    isClear ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                                    {isClear ? "LOS \u2713" : "LOS \u2717"}
                                </span>
                            ) : isStale ? (
                                <span className="px-1.5 py-0.5 rounded text-[0.6rem] font-bold bg-yellow-500/80 text-yellow-900">STALE</span>
                            ) : undefined}>

                            {isActionPending && !analysisResult && (
                                <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...
                                </div>
                            )}

                            {analysisResult && !isStale && (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-slate-800/50 rounded-md px-3 py-2">
                                            <span className="text-[0.55rem] uppercase tracking-wider text-muted-foreground block">Distance</span>
                                            <span className="font-bold text-sm text-foreground">
                                                <AnimatedNumber value={analysisResult.distanceKm < 1 ? analysisResult.distanceKm * 1000 : analysisResult.distanceKm}
                                                    decimals={analysisResult.distanceKm < 1 ? 0 : 2} suffix={analysisResult.distanceKm < 1 ? " m" : " km"} />
                                            </span>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-md px-3 py-2">
                                            <span className="text-[0.55rem] uppercase tracking-wider text-muted-foreground block">Min Clearance</span>
                                            <span className={cn("font-bold text-sm", isClear ? "text-emerald-400" : "text-red-400")}>
                                                {actualMinClearance !== null ? <AnimatedNumber value={actualMinClearance} decimals={1} suffix=" m" /> : "N/A"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-md px-3 py-2 space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Route</span>
                                            <span className="text-foreground font-medium">{pointAName || 'A'} &rarr; {pointBName || 'B'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Tower A</span>
                                            <span className="text-foreground font-medium">{analysisResult.pointA?.towerHeight}m</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Tower B</span>
                                            <span className="text-foreground font-medium">{analysisResult.pointB?.towerHeight}m</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Threshold</span>
                                            <span className="text-foreground font-medium">{clearanceThreshold}m</span>
                                        </div>
                                    </div>

                                    {!isClear && actualMinClearance !== null && (
                                        <div className="flex items-center gap-1.5 text-[0.7rem] text-red-400 bg-red-500/10 rounded-md px-3 py-1.5">
                                            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                                            Add <span className="font-bold">{deficit}m</span> to tower(s) for clearance.
                                        </div>
                                    )}

                                    {isFiberCalculating && (
                                        <div className="flex items-center gap-1.5 text-xs text-primary py-1">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Calculating fiber path...
                                        </div>
                                    )}
                                    {fiberPathResult && !isFiberCalculating && (
                                        <div className="bg-slate-800/50 rounded-md px-3 py-2 space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <Cable className="h-3.5 w-3.5 text-blue-400" />
                                                <span className="text-xs font-semibold text-slate-200">Fiber Path</span>
                                                <span className={cn("text-[0.6rem] ml-auto font-medium",
                                                    fiberPathResult.status === 'success' ? 'text-emerald-400' : 'text-amber-500')}>
                                                    {fiberPathResult.status === 'success' ? 'Calculated' :
                                                        fiberPathResult.status === 'no_road_for_a' ? 'No Road (A)' :
                                                            fiberPathResult.status === 'no_road_for_b' ? 'No Road (B)' :
                                                                fiberPathResult.status === 'radius_too_small' ? 'Radius Small' : 'Error'}
                                                </span>
                                            </div>
                                            {fiberPathResult.status === 'success' && fiberPathResult.totalDistanceMeters !== undefined && (
                                                <>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Total Fiber</span>
                                                        <span className="text-blue-400 font-bold">
                                                            <AnimatedNumber value={fiberPathResult.totalDistanceMeters} decimals={0} suffix=" m" />
                                                        </span>
                                                    </div>
                                                    <div className="text-[0.6rem] text-muted-foreground/70">
                                                        Offset A: {fiberPathResult.offsetDistanceA_meters?.toFixed(0)}m
                                                        &middot; Road: {fiberPathResult.roadRouteDistanceMeters?.toFixed(0)}m
                                                        &middot; Offset B: {fiberPathResult.offsetDistanceB_meters?.toFixed(0)}m
                                                    </div>
                                                </>
                                            )}
                                            {fiberPathResult.errorMessage && fiberPathResult.status !== 'success' && (
                                                <p className="text-[0.6rem] text-amber-500">{fiberPathResult.errorMessage}</p>
                                            )}
                                        </div>
                                    )}
                                    {fiberPathError && !isFiberCalculating && (
                                        <p className="text-[0.6rem] text-destructive px-1">{fiberPathError}</p>
                                    )}

                                    <div className="flex gap-2">
                                        <Button onClick={onSaveLink} disabled={anyPending} size="sm" variant="outline"
                                            className="flex-1 h-10 text-xs border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-emerald-400 touch-manipulation">
                                            <Save className="mr-1.5 h-3.5 w-3.5" /> Save Link
                                        </Button>
                                        <Button onClick={onDownloadPdf} disabled={anyPending} size="sm" variant="outline"
                                            className="flex-1 h-10 text-xs border-slate-700/50 hover:bg-primary/10 hover:border-primary/30 touch-manipulation">
                                            {isGeneratingPdf ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                                            PDF
                                        </Button>
                                    </div>

                                    {/* New Link button — start fresh for next survey */}
                                    <Button onClick={onNewLink} disabled={anyPending} size="sm" variant="outline"
                                        className="w-full h-9 text-xs border-slate-700/50 hover:bg-primary/5 hover:border-primary/30 text-muted-foreground hover:text-foreground touch-manipulation">
                                        <Plus className="mr-1.5 h-3.5 w-3.5" /> New Link
                                    </Button>
                                </div>
                            )}
                        </Section>
                    )}

                    {/* ── SETTINGS ── */}
                    <Section title="Settings" icon={<Settings2 className="h-3.5 w-3.5" />} defaultOpen={false}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                                        <Label className="text-xs font-medium">Required Clearance</Label>
                                    </div>
                                    <span className="text-xs font-bold text-primary tabular-nums">{Math.round(clearanceThreshold)}m</span>
                                </div>
                                <Slider value={[clearanceThreshold]} onValueChange={onClearanceThresholdChange}
                                    max={100} step={1} disabled={isPending} className="py-1" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Cable className="h-3.5 w-3.5 text-muted-foreground" />
                                        <Label className="text-xs font-medium cursor-pointer">Fiber Path</Label>
                                    </div>
                                    <Switch checked={isFiberPathEnabled} onCheckedChange={onToggleFiberPath} disabled={isPending} />
                                </div>
                                {isFiberPathEnabled && (
                                    <div className="pl-5 space-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <Radio className="h-3 w-3 text-muted-foreground" />
                                            <Label className="text-[0.65rem]">Snap Radius (m)</Label>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input type="number" value={snapRadius.toString()} onChange={(e) => onSnapRadiusChange(e.target.value)}
                                                className="h-8 flex-1 text-sm bg-slate-900/50 border-slate-700/40" disabled={isPending} min={1} max={10000} />
                                            <Button size="sm" onClick={onApplySnapRadius} disabled={isPending} className="h-8 text-xs px-3 touch-manipulation">Apply</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Section>

                    {/* ── SAVED LINKS ── */}
                    <Section title="Saved Links" icon={<BookmarkPlus className="h-3.5 w-3.5" />} defaultOpen={false}
                        badge={savedLinks.length > 0 ? (
                            <span className="text-[0.55rem] px-1.5 py-0.5 rounded-full bg-slate-700/60 text-slate-300 tabular-nums">{savedLinks.length}</span>
                        ) : undefined}>
                        {savedLinks.length === 0 ? (
                            <div className="text-center py-6 text-xs text-muted-foreground">
                                <BookmarkPlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                                <p className="font-medium">No saved links yet</p>
                                <p className="text-[0.6rem] mt-1 text-muted-foreground/60">
                                    Analyze a link, then click <span className="text-emerald-400">Save Link</span> in Results.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5 pb-1">
                                    <button onClick={() => onSetSelectionMode(!isSelectionMode)}
                                        className={cn("text-[0.6rem] px-2.5 py-1.5 rounded-md transition-colors font-medium touch-manipulation",
                                            isSelectionMode ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-slate-700/30")}>
                                        {isSelectionMode ? 'Done' : 'Select'}
                                    </button>
                                    {isSelectionMode && (
                                        <>
                                            <button onClick={selectedLinkIds.length === savedLinks.length ? onDeselectAllLinks : onSelectAllLinks}
                                                className="text-[0.6rem] px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-700/30 font-medium touch-manipulation">
                                                {selectedLinkIds.length === savedLinks.length ? 'None' : 'All'}
                                            </button>
                                            {selectedLinkIds.length > 0 && (
                                                <button onClick={() => { onDeleteMultipleSavedLinks(selectedLinkIds); onSetSelectionMode(false); }}
                                                    className="text-[0.6rem] px-2.5 py-1.5 rounded-md text-red-400 hover:bg-red-500/10 font-medium ml-auto touch-manipulation">
                                                    Delete ({selectedLinkIds.length})
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {!isSelectionMode && (
                                        <button onClick={onClearAllSavedLinks}
                                            className="text-[0.6rem] px-2.5 py-1.5 rounded-md text-red-400/60 hover:text-red-400 hover:bg-red-500/10 font-medium ml-auto touch-manipulation">
                                            Clear All
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-1.5 max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                    {savedLinks.map(link => (
                                        <SavedLinkCard key={link.id} link={link}
                                            isSelected={selectedLinkIds.includes(link.id)} isSelectionMode={isSelectionMode}
                                            onLoad={() => onLoadSavedLink(link)} onDelete={() => onDeleteSavedLink(link.id)}
                                            onToggleSelect={() => onToggleLinkSelection(link.id)} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </Section>

                    {/* ── HISTORY ── */}
                    <Section title="History" icon={<History className="h-3.5 w-3.5" />} defaultOpen={false}
                        badge={sortedHistory.length > 0 ? (
                            <span className="text-[0.55rem] px-1.5 py-0.5 rounded-full bg-slate-700/60 text-slate-300 tabular-nums">{sortedHistory.length}</span>
                        ) : undefined}>
                        {sortedHistory.length === 0 ? (
                            <div className="text-center py-6 text-xs text-muted-foreground">
                                <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                                <p className="font-medium">No analyses yet</p>
                                <p className="text-[0.6rem] mt-1 text-muted-foreground/60">Complete an analysis to see it here.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="space-y-1.5 max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                    {sortedHistory.map(item => (
                                        <HistoryCard key={item.id} item={item}
                                            onLoad={() => {
                                                onLoadHistoryItem(item.id);
                                                if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose();
                                            }} />
                                    ))}
                                </div>
                                <button onClick={onClearHistory}
                                    className="w-full text-[0.6rem] px-2 py-2 rounded-md text-red-400/60 hover:text-red-400 hover:bg-red-500/10 font-medium transition-colors touch-manipulation">
                                    Clear All History
                                </button>
                            </div>
                        )}
                    </Section>

                    {/* ── EXPORT ── */}
                    <Section title="Export" icon={<FileDown className="h-3.5 w-3.5" />} defaultOpen={false}
                        badge={hasExportLinks ? (
                            <span className="text-[0.55rem] px-1.5 py-0.5 rounded-full bg-slate-700/60 text-slate-300 tabular-nums">{exportCount}</span>
                        ) : undefined}>
                        {!hasExportLinks ? (
                            <div className="text-center py-4 text-xs text-muted-foreground">
                                <FileDown className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
                                <p>No links to export.</p>
                                <p className="text-[0.6rem] mt-1 text-muted-foreground/60">Save links first, then export here.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {isSelectionMode && selectedLinkIds.length > 0 && (
                                    <p className="text-[0.55rem] text-primary/80 bg-primary/5 rounded-md px-2 py-1">
                                        Exporting {selectedLinkIds.length} selected link(s)
                                    </p>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => handleExport('kmz', onExportKmz)} disabled={isExporting}
                                        className={cn("flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-center touch-manipulation",
                                            "border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/40 active:bg-slate-800/60",
                                            isExporting && "opacity-50 cursor-not-allowed")}>
                                        {exportingFormat === 'kmz' ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <Globe className="h-5 w-5 text-emerald-400" />}
                                        <span className="text-[0.65rem] font-semibold text-slate-200">KMZ</span>
                                        <span className="text-[0.5rem] text-muted-foreground/60">Google Earth</span>
                                    </button>
                                    <button onClick={() => handleExport('pdf', onExportPdf)} disabled={isExporting}
                                        className={cn("flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-center touch-manipulation",
                                            "border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/40 active:bg-slate-800/60",
                                            isExporting && "opacity-50 cursor-not-allowed")}>
                                        {exportingFormat === 'pdf' ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <FileText className="h-5 w-5 text-red-400" />}
                                        <span className="text-[0.65rem] font-semibold text-slate-200">PDF</span>
                                        <span className="text-[0.5rem] text-muted-foreground/60">Report</span>
                                    </button>
                                    <button onClick={() => handleExport('excel', onExportExcel)} disabled={isExporting}
                                        className={cn("flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-center touch-manipulation",
                                            "border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/40 active:bg-slate-800/60",
                                            isExporting && "opacity-50 cursor-not-allowed")}>
                                        {exportingFormat === 'excel' ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <FileSpreadsheet className="h-5 w-5 text-green-400" />}
                                        <span className="text-[0.65rem] font-semibold text-slate-200">Excel</span>
                                        <span className="text-[0.5rem] text-muted-foreground/60">Spreadsheet</span>
                                    </button>
                                    <button onClick={() => handleExport('csv', onExportCsv)} disabled={isExporting}
                                        className={cn("flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-center touch-manipulation",
                                            "border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/40 active:bg-slate-800/60",
                                            isExporting && "opacity-50 cursor-not-allowed")}>
                                        {exportingFormat === 'csv' ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <FileDown className="h-5 w-5 text-blue-400" />}
                                        <span className="text-[0.65rem] font-semibold text-slate-200">CSV</span>
                                        <span className="text-[0.5rem] text-muted-foreground/60">Plain data</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </Section>

                </div>
            </aside>
        </>
    );
}