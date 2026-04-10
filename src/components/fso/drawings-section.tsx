'use client';

import React, { useMemo, useState } from 'react';
import {
  Eye,
  EyeOff,
  Trash2,
  Ruler,
  Pentagon,
  MapPin,
  Circle,
  Crosshair,
  Compass,
  StickyNote,
  Gauge,
  Target,
  Sun,
  Cloud,
  FolderOpen,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import type { ToolResult, MapToolCategory } from '@/types/map-tools';
import { MAP_TOOLS, TOOL_CATEGORIES } from '@/types/map-tools';
import { cn } from '@/lib/utils';

// ── Icon map for inline rendering ──
const TOOL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Ruler,
  Pentagon,
  MapPin,
  Circle,
  Crosshair,
  Compass,
  StickyNote,
  Gauge,
  Target,
  Sun,
  Cloud,
};

// ── Placemark colors ──
const PLACEMARK_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4',
  '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E', '#14B8A6',
];

// ── Types ──
export interface ManagedResult {
  key: string;
  result: ToolResult;
  visible: boolean;
}

interface DrawingsSectionProps {
  results: ManagedResult[];
  onToggleVisibility: (key: string) => void;
  onRemove: (key: string) => void;
  /** Callback to update a drawing's data (e.g., rename placemark) */
  onUpdateDrawing?: (key: string, updates: Record<string, unknown>) => void;
}

// ── Helpers ──
function getResultSummary(result: ToolResult): string {
  const d = result.data;
  switch (result.toolId) {
    case 'multi-measure':
    case 'measure-distance':
      return (d.totalDistance as string) || 'Measurement';
    case 'measure-area':
      return (d.area as string) || 'Area';
    case 'range-rings':
    case 'range-circle':
      return (d.radius as string) || 'Circle';
    case 'placemark':
    case 'drop-pin':
      return `${d.label || 'Pin'} — ${d.dd || ''}`;
    case 'coord-tool':
    case 'coord-converter':
      return (d.dd as string) || 'Coordinates';
    case 'compass-tool':
    case 'bearing-calc':
      return (d.location as string) || 'Bearing';
    case 'field-notes':
      return (d.note as string)?.slice(0, 40) || 'Note';
    case 'level-tool':
      return d.sensorMode ? `Tilt: ${d.tilt}` : 'Level';
    case 'weather-probe':
      return (d.location as string) || 'Weather';
    default:
      return MAP_TOOLS.find((t) => t.id === result.toolId)?.shortName || result.toolId;
  }
}

function isEditableResult(toolId: string): boolean {
  return toolId === 'placemark' || toolId === 'drop-pin' || toolId === 'field-notes';
}

// ── Shape item row ──
function ShapeItem({
  entry,
  onToggleVisibility,
  onRemove,
  onUpdateDrawing,
}: {
  entry: ManagedResult;
  onToggleVisibility: () => void;
  onRemove: () => void;
  onUpdateDrawing?: (updates: Record<string, unknown>) => void;
}) {
  const tool = MAP_TOOLS.find((t) => t.id === entry.result.toolId);
  const IconComp = tool ? TOOL_ICON_MAP[tool.icon] : null;
  const summary = getResultSummary(entry.result);
  const editable = isEditableResult(entry.result.toolId);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState((entry.result.data.label as string) || '');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleStartEdit = () => {
    setEditName((entry.result.data.label as string) || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onUpdateDrawing && editName.trim()) {
      onUpdateDrawing({ label: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleColorChange = (color: string) => {
    if (onUpdateDrawing) {
      onUpdateDrawing({ color });
    }
    setShowColorPicker(false);
  };

  if (isEditing) {
    return (
      <div className="px-2.5 py-2 rounded-lg border border-brand-500/40 bg-brand-500/5 space-y-2">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            className="flex-1 text-[0.65rem] px-2 py-1 rounded bg-surface-input border border-surface-border text-text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Name"
            autoFocus
            maxLength={30}
          />
          <button
            onClick={handleSaveEdit}
            className="h-6 w-6 rounded-md flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="h-6 w-6 rounded-md flex items-center justify-center text-text-brand-muted hover:text-red-400 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* Color picker for placemarks */}
        {(entry.result.toolId === 'placemark' || entry.result.toolId === 'drop-pin') && (
          <div className="flex items-center gap-1">
            <span className="text-[0.5rem] text-text-brand-muted mr-1">Color:</span>
            {PLACEMARK_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={cn(
                  'w-4 h-4 rounded-full border-2 transition-all hover:scale-110',
                  entry.result.data.color === color
                    ? 'border-white scale-110'
                    : 'border-transparent'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-all',
        entry.visible
          ? 'border-surface-border bg-surface-overlay/40'
          : 'border-surface-border/40 opacity-50'
      )}
    >
      {/* Icon with optional color dot */}
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-text-brand-muted relative">
        {IconComp && <IconComp className="h-3.5 w-3.5" />}
        {!!entry.result.data.color && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-surface-card"
            style={{ backgroundColor: entry.result.data.color as string }}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[0.65rem] font-medium text-text-brand-secondary truncate">
          {summary}
        </p>
        <p className="text-[0.5rem] text-text-brand-muted">
          {tool?.shortName || entry.result.toolId} ·{' '}
          {new Date(entry.result.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Actions — always show on mobile via touch targets */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        {editable && onUpdateDrawing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStartEdit();
            }}
            className="h-6 w-6 rounded-md flex items-center justify-center text-text-brand-muted hover:text-brand-400 hover:bg-brand-500/10 transition-colors touch-manipulation"
            aria-label="Edit"
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
        {editable && (entry.result.toolId === 'placemark' || entry.result.toolId === 'drop-pin') && onUpdateDrawing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            className="h-6 w-6 rounded-md flex items-center justify-center transition-colors touch-manipulation"
            aria-label="Change color"
          >
            <div
              className="w-3 h-3 rounded-full border border-surface-border"
              style={{ backgroundColor: (entry.result.data.color as string) || '#3B82F6' }}
            />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className={cn(
            'h-6 w-6 rounded-md flex items-center justify-center transition-colors touch-manipulation',
            'text-text-brand-muted hover:text-text-brand-primary hover:bg-surface-overlay'
          )}
          aria-label={entry.visible ? 'Hide' : 'Show'}
        >
          {entry.visible ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="h-6 w-6 rounded-md flex items-center justify-center text-text-brand-muted hover:text-red-400 hover:bg-red-500/10 transition-colors touch-manipulation"
          aria-label="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Inline color picker popover */}
      {showColorPicker && (
        <div className="absolute right-2 top-full mt-1 z-10 flex items-center gap-1 p-2 rounded-lg bg-surface-card border border-surface-border shadow-xl">
          {PLACEMARK_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={cn(
                'w-5 h-5 rounded-full border-2 transition-all hover:scale-125',
                entry.result.data.color === color
                  ? 'border-white scale-110'
                  : 'border-transparent'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──
export function DrawingsSection({
  results,
  onToggleVisibility,
  onRemove,
  onUpdateDrawing,
}: DrawingsSectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<MapToolCategory>>(
    new Set(['measure', 'mark'])
  );

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

  const toggleCategory = (cat: MapToolCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const nonEmptyCategories = (Object.keys(grouped) as MapToolCategory[]).filter(
    (cat) => grouped[cat].length > 0
  );

  if (results.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-text-brand-muted">
        <FolderOpen className="h-8 w-8 mx-auto mb-2 text-text-brand-disabled" />
        <p className="font-medium">No drawings yet</p>
        <p className="text-[0.6rem] mt-1 text-text-brand-disabled">
          Use the map toolbar to draw lines, polygons, and placemarks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {nonEmptyCategories.map((category) => {
        const isExpanded = expandedCategories.has(category);
        const items = grouped[category];

        return (
          <div key={category}>
            {/* Category header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-1 py-1 text-left"
            >
              <span className="text-[0.55rem] font-semibold uppercase tracking-wider text-text-brand-muted">
                {TOOL_CATEGORIES[category].label}
              </span>
              <span className="text-[0.5rem] px-1.5 py-0.5 rounded-full bg-surface-overlay text-text-brand-secondary tabular-nums">
                {items.length}
              </span>
            </button>

            {/* Items */}
            {isExpanded && (
              <div className="space-y-1 mt-0.5">
                {items.map((entry) => (
                  <ShapeItem
                    key={entry.key}
                    entry={entry}
                    onToggleVisibility={() => onToggleVisibility(entry.key)}
                    onRemove={() => onRemove(entry.key)}
                    onUpdateDrawing={
                      onUpdateDrawing
                        ? (updates) => onUpdateDrawing(entry.key, updates)
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
