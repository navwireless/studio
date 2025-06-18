
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { History, Trash2, ListChecks, Home, Cable } from 'lucide-react'; // Added Cable for Fiber Calculator

interface AppHeaderProps {
  onToggleHistory?: () => void;
  onClearMap?: () => void;
  isHistoryPanelSupported?: boolean;
  currentPage?: 'home' | 'bulk' | 'fiber'; // Added 'fiber'
}

export default function AppHeader({ 
  onToggleHistory, 
  onClearMap, 
  isHistoryPanelSupported = false,
  currentPage 
}: AppHeaderProps) {
  return (
    <header className="bg-transparent px-2 py-1 h-12 flex items-center justify-between hover:bg-slate-900/10 transition-all duration-200 z-50 relative print:hidden">
      <div className="flex items-center gap-2">
        <Link href="/" aria-label="Home">
          <Image
              src="https://storage.googleapis.com/project-fabrica-chat-agent-test-assets/images/ZepPjV2n7N_nav_wireless_logo.png"
              alt="Nav Wireless Technologies Pvt. Ltd. Logo"
              width={100}
              height={24}
              className="object-contain cursor-pointer"
              data-ai-hint="company logo"
          />
        </Link>
        <h1 className="text-base font-medium tracking-wider text-slate-100/90 hidden sm:block">
          LiFi Link Pro
        </h1>
      </div>
      <nav className="flex items-center gap-1 sm:gap-2">
        {currentPage !== 'home' && (
          <Link href="/" passHref legacyBehavior>
            <Button variant="ghost" size="sm" aria-label="Go to Single Link Analysis">
              <Home className="h-5 w-5 sm:mr-1 text-muted-foreground hover:text-foreground" />
              <span className="hidden sm:inline">Single LOS</span>
            </Button>
          </Link>
        )}
        {currentPage !== 'bulk' && (
          <Link href="/bulk-los-analyzer" passHref legacyBehavior>
            <Button variant="ghost" size="sm" aria-label="Go to Bulk LOS Analyzer">
              <ListChecks className="h-5 w-5 sm:mr-1 text-muted-foreground hover:text-foreground" />
               <span className="hidden sm:inline">Bulk LOS</span>
            </Button>
          </Link>
        )}
        {currentPage !== 'fiber' && (
          <Link href="/fiber-calculator" passHref legacyBehavior>
            <Button variant="ghost" size="sm" aria-label="Go to Fiber Path Calculator">
              <Cable className="h-5 w-5 sm:mr-1 text-muted-foreground hover:text-foreground" />
               <span className="hidden sm:inline">Fiber Calc</span>
            </Button>
          </Link>
        )}
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
      </nav>
    </header>
  );
}
