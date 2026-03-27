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

function getNextColor(existingLinks: SavedLink[]): string {
    const usedColors = new Set(existingLinks.map(l => l.color));
    const available = LINK_COLORS.find(c => !usedColors.has(c));
    return available || LINK_COLORS[existingLinks.length % LINK_COLORS.length];
}

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

export interface UseSavedLinksReturn {
    savedLinks: SavedLink[];
    saveLink: (params: {
        name?: string;
        analysisResult: AnalysisResult;
        fiberPathResult?: FiberPathResult | null;
        clearanceThreshold: number;
    }) => SavedLink;
    deleteLink: (id: string) => void;
    deleteMultipleLinks: (ids: string[]) => void;
    clearAllLinks: () => void;
    selectedLinkIds: string[];
    toggleLinkSelection: (id: string) => void;
    selectAllLinks: () => void;
    deselectAllLinks: () => void;
    isSelectionMode: boolean;
    setIsSelectionMode: (mode: boolean) => void;
    getSelectedLinks: () => SavedLink[];
}

export function useSavedLinks(): UseSavedLinksReturn {
    const [savedLinks, setSavedLinks] = useState<SavedLink[]>([]);
    const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setSavedLinks(JSON.parse(stored) as SavedLink[]);
            }
        } catch (e) {
            console.warn('Failed to load saved links:', e);
        }
    }, []);

    const persist = useCallback((links: SavedLink[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
        } catch (e) {
            console.warn('Failed to persist saved links:', e);
        }
    }, []);

    const saveLink = useCallback((params: {
        name?: string;
        analysisResult: AnalysisResult;
        fiberPathResult?: FiberPathResult | null;
        clearanceThreshold: number;
    }): SavedLink => {
        const { analysisResult, fiberPathResult, clearanceThreshold } = params;
        const defaultName = `${analysisResult.pointA?.name || 'A'} → ${analysisResult.pointB?.name || 'B'}`;
        const name = params.name || defaultName;

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
            createdAt: Date.now(),
            color: '#000',
        };

        setSavedLinks(prev => {
            newLink.color = getNextColor(prev);
            const updated = [newLink, ...prev].slice(0, MAX_SAVED_LINKS);
            persist(updated);
            return updated;
        });

        return newLink;
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
        savedLinks, saveLink, deleteLink, deleteMultipleLinks, clearAllLinks,
        selectedLinkIds, toggleLinkSelection, selectAllLinks, deselectAllLinks,
        isSelectionMode, setIsSelectionMode, getSelectedLinks,
    };
}