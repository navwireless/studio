'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CursorCoordinatesProps {
    lat: number | null;
    lng: number | null;
    isVisible: boolean;
}

function formatDMS(decimal: number, isLat: boolean): string {
    const abs = Math.abs(decimal);
    const d = Math.floor(abs);
    const mFloat = (abs - d) * 60;
    const m = Math.floor(mFloat);
    const s = ((mFloat - m) * 60).toFixed(1);
    const dir = isLat ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
    return `${d}°${m}'${s}"${dir}`;
}

export default function CursorCoordinates({ lat, lng, isVisible }: CursorCoordinatesProps) {
    if (!isVisible || lat === null || lng === null) return null;

    return (
        <div className={cn(
            'absolute bottom-2 left-2 z-10',
            'bg-black/70 backdrop-blur-xl rounded-lg px-2.5 py-1.5',
            'border border-white/[0.08]',
            'pointer-events-none select-none',
            'animate-in fade-in duration-200',
            'hidden lg:flex flex-col gap-0.5' // Desktop only
        )}>
            <p className="text-[0.6rem] font-mono text-white/80 tabular-nums leading-none">
                {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
            <p className="text-[0.5rem] font-mono text-white/40 tabular-nums leading-none">
                {formatDMS(lat, true)} {formatDMS(lng, false)}
            </p>
        </div>
    );
}