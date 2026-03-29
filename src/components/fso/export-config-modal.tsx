'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Download, FileText, Zap, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExportConfig } from '@/tools/report-generator/types';
import { DEFAULT_EXPORT_CONFIG, PERSISTED_EXPORT_CONFIG_KEYS } from '@/tools/report-generator/types';

// ═══════════════════════════════════════════════════════
// localStorage persistence
// ═══════════════════════════════════════════════════════
const STORAGE_KEY = 'findlos_export_config';

function loadPersistedConfig(): Partial<ExportConfig> {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const result: Partial<ExportConfig> = {};
        for (const key of PERSISTED_EXPORT_CONFIG_KEYS) {
            if (key in parsed) {
                (result as Record<string, unknown>)[key] = parsed[key];
            }
        }
        return result;
    } catch {
        return {};
    }
}

function savePersistedConfig(config: ExportConfig): void {
    if (typeof window === 'undefined') return;
    try {
        const toSave: Record<string, unknown> = {};
        for (const key of PERSISTED_EXPORT_CONFIG_KEYS) {
            toSave[key] = config[key];
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
        // Silently fail
    }
}

// ═══════════════════════════════════════════════════════
// Props
// ═══════════════════════════════════════════════════════
export interface ExportConfigModalProps {
    /** Whether the modal is open */
    open: boolean;
    /** Callback when modal open state changes */
    onOpenChange: (open: boolean) => void;
    /** Callback when user confirms download with config */
    onConfirm: (config: ExportConfig) => void;
    /** Whether the download is currently in progress */
    isLoading?: boolean;
    /** Default report title override */
    defaultTitle?: string;
    /** User display name for "Prepared by" field */
    userName?: string;
    /** Whether this is a combined/bulk report */
    isCombinedReport?: boolean;
    /** Whether device data is available */
    hasDeviceData?: boolean;
    /** Format label (e.g., "PDF Report", "Excel") */
    formatLabel?: string;
}

// ═══════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════
export function ExportConfigModal({
    open,
    onOpenChange,
    onConfirm,
    isLoading = false,
    defaultTitle = '',
    userName = '',
    isCombinedReport = false,
    hasDeviceData = false,
    formatLabel = 'PDF Report',
}: ExportConfigModalProps) {
    const [config, setConfig] = useState<ExportConfig>(() => ({
        ...DEFAULT_EXPORT_CONFIG,
        ...loadPersistedConfig(),
        reportTitle: defaultTitle || DEFAULT_EXPORT_CONFIG.reportTitle,
        preparedBy: userName || DEFAULT_EXPORT_CONFIG.preparedBy,
        date: new Date().toISOString(),
    }));

    // Update defaults when props change
    useEffect(() => {
        setConfig(prev => ({
            ...prev,
            reportTitle: prev.reportTitle || defaultTitle,
            preparedBy: prev.preparedBy || userName,
            date: new Date().toISOString(),
        }));
    }, [defaultTitle, userName]);

    const updateField = useCallback(<K extends keyof ExportConfig>(key: K, value: ExportConfig[K]) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleConfirm = useCallback(() => {
        savePersistedConfig(config);
        onConfirm(config);
    }, [config, onConfirm]);

    const applyPreset = useCallback((preset: 'summary' | 'full') => {
        if (preset === 'summary') {
            setConfig(prev => ({
                ...prev,
                includeElevationChart: false,
                includeStaticMap: false,
                includeDetailedAnalysis: false,
                includeNarrative: false,
                includeDeviceSpecs: false,
                includeIndividualLinkDetails: false,
                includeOverviewStats: true,
            }));
        } else {
            setConfig(prev => ({
                ...prev,
                includeElevationChart: true,
                includeStaticMap: true,
                includeDetailedAnalysis: true,
                includeNarrative: true,
                includeDeviceSpecs: hasDeviceData,
                includeIndividualLinkDetails: true,
                includeOverviewStats: true,
            }));
        }
    }, [hasDeviceData]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-primary" />
                        Export Settings
                    </DialogTitle>
                    <DialogDescription>
                        Configure your {formatLabel.toLowerCase()} before downloading.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* ── Quick Presets ── */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyPreset('summary')}
                            className="text-xs"
                        >
                            <Zap className="h-3 w-3 mr-1" />
                            Summary Only
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyPreset('full')}
                            className="text-xs"
                        >
                            <FileText className="h-3 w-3 mr-1" />
                            Full Report
                        </Button>
                    </div>

                    <Separator />

                    {/* ── Report Details ── */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Report Details</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <Label htmlFor="reportTitle" className="text-xs text-muted-foreground">Report Title</Label>
                                <Input
                                    id="reportTitle"
                                    value={config.reportTitle}
                                    onChange={e => updateField('reportTitle', e.target.value)}
                                    placeholder={isCombinedReport ? 'LOS Feasibility Analysis' : 'LOS Feasibility Report'}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <Label htmlFor="clientName" className="text-xs text-muted-foreground">Client Name</Label>
                                <Input
                                    id="clientName"
                                    value={config.clientName}
                                    onChange={e => updateField('clientName', e.target.value)}
                                    placeholder="Optional"
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <Label htmlFor="projectName" className="text-xs text-muted-foreground">Project Name</Label>
                                <Input
                                    id="projectName"
                                    value={config.projectName}
                                    onChange={e => updateField('projectName', e.target.value)}
                                    placeholder="Optional"
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <Label htmlFor="preparedBy" className="text-xs text-muted-foreground">Prepared By</Label>
                                <Input
                                    id="preparedBy"
                                    value={config.preparedBy}
                                    onChange={e => updateField('preparedBy', e.target.value)}
                                    placeholder={userName || 'Your name'}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <Label htmlFor="referenceNumber" className="text-xs text-muted-foreground">Reference / PO #</Label>
                                <Input
                                    id="referenceNumber"
                                    value={config.referenceNumber}
                                    onChange={e => updateField('referenceNumber', e.target.value)}
                                    placeholder="Optional"
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* ── Content Toggles ── */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Include in Report</h4>
                        <div className="space-y-2">
                            <ToggleRow
                                id="includeStaticMap"
                                label="Satellite Map Image"
                                checked={config.includeStaticMap}
                                onChange={v => updateField('includeStaticMap', v)}
                            />
                            <ToggleRow
                                id="includeElevationChart"
                                label="Elevation Profile Chart"
                                checked={config.includeElevationChart}
                                onChange={v => updateField('includeElevationChart', v)}
                            />
                            {hasDeviceData && (
                                <ToggleRow
                                    id="includeDeviceSpecs"
                                    label="Device Specifications & Compatibility"
                                    checked={config.includeDeviceSpecs}
                                    onChange={v => updateField('includeDeviceSpecs', v)}
                                />
                            )}
                            <ToggleRow
                                id="includeNarrative"
                                label="Analysis Narrative Description"
                                checked={config.includeNarrative}
                                onChange={v => updateField('includeNarrative', v)}
                            />
                            <ToggleRow
                                id="includeDetailedAnalysis"
                                label="Detailed Analysis Data"
                                checked={config.includeDetailedAnalysis}
                                onChange={v => updateField('includeDetailedAnalysis', v)}
                            />
                        </div>
                    </div>

                    {/* ── Combined Report Toggles ── */}
                    {isCombinedReport && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-foreground">Combined Report Options</h4>
                                <div className="space-y-2">
                                    <ToggleRow
                                        id="includeOverviewStats"
                                        label="Overview Statistics"
                                        checked={config.includeOverviewStats}
                                        onChange={v => updateField('includeOverviewStats', v)}
                                    />
                                    <ToggleRow
                                        id="includeIndividualLinkDetails"
                                        label="Individual Link Detail Pages"
                                        checked={config.includeIndividualLinkDetails}
                                        onChange={v => updateField('includeIndividualLinkDetails', v)}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* ── Additional Notes ── */}
                    <div className="space-y-2">
                        <Label htmlFor="additionalNotes" className="text-xs text-muted-foreground">
                            Additional Notes (appended to report)
                        </Label>
                        <Textarea
                            id="additionalNotes"
                            value={config.additionalNotes}
                            onChange={e => updateField('additionalNotes', e.target.value)}
                            placeholder="Any notes, disclaimers, or context to include in the report..."
                            rows={3}
                            className="text-sm resize-none"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Download {formatLabel}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ═══════════════════════════════════════════════════════
// Toggle Row — checkbox + label
// ═══════════════════════════════════════════════════════
interface ToggleRowProps {
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

function ToggleRow({ id, label, checked, onChange, disabled }: ToggleRowProps) {
    return (
        <div className="flex items-center gap-3">
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={(v) => onChange(v === true)}
                disabled={disabled}
                className="touch-target"
            />
            <Label
                htmlFor={id}
                className={cn(
                    'text-sm cursor-pointer select-none',
                    disabled ? 'text-muted-foreground' : 'text-foreground',
                )}
            >
                {label}
            </Label>
        </div>
    );
}

export default ExportConfigModal;