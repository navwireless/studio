// src/components/help/help-panel.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Search, RotateCcw, ChevronRight, ChevronDown, Lightbulb } from 'lucide-react';
import { COLORS, SHADOWS, Z_INDEX, BRAND } from '@/styles/design-tokens';
import { getGuidesForPage, getAllGuides, type HelpGuide } from '@/content/help-content';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onRestartTour?: () => void;
  isAdmin?: boolean;
}

function GuideItem({ guide }: { guide: HelpGuide }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="rounded-lg overflow-hidden transition-colors"
      style={{
        backgroundColor: isExpanded ? COLORS.surface.overlay + '40' : 'transparent',
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 rounded-lg"
      >
        <span className="text-base flex-shrink-0" aria-hidden="true">
          {guide.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="truncate"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: COLORS.text.primary,
            }}
          >
            {guide.title}
          </p>
          <p
            className="truncate"
            style={{ fontSize: '0.75rem', color: COLORS.text.muted }}
          >
            {guide.subtitle}
          </p>
        </div>
        {isExpanded ? (
          <ChevronDown
            className="h-4 w-4 flex-shrink-0"
            style={{ color: COLORS.text.muted }}
          />
        ) : (
          <ChevronRight
            className="h-4 w-4 flex-shrink-0"
            style={{ color: COLORS.text.muted }}
          />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 space-y-3">
          {guide.steps.map((step, i) => (
            <div
              key={i}
              className="pl-3 border-l-2"
              style={{ borderColor: COLORS.primary[500] + '40' }}
            >
              <p
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: COLORS.text.primary,
                  marginBottom: 4,
                }}
              >
                {step.title}
              </p>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: COLORS.text.secondary,
                  lineHeight: 1.6,
                }}
              >
                {step.description}
              </p>
              {step.tip && (
                <div
                  className="flex items-start gap-1.5 mt-2 px-2.5 py-2 rounded-md"
                  style={{
                    backgroundColor: COLORS.primary[500] + '10',
                    border: `1px solid ${COLORS.primary[500]}20`,
                  }}
                >
                  <Lightbulb
                    className="h-3 w-3 mt-0.5 flex-shrink-0"
                    style={{ color: COLORS.primary[400] }}
                  />
                  <p
                    style={{
                      fontSize: '0.6875rem',
                      color: COLORS.primary[300],
                      lineHeight: 1.5,
                    }}
                  >
                    {step.tip}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function HelpPanel({
  isOpen,
  onClose,
  currentPage,
  onRestartTour,
  isAdmin = false,
}: HelpPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

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

  // Reset search when panel closes
  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  const pageGuides = useMemo(() => getGuidesForPage(currentPage), [currentPage]);
  const allGuides = useMemo(() => getAllGuides(), []);

  // Filter out admin guide if not admin
  const filteredAllGuides = useMemo(() => {
    let guides = allGuides;
    if (!isAdmin) {
      guides = guides.filter((g) => g.id !== 'admin-guide');
    }
    return guides;
  }, [allGuides, isAdmin]);

  // Filter by search
  const filterBySearch = useCallback(
    (guides: HelpGuide[]) => {
      if (!searchQuery.trim()) return guides;
      const q = searchQuery.toLowerCase();
      return guides.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.subtitle.toLowerCase().includes(q) ||
          g.steps.some(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q)
          )
      );
    },
    [searchQuery]
  );

  const filteredPageGuides = filterBySearch(pageGuides);
  const filteredAllGuidesSearched = filterBySearch(filteredAllGuides);

  // Separate page guides from "all guides" to avoid duplication
  const pageGuideIds = new Set(pageGuides.map((g) => g.id));
  const otherGuides = filteredAllGuidesSearched.filter(
    (g) => !pageGuideIds.has(g.id)
  );

  return (
    <>
      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 md:hidden"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: Z_INDEX.modal - 1,
          }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Help & Guides"
        aria-modal="true"
        className="fixed top-0 right-0 h-full flex flex-col transition-transform duration-250 ease-out"
        style={{
          width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 380,
          backgroundColor: COLORS.surface.card,
          borderLeft: `1px solid ${COLORS.surface.border}`,
          boxShadow: isOpen ? SHADOWS.xl : 'none',
          zIndex: Z_INDEX.modal,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${COLORS.surface.border}` }}
        >
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: COLORS.text.primary,
            }}
          >
            Help & Guides
          </h2>
          <button
            onClick={onClose}
            aria-label="Close help panel"
            className="flex items-center justify-center h-8 w-8 rounded-md transition-colors hover:bg-white/5"
            style={{ color: COLORS.text.muted }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 custom-scrollbar">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              backgroundColor: COLORS.surface.elevated,
              border: `1px solid ${COLORS.surface.border}`,
            }}
          >
            <Search
              className="h-3.5 w-3.5 flex-shrink-0"
              style={{ color: COLORS.text.muted }}
            />
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
              style={{
                fontSize: '0.8125rem',
                color: COLORS.text.primary,
              }}
            />
          </div>

          {/* This Page section */}
          {filteredPageGuides.length > 0 && (
            <div>
              <p
                className="mb-2 px-1"
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: COLORS.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                This Page
              </p>
              <div className="space-y-1">
                {filteredPageGuides.map((guide) => (
                  <GuideItem key={guide.id} guide={guide} />
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <p
              className="mb-2 px-1"
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: COLORS.text.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Quick Actions
            </p>
            <div className="space-y-1">
              {onRestartTour && currentPage === '/' && (
                <button
                  onClick={() => {
                    onRestartTour();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 rounded-lg"
                >
                  <RotateCcw
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: COLORS.text.muted }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: COLORS.text.primary,
                      }}
                    >
                      Restart Guided Tour
                    </p>
                    <p style={{ fontSize: '0.75rem', color: COLORS.text.muted }}>
                      Walk through the interface again
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* All Guides */}
          {otherGuides.length > 0 && (
            <div>
              <p
                className="mb-2 px-1"
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: COLORS.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                All Guides
              </p>
              <div className="space-y-1">
                {otherGuides.map((guide) => (
                  <GuideItem key={guide.id} guide={guide} />
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          <div>
            <p
              className="mb-2 px-1"
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: COLORS.text.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Resources
            </p>
            <div className="space-y-1">
              <a
                href={`mailto:${BRAND.supportEmail}`}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 rounded-lg"
              >
                <span className="text-base" aria-hidden="true">📧</span>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: COLORS.text.primary,
                  }}
                >
                  Contact Support
                </p>
              </a>
              <a
                href="/pricing"
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 rounded-lg"
              >
                <span className="text-base" aria-hidden="true">💰</span>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: COLORS.text.primary,
                  }}
                >
                  Credits & Pricing
                </p>
              </a>
              <a
                href="/terms"
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 rounded-lg"
              >
                <span className="text-base" aria-hidden="true">📋</span>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: COLORS.text.primary,
                  }}
                >
                  Terms of Service
                </p>
              </a>
            </div>
          </div>

          {/* Footer branding */}
          <div className="pt-4 pb-2 text-center">
            <p style={{ fontSize: '0.6875rem', color: COLORS.text.disabled }}>
              {BRAND.name} v1.0 — {BRAND.company}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}