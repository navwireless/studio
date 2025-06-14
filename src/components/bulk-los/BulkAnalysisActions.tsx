
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Loader2, Route, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface BulkAnalysisActionsProps {
  onAnalyze: () => void;
  isProcessing: boolean;
  processingMessage: string;
  progress: number;
  canAnalyze: boolean;
}

const BulkAnalysisActions: React.FC<BulkAnalysisActionsProps> = ({ 
  onAnalyze, 
  isProcessing, 
  processingMessage, 
  progress,
  canAnalyze
}) => {
  return (
    <Card className="shadow-md">
        <CardContent className="p-4 space-y-3">
            <Button 
                onClick={onAnalyze} 
                className="w-full text-base py-3" 
                disabled={isProcessing || !canAnalyze}
            >
                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Route className="mr-2 h-5 w-5" />}
                {isProcessing ? 'Analyzing...' : 'Start Bulk Analysis'}
            </Button>
            {!canAnalyze && !isProcessing && (
                 <p className="text-xs text-center text-amber-600 dark:text-amber-500 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 mr-1.5"/> Please upload a KMZ file with at least 2 placemarks.
                </p>
            )}

            {isProcessing && (
                <div className="space-y-1 pt-2">
                <Label className="text-sm font-medium text-center block">{processingMessage}</Label>
                <Progress value={progress} className="w-full [&>div]:bg-primary" />
                <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}% complete</p>
                </div>
            )}
             {!isProcessing && processingMessage && progress === 100 && ( // Show completion message
                <p className="text-sm text-green-600 dark:text-green-500 text-center pt-2">{processingMessage}</p>
            )}
        </CardContent>
    </Card>
  );
};

export default BulkAnalysisActions;
