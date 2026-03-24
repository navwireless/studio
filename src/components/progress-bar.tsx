'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  isActive: boolean;
}

export function ProgressBar({ isActive }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setVisible(true);
      setProgress(10); // Start slightly filled

      const timers = [
        setTimeout(() => setProgress(30), 200),
        setTimeout(() => setProgress(60), 800),
        setTimeout(() => setProgress(80), 2000),
        setTimeout(() => setProgress(90), 5000), // Very slow trailing
      ];

      return () => timers.forEach(clearTimeout);
    } else {
      if (visible) {
        setProgress(100);
        const hideTimer = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 300); // Wait for transition to 100%
        return () => clearTimeout(hideTimer);
      }
    }
  }, [isActive, visible]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none bg-transparent">
      <div 
        className={cn(
          "h-full bg-primary transition-all ease-out",
          progress === 100 ? "duration-[300ms]" : "duration-[800ms]"
        )}
        style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
      />
    </div>
  );
}
