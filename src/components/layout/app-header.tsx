
"use client";

import React from 'react';
// Removed Search, MessageSquare, LayoutGrid, UserCircle
// Removed Button, Input, DropdownMenu components
import Image from 'next/image';

export default function AppHeader() {
  return (
    <header className="bg-card text-card-foreground p-3 flex items-center justify-between border-b border-border shadow-md">
      <div className="flex items-center gap-3">
        <Image 
            src="https://storage.googleapis.com/project-fabrica-chat-agent-test-assets/images/ZepPjV2n7N_nav_wireless_logo.png" 
            alt="Nav Wireless Technologies Pvt. Ltd. Logo" 
            width={150} 
            height={40} 
            className="object-contain"
            data-ai-hint="company logo"
            priority 
        />
        <div>
          <h1 className="text-xl font-semibold text-foreground">LiFi Feasibility Checker</h1>
          <p className="text-xs text-muted-foreground">by Nav Wireless Technologies Pvt. Ltd.</p>
        </div>
      </div>
      {/* Removed search bar, feedback button, project dropdown, and user icon */}
    </header>
  );
}
