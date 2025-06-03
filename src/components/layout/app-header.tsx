"use client";

import React from 'react';
import Image from 'next/image';

export default function AppHeader() {
  return (
    <header className="bg-transparent px-2 py-1 h-10 flex items-center justify-between hover:bg-slate-900/10 transition-all duration-200 z-50 relative print:hidden">
      <div className="flex items-center gap-2">
        <Image 
            src="https://storage.googleapis.com/project-fabrica-chat-agent-test-assets/images/ZepPjV2n7N_nav_wireless_logo.png" 
            alt="Nav Wireless Technologies Pvt. Ltd. Logo" 
            width={100} 
            height={24} 
            className="object-contain"
            data-ai-hint="company logo"
            priority 
        />
        <h1 className="text-base font-medium tracking-wider text-slate-100/90"> 
          LiFi Link Pro
        </h1>
      </div>
    </header>
  );
}
