"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { History, ListChecks, Home, Cable } from 'lucide-react';
import appLogo from '@/app/Favicon/apple-touch-icon.png';

interface AppHeaderProps {
  onToggleHistory?: () => void;
  isHistoryPanelSupported?: boolean;
  currentPage?: 'home' | 'bulk' | 'fiber';
}

export default function AppHeader({
  onToggleHistory,
  isHistoryPanelSupported = false,
  currentPage
}: AppHeaderProps) {
  return (
    <header className="bg-slate-900/60 backdrop-blur-md px-3 py-1.5 h-12 flex items-center justify-between z-50 relative print:hidden border-b border-white/[0.04]">
      <Link href="/" className="flex items-center gap-2.5 group">
        <Image
          src={appLogo}
          alt="FindLOS Logo"
          width={28}
          height={28}
          className="object-contain cursor-pointer bg-white rounded-full p-0.5 shadow-sm group-hover:shadow-md transition-shadow"
        />
        <div className="flex flex-col">
          <h1 className="text-sm font-bold tracking-wide text-white/90 leading-tight">
            FindLOS
          </h1>
          <span className="text-[0.5rem] text-white/30 leading-tight hidden sm:block tracking-wider uppercase">
            Line of Sight Analyzer
          </span>
        </div>
      </Link>
      <nav className="flex items-center gap-0.5">
        {currentPage !== 'home' && (
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-white/50 hover:text-white hover:bg-white/5" aria-label="Single Link Analysis">
              <Home className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline text-[0.65rem]">Single</span>
            </Button>
          </Link>
        )}
        {currentPage !== 'bulk' && (
          <Link href="/bulk-los-analyzer">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-white/50 hover:text-white hover:bg-white/5" aria-label="Bulk LOS Analyzer">
              <ListChecks className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline text-[0.65rem]">Bulk</span>
            </Button>
          </Link>
        )}
        {currentPage !== 'fiber' && (
          <Link href="/fiber-calculator">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-white/50 hover:text-white hover:bg-white/5" aria-label="Fiber Path Calculator">
              <Cable className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline text-[0.65rem]">Fiber</span>
            </Button>
          </Link>
        )}
        {isHistoryPanelSupported && onToggleHistory && (
          <Button variant="ghost" size="icon" onClick={onToggleHistory} className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/5" aria-label="Toggle History Panel">
            <History className="h-3.5 w-3.5" />
          </Button>
        )}
      </nav>
    </header>
  );
}
