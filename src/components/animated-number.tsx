'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number; // ms, default 500
  decimals?: number; // decimal places, default 2
  suffix?: string; // e.g., " km", " m"
  className?: string;
}

export function AnimatedNumber({ value, duration = 500, decimals = 2, suffix = '', className }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const startValueRef = useRef(value);
  const endValueRef = useRef(value);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (value === endValueRef.current) return;

    startValueRef.current = displayValue;
    endValueRef.current = value;
    startTimeRef.current = performance.now();

    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsedTime = time - startTimeRef.current;
      const progress = Math.min(elapsedTime / duration, 1);

      // Ease-out quad
      const easeProgress = progress * (2 - progress);

      const currentVal = startValueRef.current + (endValueRef.current - startValueRef.current) * easeProgress;
      setDisplayValue(currentVal);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [value, duration, displayValue]);

  return <span className={className}>{displayValue.toFixed(decimals)}{suffix}</span>;
}
