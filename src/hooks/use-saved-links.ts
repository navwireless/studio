'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SavedLink, AnalysisResult } from '@/types';
import type { FiberPathResult } from '@/tools/fiberPathCalculator/types';

const STORAGE_KEY = 'findlos_saved_links';
const MAX_SAVED_LINKS = 50;

const LINK_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F0B27A', '#82E0AA', '#F1948A', '#85929E', '#73C6B6',
    '#E59866', '#76D7C4', '#F5B7B1', '#AED6F1', '#D7BDE2',
];

/**
 * Selects the next available color that isn't already in use by existing links.
 * Falls back to cycling through colors if all are used.
 * @param existingLinks - Current saved links to check used colors against
 * @returns A hex color string
 */
function getNextColor(existingLinks: SavedLink[]): string {
    const usedColors = new Set(existingLinks.map(l => l.color));
    const available = LINK_COLORS.find(c => !usedColors.has(c));
    return available || LINK_COLORS[existingLinks.length % LINK_COLORS.length];
}

/**
 * Validates and sanitizes a saved link loaded from localStorage.
 * Ensures backward compatibility by providing defaults for fields
 * added in later phases (e.g., selectedDeviceId).
 *
 * @param raw - The raw parsed object from localStorage
 * @returns A valid SavedLink or null if the data is irrecoverably corrupted
 */
function validateSavedLink(raw: unknown): SavedLink | null {
    if (raw === null || typeof raw !== 'object') return null;

    const obj = raw as Record<string, unknown>;

    // Check required fields exist
    if (
        typeof obj.id !== 'string' ||
        typeof obj.name !== 'string' ||
        typeof obj.createdAt !== 'number' ||
        typeof obj.color !== 'string' ||
        typeof obj.clearanceThreshold !== 'number' ||
        obj.pointA === null || typeof obj.pointA !== 'object' ||
        obj.pointB === null || typeof obj.pointB !== 'object' ||
        obj.analysisResult === null || typeof obj.analysisResult !== 'object'
    ) {
        return null;
    }

    // Validate point structures have required numeric fields
    const pointA = obj.pointA as Record<string, unknown>;
    const pointB = obj.pointB as Record<string, unknown>;
    if (
        typeof pointA.lat !== 'number' ||
        typeof pointA.lng !== 'number' ||
        typeof pointA.towerHeight !== 'number' ||
        typeof pointB.lat !== 'number' ||
        typeof pointB.lng !== 'number' ||
        typeof pointB.towerHeight !== 'number'
    ) {
        return null;
    }

    // Ensure analysisResult has the minimal required shape
    const ar = obj.analysisResult as Record<string, unknown>;
    if (
        typeof ar.losPossible !== 'boolean' ||
        typeof ar.distanceKm !== 'number'
    ) {
        return null;
    }

    // Return as SavedLink — optional fields like selectedDeviceId, fiberPathResult
    // will be undefined if absent, which is correct for backward compatibility
    return raw as SavedLink;
}

/**
 * Safely loads saved links from localStorage with validation.
 * Corrupted entries are silently dropped.
 * @returns Array of valid SavedLink objects
 */
function loadSavedLinksFromStorage(): SavedLink[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const parsed: unknown = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            console.warn('Saved links data is not an array, resetting.');
            return [];
        }

        const validLinks: SavedLink[] = [];
        for (const item of parsed) {
            const validated = validateSavedLink(item);
            if (validated) {
                validLinks.push(validated);
            } else {
                console.warn('Dropped corrupted saved link entry:', item);
            }
        }

        return validLinks;
    } catch (e) {
        console.warn('Failed to load saved links from localStorage:', e);
        return [];
    }
}

/**
 * Formats a timestamp into a human-readable relative time string.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns A relative time string like "5m ago", "2h ago", "3d ago"
 *
 * @example
 * timeAgo(Date.now() - 60000); // "1m ago"
 */
export function timeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
}

/** Parameters for saving a new link */
export interface SaveLinkParams {
    name?: string;
    analysisResult: AnalysisResult;
    fiberPathResult?: FiberPathResult | null;
    clearanceThreshold: number;
    /** Optional device ID selected when saving this link (Phase 6) */
    selectedDeviceId?: string;
}

export interface UseSavedLinksReturn {
    /** All saved links, newest first */
    savedLinks: SavedLink[];
    /** Saves a new link from analysis results. Returns the created SavedLink. */
    saveLink: (params: SaveLinkParams) => SavedLink;
    /** Deletes a single link by ID */
    deleteLink: (id: string) => void;
    /** Deletes multiple links by ID */
    deleteMultipleLinks: (ids: string[]) => void;
    /** Clears all saved links */
    clearAllLinks: () => void;
    /** Currently selected link IDs (for bulk operations) */
    selectedLinkIds: string[];
    /** Toggles selection state of a link */
    toggleLinkSelection: (id: string) => void;
    /** Selects all links */
    selectAllLinks: () => void;
    /** Deselects all links */
    deselectAllLinks: () => void;
    /** Whether bulk selection mode is active */
    isSelectionMode: boolean;
    /** Sets selection mode */
    setIsSelectionMode: (mode: boolean) => void;
    /** Returns the SavedLink objects for all selected IDs */
    getSelectedLinks: () => SavedLink[];
}

/**
 * Manages saved links with localStorage persistence, including CRUD operations,
 * bulk selection, and automatic color assignment.
 *
 * Handles backward compatibility — old saved links without device fields
 * or newer Phase 6 fields will still load correctly.
 *
 * @returns Saved links state and operations
 *
 * @example
 * const { savedLinks, saveLink, deleteLink } = useSavedLinks();
 */
export function useSavedLinks(): UseSavedLinksReturn {
    const [savedLinks, setSavedLinks] = useState<SavedLink[]>([]);
    const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const links = loadSavedLinksFromStorage();
        setSavedLinks(links);
    }, []);

    const persist = useCallback((links: SavedLink[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
        } catch (e) {
            console.warn('Failed to persist saved links:', e);
        }
    }, []);

    const saveLink = useCallback((params: SaveLinkParams): SavedLink => {
        const { analysisResult, fiberPathResult, clearanceThreshold, selectedDeviceId } = params;
        const defaultName = `${analysisResult.pointA?.name || 'A'} → ${analysisResult.pointB?.name || 'B'}`;
        const name = params.name || defaultName;

        // Build the link object with color pre-determined inside the updater
        // to avoid stale closure issues
        let createdLink: SavedLink | null = null;

        setSavedLinks(prev => {
            const color = getNextColor(prev);
            const newLink: SavedLink = {
                id: `link_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                name,
                pointA: {
                    name: analysisResult.pointA?.name || 'Site A',
                    lat: analysisResult.pointA.lat,
                    lng: analysisResult.pointA.lng,
                    towerHeight: analysisResult.pointA.towerHeight,
                },
                pointB: {
                    name: analysisResult.pointB?.name || 'Site B',
                    lat: analysisResult.pointB.lat,
                    lng: analysisResult.pointB.lng,
                    towerHeight: analysisResult.pointB.towerHeight,
                },
                clearanceThreshold,
                analysisResult,
                fiberPathResult: fiberPathResult ?? null,
                selectedDeviceId,
                createdAt: Date.now(),
                color,
            };

            createdLink = newLink;
            const updated = [newLink, ...prev].slice(0, MAX_SAVED_LINKS);
            persist(updated);
            return updated;
        });

        // createdLink is guaranteed to be set after setSavedLinks synchronous updater runs
        return createdLink!;
    }, [persist]);

    const deleteLink = useCallback((id: string) => {
        setSavedLinks(prev => {
            const updated = prev.filter(l => l.id !== id);
            persist(updated);
            return updated;
        });
        setSelectedLinkIds(prev => prev.filter(sid => sid !== id));
    }, [persist]);

    const deleteMultipleLinks = useCallback((ids: string[]) => {
        const idSet = new Set(ids);
        setSavedLinks(prev => {
            const updated = prev.filter(l => !idSet.has(l.id));
            persist(updated);
            return updated;
        });
        setSelectedLinkIds(prev => prev.filter(sid => !idSet.has(sid)));
    }, [persist]);

    const clearAllLinks = useCallback(() => {
        setSavedLinks([]);
        setSelectedLinkIds([]);
        persist([]);
    }, [persist]);

    const toggleLinkSelection = useCallback((id: string) => {
        setSelectedLinkIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    }, []);

    const selectAllLinks = useCallback(() => {
        setSelectedLinkIds(savedLinks.map(l => l.id));
    }, [savedLinks]);

    const deselectAllLinks = useCallback(() => {
        setSelectedLinkIds([]);
    }, []);

    const getSelectedLinks = useCallback(() => {
        const idSet = new Set(selectedLinkIds);
        return savedLinks.filter(l => idSet.has(l.id));
    }, [savedLinks, selectedLinkIds]);

    return {
        savedLinks,
        saveLink,
        deleteLink,
        deleteMultipleLinks,
        clearAllLinks,
        selectedLinkIds,
        toggleLinkSelection,
        selectAllLinks,
        deselectAllLinks,
        isSelectionMode,
        setIsSelectionMode,
        getSelectedLinks,
    };
}