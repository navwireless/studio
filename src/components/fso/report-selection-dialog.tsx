
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
import type { AnalysisResult } from '@/types';
import { formatDistanceStrict } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReportSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  historyList: AnalysisResult[];
  currentAnalysisResult: AnalysisResult | null;
  isCurrentAnalysisStale: boolean;
  onGenerateReport: (selectedIds: string[]) => void;
}

const CURRENT_ANALYSIS_ID_PLACEHOLDER = 'current_analysis_placeholder_id';

export default function ReportSelectionDialog({
  isOpen,
  onOpenChange,
  historyList,
  currentAnalysisResult,
  isCurrentAnalysisStale,
  onGenerateReport,
}: ReportSelectionDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reset selections when dialog opens or history/current analysis changes
  useEffect(() => {
    if (isOpen) {
        const newSelectedIds = new Set<string>();
        // Pre-select current analysis if it's valid and not stale
        if (currentAnalysisResult && !isCurrentAnalysisStale && currentAnalysisResult.id) {
            newSelectedIds.add(currentAnalysisResult.id);
        }
        setSelectedIds(newSelectedIds);
    } else {
        setSelectedIds(new Set()); // Clear selection when dialog closes
    }
  }, [isOpen, currentAnalysisResult, isCurrentAnalysisStale]);


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
    if (currentAnalysisResult && !isCurrentAnalysisStale && currentAnalysisResult.id) {
        allIds.add(currentAnalysisResult.id);
    }
    historyList.forEach(item => allIds.add(item.id));
    setSelectedIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleSubmit = () => {
    onGenerateReport(Array.from(selectedIds));
    onOpenChange(false); // Close dialog after submission
  };

  const itemsToShow = [...historyList];
  let currentItemExistsInHistory = false;
  if (currentAnalysisResult?.id) {
      currentItemExistsInHistory = historyList.some(hItem => hItem.id === currentAnalysisResult.id);
  }

  // Add current analysis to the top if it's valid and not already the exact same as the latest history item
  let displayableCurrentAnalysis: AnalysisResult | null = null;
  if (currentAnalysisResult && !currentItemExistsInHistory) {
      displayableCurrentAnalysis = {
          ...currentAnalysisResult,
          // Use a placeholder ID if the current analysis isn't yet in history (e.g., first analysis before save)
          // Or ensure currentAnalysisResult always has an ID. For now, this helps distinguish.
          id: currentAnalysisResult.id || CURRENT_ANALYSIS_ID_PLACEHOLDER 
      };
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Select Links for Report
          </DialogTitle>
          <DialogDescription>
            Choose one or more completed analyses to include in the DOCX report.
          </DialogDescription>
        </DialogHeader>

        {(itemsToShow.length === 0 && !displayableCurrentAnalysis) ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No analysis history found.</p>
            <p className="text-xs text-muted-foreground mt-1">Perform an analysis to generate reports.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2 px-1">
                <Button variant="outline" size="sm" onClick={handleSelectAll} className="text-xs">
                    <ListChecks className="mr-2 h-4 w-4"/> Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAll} className="text-xs">
                    <CircleOff className="mr-2 h-4 w-4"/> Deselect All
                </Button>
            </div>
            <ScrollArea className="flex-1 overflow-y-auto border rounded-md p-0">
              <div className="space-y-1 p-3">
                {displayableCurrentAnalysis && (
                  <div key={displayableCurrentAnalysis.id} className="flex items-center space-x-3 p-2.5 rounded-md border bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20">
                    <Checkbox
                      id={`report-${displayableCurrentAnalysis.id}`}
                      checked={selectedIds.has(displayableCurrentAnalysis.id)}
                      onCheckedChange={() => handleToggleSelect(displayableCurrentAnalysis.id)}
                      disabled={isCurrentAnalysisStale}
                    />
                    <Label htmlFor={`report-${displayableCurrentAnalysis.id}`} className={cn("flex-1 cursor-pointer", isCurrentAnalysisStale && "cursor-not-allowed opacity-60")}>
                      <div className="font-semibold text-sm">
                        {displayableCurrentAnalysis.pointA.name || 'Site A'} - {displayableCurrentAnalysis.pointB.name || 'Site B'}
                        <Badge variant="outline" className="ml-2 text-xs bg-amber-400/80 text-amber-900 border-amber-500">Current View</Badge>
                        {isCurrentAnalysisStale && <Badge variant="destructive" className="ml-2 text-xs">Stale</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        LOS: {displayableCurrentAnalysis.losPossible ? 
                                <span className="text-los-success font-medium">Possible</span> : 
                                <span className="text-los-failure font-medium">Blocked</span>}
                        {' / '} Dist: {displayableCurrentAnalysis.distanceKm.toFixed(1)}km
                        {isCurrentAnalysisStale && " (Needs Re-analysis)"}
                      </div>
                    </Label>
                  </div>
                )}

                {itemsToShow.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-2.5 rounded-md border bg-card hover:bg-muted/50">
                    <Checkbox
                      id={`report-${item.id}`}
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => handleToggleSelect(item.id)}
                    />
                    <Label htmlFor={`report-${item.id}`} className="flex-1 cursor-pointer">
                      <div className="font-semibold text-sm">
                        {item.pointA.name || 'Site A'} - {item.pointB.name || 'Site B'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceStrict(new Date(item.timestamp), new Date(), { addSuffix: true })}
                        {' / '} LOS: {item.losPossible ? 
                                        <span className="text-los-success font-medium">Possible</span> : 
                                        <span className="text-los-failure font-medium">Blocked</span>}
                        {' / '} Dist: {item.distanceKm.toFixed(1)}km
                      </div>
                    </Label>
                    {item.losPossible ? 
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
