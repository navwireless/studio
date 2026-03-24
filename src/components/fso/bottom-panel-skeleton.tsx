'use client';

import React from 'react';

export function BottomPanelSkeleton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out pb-4 lg:pb-0 h-[45vh] sm:h-[40vh] md:h-72">
      <div className="w-full h-full max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 animate-pulse">
        {/* Left Column - Site A */}
        <div className="flex-1 flex flex-col justify-center space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-6 bg-muted rounded w-1/4"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-10 bg-muted rounded w-full mt-2"></div>
          </div>
        </div>

        {/* Center Column - Status & Distance */}
        <div className="flex-1 flex flex-col items-center justify-center border-y md:border-y-0 md:border-x border-border/50 py-4 md:py-0 px-4 space-y-6">
          <div className="h-8 bg-muted rounded-full w-24"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
          <div className="h-4 bg-muted rounded w-48"></div>
        </div>

        {/* Right Column - Site B */}
        <div className="flex-1 flex flex-col justify-center space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-6 bg-muted rounded w-1/4"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-10 bg-muted rounded w-full mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
