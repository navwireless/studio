// src/components/map/drawings-manager.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { FolderTree, Eye, EyeOff, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { ToolResult, MapToolCategory } from '@/types/map-tools';
import { MAP_TOOLS, TOOL_CATEGORIES } from '@/types/map-tools';
import { cn } from '@/lib/utils';

interface ManagedResult {
  key: string;
  result: ToolResult;
  visible: boolean;
}

interface DrawingsManagerProps {
  results: ManagedResult[];
  onToggleVisibility: (key: string) => void;
  onRemove: (key: string) => void;
}

export function DrawingsManager({ results, onToggleVisibility, onRemove }: DrawingsManagerProps) {
  const [open, setOpen] = useState(false);

  const grouped = useMemo(() => {
    const byCategory: Record<MapToolCategory, ManagedResult[]> = {
      measure: [],
      mark: [],
      project: [],
      analyze: [],
      field: [],
    };

    results.forEach((entry) => {
      const tool = MAP_TOOLS.find((t) => t.id === entry.result.toolId);
      if (tool) {
        byCategory[tool.category].push(entry);
      }
    });

    return byCategory;
  }, [results]);

  return (
    <div
      className="absolute z-30"
      style={{ right: 'calc(3.75rem + var(--sai-right))', top: 'calc(0.75rem + var(--sai-top))' }}
    >
      <div className="rounded-xl border border-surface-border bg-surface-card/95 backdrop-blur-xl shadow-xl min-w-[220px]">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="w-full px-3 py-2.5 flex items-center justify-between text-text-brand-secondary hover:text-text-brand-primary transition-colors"
          aria-label="Toggle drawings manager"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold">
            <FolderTree className="h-3.5 w-3.5" />
            Shapes Manager
            <span className="text-[0.6rem] text-text-brand-muted">({results.length})</span>
          </span>
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {open && (
          <div className="border-t border-surface-border px-2 py-2 max-h-[44vh] overflow-y-auto space-y-2">
            {results.length === 0 && (
              <p className="text-[0.65rem] text-text-brand-muted px-1 py-2">No drawings yet. Use ruler, area, radius, or marker tools.</p>
            )}

            {(Object.keys(grouped) as MapToolCategory[])
              .filter((cat) => grouped[cat].length > 0)
              .map((category) => (
                <div key={category} className="space-y-1">
                  <p className="px-1 text-[0.55rem] uppercase tracking-wider text-text-brand-muted">
                    {TOOL_CATEGORIES[category].label}
                  </p>
                  {grouped[category].map((entry) => {
                    const tool = MAP_TOOLS.find((t) => t.id === entry.result.toolId);
                    return (
                      <div
                        key={entry.key}
                        className={cn(
                          'rounded-lg border px-2 py-1.5 flex items-center justify-between gap-2',
                          entry.visible
                            ? 'border-surface-border bg-surface-overlay/60'
                            : 'border-surface-border/50 bg-surface-base/60 opacity-75'
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-[0.65rem] font-medium text-text-brand-secondary truncate">
                            {tool?.shortName ?? entry.result.toolId}
                          </p>
                          <p className="text-[0.55rem] text-text-brand-muted">
                            {new Date(entry.result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onToggleVisibility(entry.key)}
                            className="h-6 w-6 rounded-md border border-surface-border text-text-brand-muted hover:text-text-brand-primary"
                            aria-label={entry.visible ? 'Hide shape' : 'Show shape'}
                          >
                            {entry.visible ? <Eye className="h-3.5 w-3.5 mx-auto" /> : <EyeOff className="h-3.5 w-3.5 mx-auto" />}
                          </button>
                          <button
                            onClick={() => onRemove(entry.key)}
                            className="h-6 w-6 rounded-md border border-red-500/30 text-red-300 hover:text-red-200"
                            aria-label="Delete shape"
                          >
                            <Trash2 className="h-3.5 w-3.5 mx-auto" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
