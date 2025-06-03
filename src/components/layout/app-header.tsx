
"use client";

import React from 'react';
// import Image from 'next/image'; // Logo removed
import { Button } from '@/components/ui/button';
import { History, Trash2 } from 'lucide-react';

interface AppHeaderProps {
  onToggleHistory?: () => void;
  onClearMap?: () => void;
  isHistoryPanelSupported?: boolean; // To conditionally show history button
}

export default function AppHeader({ onToggleHistory, onClearMap, isHistoryPanelSupported = false }: AppHeaderProps) {
  return (
    <header className="bg-transparent px-2 py-1 h-12 flex items-center justify-between hover:bg-slate-900/10 transition-all duration-200 z-50 relative print:hidden">
      <div className="flex items-center gap-2">
        {/* Logo Removed as per request */}
        {/* <Image
            src="https://storage.googleapis.com/project-fabrica-chat-agent-test-assets/images/ZepPjV2n7N_nav_wireless_logo.png"
            alt="Nav Wireless Technologies Pvt. Ltd. Logo"
            width={100}
            height={24}
            className="object-contain"
        /> */}
        <h1 className="text-base font-medium tracking-wider text-slate-100/90">
          LiFi Link Pro
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {onClearMap && (
          <Button variant="ghost" size="icon" onClick={onClearMap} aria-label="Clear Map and Form">
            <Trash2 className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
        )}
        {isHistoryPanelSupported && onToggleHistory && (
          <Button variant="ghost" size="icon" onClick={onToggleHistory} aria-label="Toggle History Panel">
            <History className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
        )}
      </div>
    </header>
  );
}
