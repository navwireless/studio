
"use client";

import React from 'react';
import Image from 'next/image';

export default function AppHeader() {
  return (
    <header className="bg-slate-900/60 backdrop-blur-md px-3 py-1.5 h-10 flex items-center justify-between hover:bg-slate-900/75 transition-all duration-200 z-50 relative">
      <div className="flex items-center gap-2"> {/* Reduced gap */}
        <Image 
            src="https://storage.googleapis.com/project-fabrica-chat-agent-test-assets/images/ZepPjV2n7N_nav_wireless_logo.png" 
            alt="Nav Wireless Technologies Pvt. Ltd. Logo" 
            width={110} // Slightly smaller logo
            height={28} 
            className="object-contain"
            data-ai-hint="company logo"
            priority 
        />
        <h1 className="text-base font-medium tracking-wide text-slate-100/90"> 
          LiFi Feasibility Checker
        </h1>
        {/* Subtitle removed as per instructions */}
      </div>
      {/* Removed search bar, feedback button, project dropdown, and user icon */}
    </header>
  );
}
