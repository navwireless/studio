
"use client";

import React from 'react'; // Keep React import
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import InteractiveMap with SSR turned off
const InteractiveMap = dynamic(() => import('@/components/fso/interactive-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-muted-foreground">Loading Map...</p>
    </div>
  ),
});

// All other imports, state, hooks, handlers, and JSX from the most recent
// "extremely simplified Home" version are commented out or kept minimal.

export default function Home() {
  console.log("[page.tsx] DEBUG: Rendering EXTREMELY simplified Home with fixed height map container and dynamic InteractiveMap (ssr:false).");

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative bg-purple-500/30"> {/* DEBUG BG for page container */}
      {/* This div wrapper provides a fixed height for the map container */}
      <div style={{ height: '500px', width: '100%', border: '2px solid blue' }}>
        <InteractiveMap
          mapContainerClassName="w-full h-full" // This will apply to InteractiveMap's root div
          // Provide minimal, valid default props if InteractiveMap expects them,
          // even if they are not used in its current simplified state.
          // For now, only mapContainerClassName is critical as per InteractiveMap's current simplified state.
        />
      </div>
    </div>
  );
}

// Original complex content of page.tsx is effectively "commented out" by not including it here.
// This focuses solely on getting InteractiveMap to load without the SSR error.
// If this works, we can gradually re-introduce the other state and components.
