
"use client";

import React from 'react';
import Image from 'next/image';

export default function AppHeader() {
  return (
    <header className="bg-transparent px-2 py-1 h-10 flex items-center justify-between z-50 relative">
      <div className="flex items-center gap-2">
        <Image 
            src="https://placehold.co/100x24.png" 
            alt="Nav Wireless Technologies Pvt. Ltd. Logo" 
            width={100} 
            height={24} 
            className="object-contain"
            data-ai-hint="company logo Nav Wireless"
            priority 
        />
        <h1 className="text-base font-medium tracking-wider text-slate-100/90"> 
          LiFi Feasibility Checker
        </h1>
      </div>
    </header>
  );
}
