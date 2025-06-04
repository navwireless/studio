
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from '@/components/ui/label';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, FileText, ListChecks, CircleOff } from 'lucide-react';
import type { AnalysisResult } from '@/types'; // Keep AnalysisResult for structure
// import { formatDistanceStrict } from 'date-fns'; // Not directly using timestamp for display here
import { cn } from '@/lib/utils';

// New type for items passed to this dialog
interface ReportableLink {
  id: string; // This is the LOSLink id
  name: string; // Formatted name like "Site A - Site B"
  analysis: AnalysisResult; // The actual analysis data
}

interface ReportSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  linksForReport: ReportableLink[]; // Changed from historyList and currentAnalysisResult
  onGenerateReport: (selectedLOSLinkIds: string[]) => void; // Callback expects LOSLink IDs
}

export default function ReportSelectionDialog({
  isOpen,
  onOpenChange,
  linksForReport,
  onGenerateReport,
}: ReportSelectionDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      // Pre-select all available, analyzed links by default or based on some logic
      // For now, let's pre-select all valid links passed to it
      const initialSelected = new Set<string>();
      linksForReport.forEach(link => initialSelected.add(link.id));
      setSelectedIds(initialSelected);
    } else {
      setSelectedIds(new Set()); // Clear selection when dialog closes
    }
  }, [isOpen, linksForReport]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set<string>();
    linksForReport.forEach(item => allIds.add(item.id));
    setSelectedIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleSubmit = () => {
    onGenerateReport(Array.from(selectedIds)); // Pass LOSLink IDs
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Select Links for Report
          </DialogTitle>
          <DialogDescription>
            Choose one or more analyzed links to include in the DOCX report.
          </DialogDescription>
        </DialogHeader>

        {(linksForReport.length === 0) ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No analyzed links available for reporting.</p>
            <p className="text-xs text-muted-foreground mt-1">Analyze some links first.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2 px-1">
              <Button variant="outline" size="sm" onClick={handleSelectAll} className="text-xs">
                <ListChecks className="mr-2 h-4 w-4" /> Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectAll} className="text-xs">
                <CircleOff className="mr-2 h-4 w-4" /> Deselect All
              </Button>
            </div>
            <ScrollArea className="flex-1 overflow-y-auto border rounded-md p-0">
              <div className="space-y-1 p-3">
                {linksForReport.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-2.5 rounded-md border bg-card hover:bg-muted/50">
                    <Checkbox
                      id={`report-${item.id}`}
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => handleToggleSelect(item.id)}
                    />
                    <Label htmlFor={`report-${item.id}`} className="flex-1 cursor-pointer">
                      <div className="font-semibold text-sm">
                        {item.name}
                        {/* Could add a badge if it's the currently "selected" link in the main UI */}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {/* item.analysis.timestamp ? formatDistanceStrict(new Date(item.analysis.timestamp), new Date(), { addSuffix: true }) + ' / ' : '' */}
                        LOS: {item.analysis.losPossible ?
                          <span className="text-los-success font-medium">Possible</span> :
                          <span className="text-los-failure font-medium">Blocked</span>}
                        {' / '} Dist: {item.analysis.distanceKm.toFixed(1)}km
                      </div>
                    </Label>
                    {item.analysis.losPossible ?
                      <CheckCircle className="h-5 w-5 text-los-success" /> :
                      <XCircle className="h-5 w-5 text-los-failure" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={selectedIds.size === 0}
          >
            Generate Report ({selectedIds.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
