
// src/context/links-context.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { LOSLink, LOSLinkPoint, AnalysisResult, PointCoordinates } from '@/types';
import { defaultFormStateValues } from '@/lib/form-schema'; // For default tower heights

interface LinksContextType {
  links: LOSLink[];
  selectedLinkId: string | null;
  addLink: (startPoint?: PointCoordinates, endPoint?: PointCoordinates) => string;
  removeLink: (linkId: string) => void;
  selectLink: (linkId: string | null) => void;
  updateLinkDetails: (linkId: string, details: Partial<Omit<LOSLink, 'id' | 'analysisResult' | 'analysisTimestamp' | 'color'>>) => void;
  updateLinkAnalysis: (linkId: string, result: AnalysisResult) => void;
  getLinkById: (linkId: string) => LOSLink | undefined;
  getCachedAnalysis: (linkId: string) => AnalysisResult | null;
}

const LinksContext = createContext<LinksContextType | undefined>(undefined);

const LINK_COLORS = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFA1'];
const CACHE_EXPIRY_MS = 1 * 60 * 60 * 1000; // 1 hour

// Helper to generate unique IDs
const generateId = () => `link_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`;

// Helper for localStorage
const getLocalStorageKey = (linkId: string) => `linkAnalysisCache_${linkId}`;

export const LinksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [links, setLinks] = useState<LOSLink[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [nextColorIndex, setNextColorIndex] = useState(0);

  const getLinkById = useCallback((linkId: string): LOSLink | undefined => {
    return links.find(link => link.id === linkId);
  }, [links]);

  const addLink = useCallback((startPoint?: PointCoordinates, endPoint?: PointCoordinates): string => {
    const newLinkId = generateId();
    const newLink: LOSLink = {
      id: newLinkId,
      pointA: {
        name: `Site A (${links.length + 1})`,
        lat: startPoint?.lat ?? 0, // Or some default/map center based lat
        lng: startPoint?.lng ?? 0, // Or some default/map center based lng
        towerHeight: defaultFormStateValues.pointA.height,
      },
      pointB: {
        name: `Site B (${links.length + 1})`,
        lat: endPoint?.lat ?? (startPoint?.lat ?? 0) + 0.01, // Offset for visibility
        lng: endPoint?.lng ?? (startPoint?.lng ?? 0) + 0.01,
        towerHeight: defaultFormStateValues.pointB.height,
      },
      clearanceThreshold: parseFloat(defaultFormStateValues.clearanceThreshold),
      color: LINK_COLORS[nextColorIndex % LINK_COLORS.length],
      isDirty: true, // New link needs analysis
    };
    setLinks(prevLinks => [...prevLinks, newLink]);
    setNextColorIndex(prev => prev + 1);
    setSelectedLinkId(newLinkId); // Auto-select new link
    return newLinkId;
  }, [links.length, nextColorIndex]);

  const removeLink = useCallback((linkId: string) => {
    setLinks(prevLinks => prevLinks.filter(link => link.id !== linkId));
    if (selectedLinkId === linkId) {
      setSelectedLinkId(null);
    }
    // Remove from localStorage cache
    try {
      localStorage.removeItem(getLocalStorageKey(linkId));
    } catch (error) {
      console.error("Failed to remove link from localStorage:", error);
    }
  }, [selectedLinkId]);

  const selectLink = useCallback((linkId: string | null) => {
    setSelectedLinkId(linkId);
  }, []);

  const updateLinkDetails = useCallback((linkId: string, details: Partial<Omit<LOSLink, 'id' | 'analysisResult' | 'analysisTimestamp' | 'color'>>) => {
    setLinks(prevLinks =>
      prevLinks.map(link =>
        link.id === linkId ? { ...link, ...details, isDirty: true } : link
      )
    );
  }, []);

  const updateLinkAnalysis = useCallback((linkId: string, result: AnalysisResult) => {
    const analysisTimestamp = Date.now();
    setLinks(prevLinks =>
      prevLinks.map(link =>
        link.id === linkId ? { ...link, analysisResult: result, analysisTimestamp, isDirty: false } : link
      )
    );
    // Cache in localStorage
    try {
      localStorage.setItem(getLocalStorageKey(linkId), JSON.stringify({ ...result, analysisTimestamp }));
    } catch (error) {
      console.error("Failed to save link analysis to localStorage:", error);
    }
  }, []);

  const getCachedAnalysis = useCallback((linkId: string): AnalysisResult | null => {
    try {
      const cachedItem = localStorage.getItem(getLocalStorageKey(linkId));
      if (!cachedItem) return null;

      const parsedItem = JSON.parse(cachedItem);
      if (parsedItem && parsedItem.analysisTimestamp) {
        if (Date.now() - parsedItem.analysisTimestamp < CACHE_EXPIRY_MS) {
          // Update context if this cached item is newer than what's in memory (e.g., after page reload)
          // This part needs careful handling to avoid infinite loops if context also writes to localStorage
          // For now, just return it. The main analysis flow will decide to use it.
          return parsedItem as AnalysisResult & { analysisTimestamp: number };
        } else {
          localStorage.removeItem(getLocalStorageKey(linkId)); // Expired
        }
      }
    } catch (error) {
      console.error("Failed to retrieve or parse cached analysis:", error);
    }
    return null;
  }, []);
  
  // Effect to load links from localStorage on initial mount (optional persistence)
  // For simplicity, this example does not implement full persistence of the links array itself,
  // only the analysis results for individual links. Persisting the whole links array
  // would require more complex serialization/deserialization logic.

  return (
    <LinksContext.Provider value={{ links, selectedLinkId, addLink, removeLink, selectLink, updateLinkDetails, updateLinkAnalysis, getLinkById, getCachedAnalysis }}>
      {children}
    </LinksContext.Provider>
  );
};

export const useLinks = (): LinksContextType => {
  const context = useContext(LinksContext);
  if (context === undefined) {
    throw new Error('useLinks must be used within a LinksProvider');
  }
  return context;
};
