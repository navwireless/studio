'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Search, X, Navigation, MapPin, Locate } from 'lucide-react';
import { useGoogleMapsLoader } from '@/components/GoogleMapsLoaderProvider';
import { cn } from '@/lib/utils';

interface MapSearchBarProps {
    onPlaceSelected: (lat: number, lng: number, name: string) => void;
    onPlaceASelected?: (lat: number, lng: number, name: string) => void;
    onPlaceBSelected?: (lat: number, lng: number, name: string) => void;
    onNavigateOnly?: (lat: number, lng: number, name: string) => void;
    placementMode: 'A' | 'B' | null;
    className?: string;
}

// ═══════════════════════════════════════════════════════
// Universal Coordinate Parser
// ═══════════════════════════════════════════════════════

function parseDMSComponent(str: string): number | null {
    const dmsRegex = /(-?\d+\.?\d*)\s*[°d\s]\s*(\d+\.?\d*)\s*['\u2032m\s]\s*(\d+\.?\d*)\s*["\u2033s\s]*\s*([NSEWnsew])?/;
    const dmsMatch = str.match(dmsRegex);
    if (dmsMatch) {
        const d = parseFloat(dmsMatch[1]);
        const m = parseFloat(dmsMatch[2]);
        const s = parseFloat(dmsMatch[3]);
        const dir = dmsMatch[4]?.toUpperCase();
        let decimal = Math.abs(d) + m / 60 + s / 3600;
        if (dir === 'S' || dir === 'W' || d < 0) decimal = -Math.abs(decimal);
        return decimal;
    }

    const dmRegex = /(-?\d+\.?\d*)\s*[°d\s]\s*(\d+\.?\d*)\s*['\u2032m\s]*\s*([NSEWnsew])?/;
    const dmMatch = str.match(dmRegex);
    if (dmMatch) {
        const d = parseFloat(dmMatch[1]);
        const m = parseFloat(dmMatch[2]);
        const dir = dmMatch[3]?.toUpperCase();
        let decimal = Math.abs(d) + m / 60;
        if (dir === 'S' || dir === 'W' || d < 0) decimal = -Math.abs(decimal);
        return decimal;
    }

    return null;
}

function parseCoordinateInput(input: string): { lat: number; lng: number } | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const urlMatch = trimmed.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/);
    if (urlMatch) {
        const lat = parseFloat(urlMatch[1]);
        const lng = parseFloat(urlMatch[2]);
        if (isValidCoord(lat, lng)) return { lat, lng };
    }

    const decimalRegex = /^(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)$/;
    const decimalMatch = trimmed.match(decimalRegex);
    if (decimalMatch) {
        const lat = parseFloat(decimalMatch[1]);
        const lng = parseFloat(decimalMatch[2]);
        if (isValidCoord(lat, lng)) return { lat, lng };
    }

    const prefixRegex = /^([NSns])\s*(-?\d+\.?\d*)\s*[,\s]\s*([EWew])\s*(-?\d+\.?\d*)$/;
    const prefixMatch = trimmed.match(prefixRegex);
    if (prefixMatch) {
        let lat = parseFloat(prefixMatch[2]);
        let lng = parseFloat(prefixMatch[4]);
        if (prefixMatch[1].toUpperCase() === 'S') lat = -Math.abs(lat);
        if (prefixMatch[3].toUpperCase() === 'W') lng = -Math.abs(lng);
        if (isValidCoord(lat, lng)) return { lat, lng };
    }

    const suffixRegex = /^(-?\d+\.?\d*)\s*°?\s*([NSns])\s*[,\s]\s*(-?\d+\.?\d*)\s*°?\s*([EWew])$/;
    const suffixMatch = trimmed.match(suffixRegex);
    if (suffixMatch) {
        let lat = parseFloat(suffixMatch[1]);
        let lng = parseFloat(suffixMatch[3]);
        if (suffixMatch[2].toUpperCase() === 'S') lat = -Math.abs(lat);
        if (suffixMatch[4].toUpperCase() === 'W') lng = -Math.abs(lng);
        if (isValidCoord(lat, lng)) return { lat, lng };
    }

    const commaSplit = trimmed.split(/,/);
    if (commaSplit.length === 2) {
        const latVal = parseDMSComponent(commaSplit[0].trim());
        const lngVal = parseDMSComponent(commaSplit[1].trim());
        if (latVal !== null && lngVal !== null && isValidCoord(latVal, lngVal)) {
            return { lat: latVal, lng: lngVal };
        }
    }

    const dirSplit = trimmed.split(/(?<=[NSns])\s+(?=\d)|(?<=[NSns]),\s*(?=\d)/);
    if (dirSplit.length === 2) {
        const latVal = parseDMSComponent(dirSplit[0].trim());
        const lngVal = parseDMSComponent(dirSplit[1].trim());
        if (latVal !== null && lngVal !== null && isValidCoord(latVal, lngVal)) {
            return { lat: latVal, lng: lngVal };
        }
    }

    const spaceDMS = trimmed.match(
        /(-?\d+)\s+(\d+)\s+(\d+\.?\d*)\s*([NSns])\s+(-?\d+)\s+(\d+)\s+(\d+\.?\d*)\s*([EWew])/
    );
    if (spaceDMS) {
        let lat = parseFloat(spaceDMS[1]) + parseFloat(spaceDMS[2]) / 60 + parseFloat(spaceDMS[3]) / 3600;
        let lng = parseFloat(spaceDMS[5]) + parseFloat(spaceDMS[6]) / 60 + parseFloat(spaceDMS[7]) / 3600;
        if (spaceDMS[4].toUpperCase() === 'S') lat = -lat;
        if (spaceDMS[8].toUpperCase() === 'W') lng = -lng;
        if (isValidCoord(lat, lng)) return { lat, lng };
    }

    return null;
}

function isValidCoord(lat: number, lng: number): boolean {
    return !isNaN(lat) && !isNaN(lng) &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180;
}

export default function MapSearchBar({ onPlaceSelected, onPlaceASelected, onPlaceBSelected, onNavigateOnly, placementMode, className }: MapSearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const onPlaceSelectedRef = useRef(onPlaceSelected);
    const onPlaceASelectedRef = useRef(onPlaceASelected);
    const onPlaceBSelectedRef = useRef(onPlaceBSelected);
    const onNavigateOnlyRef = useRef(onNavigateOnly);
    const placementModeRef = useRef(placementMode);
    const { isLoaded } = useGoogleMapsLoader();
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [coordPreview, setCoordPreview] = useState<{ lat: number; lng: number } | null>(null);

    // Action picker state — shown when placementMode is null
    const [pendingPlace, setPendingPlace] = useState<{ lat: number; lng: number; name: string } | null>(null);
    const actionPickerRef = useRef<HTMLDivElement>(null);

    // Keep callback refs fresh
    useEffect(() => { onPlaceSelectedRef.current = onPlaceSelected; }, [onPlaceSelected]);
    useEffect(() => { onPlaceASelectedRef.current = onPlaceASelected; }, [onPlaceASelected]);
    useEffect(() => { onPlaceBSelectedRef.current = onPlaceBSelected; }, [onPlaceBSelected]);
    useEffect(() => { onNavigateOnlyRef.current = onNavigateOnly; }, [onNavigateOnly]);
    useEffect(() => { placementModeRef.current = placementMode; }, [placementMode]);

    // Close action picker on outside click
    useEffect(() => {
        if (!pendingPlace) return;
        const handleClick = (e: MouseEvent) => {
            if (actionPickerRef.current && !actionPickerRef.current.contains(e.target as Node)) {
                setPendingPlace(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [pendingPlace]);

    // Close action picker on Escape
    useEffect(() => {
        if (!pendingPlace) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setPendingPlace(null);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [pendingPlace]);

    // Decide whether to show action picker or directly place
    const handlePlaceResolved = useCallback((lat: number, lng: number, name: string) => {
        if (placementModeRef.current) {
            // In placement mode — directly place
            onPlaceSelectedRef.current(lat, lng, name);
            setPendingPlace(null);
        } else {
            // No placement mode — show action picker
            setPendingPlace({ lat, lng, name });
        }
        setInputValue('');
        setCoordPreview(null);
        if (inputRef.current) inputRef.current.value = '';
    }, []);

    // Action picker handlers
    const handlePickPlaceA = useCallback(() => {
        if (!pendingPlace) return;
        if (onPlaceASelectedRef.current) {
            onPlaceASelectedRef.current(pendingPlace.lat, pendingPlace.lng, pendingPlace.name);
        } else {
            // Fallback: use the main callback (which will use default behavior)
            onPlaceSelectedRef.current(pendingPlace.lat, pendingPlace.lng, pendingPlace.name);
        }
        setPendingPlace(null);
    }, [pendingPlace]);

    const handlePickPlaceB = useCallback(() => {
        if (!pendingPlace) return;
        if (onPlaceBSelectedRef.current) {
            onPlaceBSelectedRef.current(pendingPlace.lat, pendingPlace.lng, pendingPlace.name);
        } else {
            onPlaceSelectedRef.current(pendingPlace.lat, pendingPlace.lng, pendingPlace.name);
        }
        setPendingPlace(null);
    }, [pendingPlace]);

    const handlePickNavigate = useCallback(() => {
        if (!pendingPlace) return;
        if (onNavigateOnlyRef.current) {
            onNavigateOnlyRef.current(pendingPlace.lat, pendingPlace.lng, pendingPlace.name);
        } else {
            onPlaceSelectedRef.current(pendingPlace.lat, pendingPlace.lng, pendingPlace.name);
        }
        setPendingPlace(null);
    }, [pendingPlace]);

    // Initialize Google Places Autocomplete
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
                    handlePlaceResolved(lat, lng, name);
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
    }, [isLoaded, handlePlaceResolved]);

    // Parse coordinates on input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        const parsed = parseCoordinateInput(val);
        setCoordPreview(parsed);
    }, []);

    // Handle Enter key
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && coordPreview) {
            e.preventDefault();
            const name = `${coordPreview.lat.toFixed(6)}, ${coordPreview.lng.toFixed(6)}`;
            handlePlaceResolved(coordPreview.lat, coordPreview.lng, name);
            inputRef.current?.blur();
        }
        if (e.key === 'Escape') {
            setInputValue('');
            setCoordPreview(null);
            setPendingPlace(null);
            if (inputRef.current) inputRef.current.value = '';
            inputRef.current?.blur();
        }
    }, [coordPreview, handlePlaceResolved]);

    // Navigate to parsed coordinates on button click
    const handleGoToCoords = useCallback(() => {
        if (!coordPreview) return;
        const name = `${coordPreview.lat.toFixed(6)}, ${coordPreview.lng.toFixed(6)}`;
        handlePlaceResolved(coordPreview.lat, coordPreview.lng, name);
    }, [coordPreview, handlePlaceResolved]);

    const handleClear = useCallback(() => {
        setInputValue('');
        setCoordPreview(null);
        setPendingPlace(null);
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }
    }, []);

    const placementLabel = placementMode
        ? `Search or paste coordinates for Site ${placementMode}...`
        : 'Search location or paste coordinates...';

    return (
        <div className={cn("relative", className)}>
            {/* Main search container */}
            <div className={cn(
                "flex items-center gap-2 bg-black/70 backdrop-blur-2xl rounded-2xl border shadow-2xl shadow-black/40 transition-all",
                isFocused ? "border-primary/40 ring-1 ring-primary/20" : "border-white/[0.08]",
                pendingPlace ? "border-amber-500/40 ring-1 ring-amber-500/20" : "",
                "px-3 h-11",
            )}>
                <Search className="h-4 w-4 text-white/40 flex-shrink-0" />

                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placementLabel}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none min-w-0 touch-manipulation"
                />

                {/* Coordinate go button */}
                {coordPreview && !pendingPlace && (
                    <button
                        onClick={handleGoToCoords}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors flex-shrink-0 touch-manipulation"
                    >
                        <Navigation className="h-3 w-3" />
                        <span className="hidden sm:inline">Go</span>
                    </button>
                )}

                {/* Clear button */}
                {(inputValue || pendingPlace) && (
                    <button
                        onClick={handleClear}
                        className="p-1 rounded-md text-white/30 hover:text-white/60 transition-colors flex-shrink-0 touch-manipulation"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* ── Action Picker Dropdown (when no placement mode) ── */}
            {pendingPlace && (
                <div ref={actionPickerRef} className="absolute top-full left-0 right-0 mt-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="bg-slate-900/98 backdrop-blur-2xl rounded-xl border border-slate-700/50 shadow-2xl shadow-black/50 overflow-hidden">
                        {/* Header — show the selected place */}
                        <div className="px-4 py-2.5 border-b border-slate-700/30">
                            <p className="text-[0.65rem] text-white/40 uppercase tracking-wider font-semibold">Selected Location</p>
                            <p className="text-sm text-white font-medium truncate mt-0.5">{pendingPlace.name}</p>
                            <p className="text-[0.6rem] text-white/30 font-mono tabular-nums">
                                {pendingPlace.lat.toFixed(6)}, {pendingPlace.lng.toFixed(6)}
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="p-1.5">
                            <button
                                onClick={handlePickPlaceA}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-500/10 transition-colors text-left group touch-manipulation"
                            >
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/25 transition-colors">
                                    <MapPin className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white">Place as Site A</p>
                                    <p className="text-[0.6rem] text-white/40">Set as link start point</p>
                                </div>
                                <kbd className="text-[0.55rem] text-white/20 bg-white/5 px-1.5 py-0.5 rounded font-mono hidden sm:block">A</kbd>
                            </button>

                            <button
                                onClick={handlePickPlaceB}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-500/10 transition-colors text-left group touch-manipulation"
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/25 transition-colors">
                                    <MapPin className="h-4 w-4 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white">Place as Site B</p>
                                    <p className="text-[0.6rem] text-white/40">Set as link end point</p>
                                </div>
                                <kbd className="text-[0.55rem] text-white/20 bg-white/5 px-1.5 py-0.5 rounded font-mono hidden sm:block">B</kbd>
                            </button>

                            <div className="h-px bg-slate-700/30 mx-2 my-1" />

                            <button
                                onClick={handlePickNavigate}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left group touch-manipulation"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-colors">
                                    <Locate className="h-4 w-4 text-white/70" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white/80">Just Navigate</p>
                                    <p className="text-[0.6rem] text-white/40">Pan map without placing a site</p>
                                </div>
                                <kbd className="text-[0.55rem] text-white/20 bg-white/5 px-1.5 py-0.5 rounded font-mono hidden sm:block">↵</kbd>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Coordinate preview tooltip (only when NOT showing action picker) */}
            {coordPreview && isFocused && !pendingPlace && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50">
                    <button
                        onClick={handleGoToCoords}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900/98 backdrop-blur-2xl rounded-xl border border-slate-700/50 shadow-2xl shadow-black/40 hover:bg-slate-800/80 transition-colors text-left touch-manipulation"
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Navigation className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white">
                                Go to coordinates
                            </p>
                            <p className="text-[0.65rem] text-white/50 font-mono tabular-nums">
                                {coordPreview.lat.toFixed(6)}, {coordPreview.lng.toFixed(6)}
                            </p>
                        </div>
                        <kbd className="text-[0.55rem] text-white/30 bg-white/5 px-1.5 py-0.5 rounded font-mono hidden sm:block">
                            Enter
                        </kbd>
                    </button>
                </div>
            )}

            {/* Placement mode indicator */}
            {placementMode && isFocused && !pendingPlace && (
                <div className="absolute -bottom-6 left-0 right-0">
                    <p className={cn(
                        "text-[0.6rem] font-medium text-center",
                        placementMode === 'A' ? "text-emerald-400/70" : "text-blue-400/70"
                    )}>
                        Will set as Site {placementMode}
                    </p>
                </div>
            )}
        </div>
    );
}