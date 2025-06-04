
"use client";

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button }
from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, MapPin, CheckCircle, XCircle, Maximize } from 'lucide-react'; // Corrected import casing if necessary, but usage is key
import type { AnalysisResult } from '@/types';
import { formatDistanceStrict } from 'date-fns';

interface HistoryPanelProps {
  historyList: AnalysisResult[];
  onLoadHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function HistoryPanel({ historyList, onLoadHistoryItem, onClearHistory, isOpen, onToggle }: HistoryPanelProps) {
  
  const sortedHistory = [...historyList].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Sheet open={isOpen} onOpenChange={onToggle}>
      {/* SheetTrigger is typically outside if programmatically controlled, or can be a prop */}
      <SheetContent className="w-[350px] sm:w-[400px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center text-lg">
            <History className="mr-2 h-5 w-5" />
            Analysis History
          </SheetTitle>
        </SheetHeader>
        {sortedHistory.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <Maximize className="h-16 w-16 text-muted-foreground mb-4" /> {/* Corrected usage here */}
            <p className="text-muted-foreground text-sm">No analyses recorded yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Complete an analysis to see it here.</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {sortedHistory.map((item) => (
                <Card key={item.id} className="bg-card/80 hover:shadow-md transition-shadow">
                  <CardHeader className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          {item.pointA.name || 'Site A'} - {item.pointB.name || 'Site B'}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceStrict(new Date(item.timestamp), new Date(), { addSuffix: true })}
                        </CardDescription>
                      </div>
                      <Badge variant={item.losPossible ? "default" : "destructive"} 
                             className={cn(
                                item.losPossible ? "bg-los-success text-los-success-foreground" : "bg-los-failure text-los-failure-foreground",
                                "text-xs px-2 py-0.5"
                              )}>
                        {item.losPossible ? 
                          <CheckCircle className="mr-1 h-3 w-3" /> : 
                          <XCircle className="mr-1 h-3 w-3" />}
                        {item.losPossible ? 'LOS Possible' : 'LOS Blocked'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 text-xs space-y-1">
                    <p><span className="font-medium text-muted-foreground">Distance:</span> {item.distanceKm} km</p>
                    <p><span className="font-medium text-muted-foreground">Req. Clearance:</span> {item.clearanceThresholdUsed} m</p>
                    <p><span className="font-medium text-muted-foreground">Min. Actual Clearance:</span> {item.minClearance?.toFixed(1) ?? 'N/A'} m</p>
                  </CardContent>
                  <CardFooter className="p-3 border-t">
                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => {
                      onLoadHistoryItem(item.id);
                      onToggle(); // Close panel after loading
                    }}>
                      Load Analysis
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
        {sortedHistory.length > 0 && (
          <div className="p-4 border-t">
            <Button variant="destructive" className="w-full" onClick={onClearHistory}>
              Clear All History
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Helper function to cn class names - ensure this is available or define it
function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

