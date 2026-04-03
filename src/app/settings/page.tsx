"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Save, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ============================================
// Types
// ============================================

interface AppSettings {
  // Analysis defaults
  defaultTowerHeightA: number;
  defaultTowerHeightB: number;
  defaultClearance: number;
  defaultDeviceId: string | null;

  // Map preferences
  distanceUnits: 'km' | 'mi';
  heightUnits: 'm' | 'ft';
  coordinateFormat: 'decimal' | 'dms';

  // Notifications
  showMapHints: boolean;
  showTooltips: boolean;

  // Export defaults
  defaultClientName: string;
  defaultPreparedBy: string;
  defaultProjectName: string;
  includeMapInPdf: boolean;
  includeChartInPdf: boolean;
  includeNarrativeInPdf: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultTowerHeightA: 20,
  defaultTowerHeightB: 20,
  defaultClearance: 10,
  defaultDeviceId: null,
  distanceUnits: 'km',
  heightUnits: 'm',
  coordinateFormat: 'decimal',
  showMapHints: true,
  showTooltips: true,
  defaultClientName: '',
  defaultPreparedBy: '',
  defaultProjectName: '',
  includeMapInPdf: true,
  includeChartInPdf: true,
  includeNarrativeInPdf: true,
};

const STORAGE_KEY = 'findlos_settings';

function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Silently fail
  }
}

// ============================================
// Sub-components
// ============================================

interface SettingsGroupProps {
  title: string;
  children: React.ReactNode;
}

function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-[0.65rem] font-semibold uppercase tracking-wider text-text-brand-muted">
        {title}
      </h3>
      <div className="bg-surface-card border border-surface-border rounded-xl p-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  suffix?: string;
}

function NumberField({ label, value, onChange, min, max, suffix }: NumberFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-text-brand-secondary">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v) && v >= min && v <= max) onChange(v);
          }}
          min={min}
          max={max}
          className={cn(
            'w-20 h-8 px-2 text-sm text-center rounded-md',
            'bg-surface-elevated border border-surface-border',
            'text-text-brand-primary',
            'focus:outline-none focus:ring-1 focus:ring-brand-500/50',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          )}
        />
        {suffix && (
          <span className="text-sm text-text-brand-muted">{suffix}</span>
        )}
      </div>
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm text-text-brand-secondary flex-shrink-0">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'flex-1 max-w-[240px] h-8 px-3 text-sm rounded-md',
          'bg-surface-elevated border border-surface-border',
          'text-text-brand-primary placeholder:text-text-brand-disabled',
          'focus:outline-none focus:ring-1 focus:ring-brand-500/50',
        )}
      />
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

function ToggleField({ label, checked, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-text-brand-secondary">{label}</label>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
          checked ? 'bg-brand-500' : 'bg-surface-overlay',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-text-brand-secondary">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-8 px-3 pr-8 text-sm rounded-md appearance-none',
          'bg-surface-elevated border border-surface-border',
          'text-text-brand-primary',
          'focus:outline-none focus:ring-1 focus:ring-brand-500/50',
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================
// Main Page
// ============================================

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setIsLoaded(true);
  }, []);

  const update = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSave = useCallback(() => {
    saveSettings(settings);
    toast({ title: 'Settings Saved', description: 'Your preferences have been saved.' });
  }, [settings, toast]);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    toast({ title: 'Settings Reset', description: 'All settings restored to defaults.' });
  }, [toast]);

  const handleClearSavedLinks = useCallback(() => {
    try {
      localStorage.removeItem('findlos_saved_links');
      toast({ title: 'Saved Links Cleared' });
    } catch {
      toast({ title: 'Error', description: 'Failed to clear saved links.', variant: 'destructive' });
    }
  }, [toast]);

  const handleClearHistory = useCallback(() => {
    // History is session-only (useState in page.tsx), so just inform user
    toast({
      title: 'Note',
      description: 'Analysis history is session-only and clears when you reload the page.',
    });
  }, [toast]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Use simple layout since we can't import PageShell without seeing it */}
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-brand-primary">Settings</h1>
          <p className="text-sm text-text-brand-muted mt-1">
            Customize your FindLOS experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Analysis Defaults */}
          <SettingsGroup title="Analysis Defaults">
            <NumberField
              label="Default Tower Height A"
              value={settings.defaultTowerHeightA}
              onChange={(v) => update('defaultTowerHeightA', v)}
              min={0}
              max={100}
              suffix="m"
            />
            <NumberField
              label="Default Tower Height B"
              value={settings.defaultTowerHeightB}
              onChange={(v) => update('defaultTowerHeightB', v)}
              min={0}
              max={100}
              suffix="m"
            />
            <NumberField
              label="Default Clearance"
              value={settings.defaultClearance}
              onChange={(v) => update('defaultClearance', v)}
              min={0}
              max={100}
              suffix="m"
            />
          </SettingsGroup>

          {/* Map Preferences */}
          <SettingsGroup title="Map Preferences">
            <SelectField
              label="Distance Units"
              value={settings.distanceUnits}
              onChange={(v) => update('distanceUnits', v as 'km' | 'mi')}
              options={[
                { value: 'km', label: 'Kilometers' },
                { value: 'mi', label: 'Miles' },
              ]}
            />
            <SelectField
              label="Height Units"
              value={settings.heightUnits}
              onChange={(v) => update('heightUnits', v as 'm' | 'ft')}
              options={[
                { value: 'm', label: 'Meters' },
                { value: 'ft', label: 'Feet' },
              ]}
            />
            <SelectField
              label="Coordinate Format"
              value={settings.coordinateFormat}
              onChange={(v) => update('coordinateFormat', v as 'decimal' | 'dms')}
              options={[
                { value: 'decimal', label: 'Decimal Degrees' },
                { value: 'dms', label: 'DMS' },
              ]}
            />
          </SettingsGroup>

          {/* Notifications */}
          <SettingsGroup title="Notifications">
            <ToggleField
              label="Show map hints"
              checked={settings.showMapHints}
              onChange={(v) => update('showMapHints', v)}
            />
            <ToggleField
              label="Show tooltips"
              checked={settings.showTooltips}
              onChange={(v) => update('showTooltips', v)}
            />
          </SettingsGroup>

          {/* Export Defaults */}
          <SettingsGroup title="Export Defaults">
            <TextField
              label="Client Name"
              value={settings.defaultClientName}
              onChange={(v) => update('defaultClientName', v)}
              placeholder="Your client's name"
            />
            <TextField
              label="Prepared By"
              value={settings.defaultPreparedBy}
              onChange={(v) => update('defaultPreparedBy', v)}
              placeholder="Your name"
            />
            <TextField
              label="Project Name"
              value={settings.defaultProjectName}
              onChange={(v) => update('defaultProjectName', v)}
              placeholder="Project name"
            />
            <ToggleField
              label="Include map in PDF"
              checked={settings.includeMapInPdf}
              onChange={(v) => update('includeMapInPdf', v)}
            />
            <ToggleField
              label="Include chart in PDF"
              checked={settings.includeChartInPdf}
              onChange={(v) => update('includeChartInPdf', v)}
            />
            <ToggleField
              label="Include narrative"
              checked={settings.includeNarrativeInPdf}
              onChange={(v) => update('includeNarrativeInPdf', v)}
            />
          </SettingsGroup>

          {/* Data */}
          <SettingsGroup title="Data">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-brand-secondary">Clear saved links</p>
                <p className="text-[0.65rem] text-text-brand-muted">
                  Remove all saved links from storage
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSavedLinks}
                className="text-xs text-red-400 border-red-500/30 hover:bg-danger-bg"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Clear
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-brand-secondary">
                  Clear analysis history
                </p>
                <p className="text-[0.65rem] text-text-brand-muted">
                  Session-only — clears on page reload
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                className="text-xs text-text-brand-muted border-surface-border-light"
              >
                Info
              </Button>
            </div>
          </SettingsGroup>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2 text-text-brand-muted"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}