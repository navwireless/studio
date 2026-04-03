// src/components/help/help-button.tsx
'use client';

import React from 'react';
import { COLORS, SHADOWS, Z_INDEX } from '@/styles/design-tokens';

interface HelpButtonProps {
  onClick: () => void;
  hasNotification?: boolean;
}

export function HelpButton({ onClick, hasNotification = false }: HelpButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Help & Guides"
      title="Help & Guides"
      className="fixed bottom-6 right-6 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      style={{
        width: 48,
        height: 48,
        backgroundColor: COLORS.primary[500],
        boxShadow: SHADOWS.lg,
        zIndex: Z_INDEX.sticky,
        color: '#FFFFFF',
      }}
    >
      <span className="text-lg font-bold select-none" aria-hidden="true">
        ?
      </span>

      {/* Notification dot */}
      {hasNotification && (
        <span
          className="absolute -top-0.5 -right-0.5 flex h-3 w-3"
          aria-label="New updates available"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}
    </button>
  );
}