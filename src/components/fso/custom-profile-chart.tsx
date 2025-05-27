
// src/components/fso/custom-profile-chart.tsx
"use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';
import type { LOSPoint } from '@/types';
import { cn } from '@/lib/utils';

interface CustomProfileChartProps {
  data: LOSPoint[];
  pointAName?: string;
  pointBName?: string;
  isStale?: boolean;
  totalDistanceKm?: number;
  isLoading?: boolean; 
}

const PADDING = { top: 20, right: 30, bottom: 40, left: 50 }; 
const AXIS_COLOR = 'hsl(var(--muted-foreground))'; // Not directly used, TEXT_COLOR is used
const TEXT_COLOR = 'hsl(var(--muted-foreground))';
const GRID_COLOR = 'hsla(var(--border), 0.5)'; 
const TERRAIN_FILL_COLOR = 'rgba(99, 102, 241, 0.35)';
const TERRAIN_STROKE_COLOR = 'rgba(99, 102, 241, 0.6)';
const LOS_LINE_COLOR = '#22d3ee';
const TOWER_LINE_COLOR = '#eab308'; 
const HOVER_LINE_COLOR = 'hsl(var(--accent))';
const HOVER_DOT_COLOR = '#22d3ee'; // Match LOS line for dot on path
const TOOLTIP_BG_COLOR = 'hsl(var(--popover))';
const TOOLTIP_TEXT_COLOR = 'hsl(var(--popover-foreground))';
const TOOLTIP_BORDER_COLOR = 'hsl(var(--border))';

export default function CustomProfileChart({
  data,
  pointAName = "Site A",
  pointBName = "Site B",
  isStale,
  totalDistanceKm,
  isLoading
}: CustomProfileChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverData, setHoverData] = useState<{ xPx: number; yPx: number; point: LOSPoint & { distanceMeters: number } } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) {
        requestAnimationFrame(drawChart);
        return;
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const chartWidth = rect.width - PADDING.left - PADDING.right;
    const chartHeight = rect.height - PADDING.top - PADDING.bottom;

    ctx.clearRect(0, 0, rect.width, rect.height);
    
    const originalTransform = ctx.getTransform(); // Save for drawing tooltip relative to canvas, not chart area
    ctx.translate(PADDING.left, PADDING.top);

    const elevations = data.flatMap(p => [p.terrainElevation, p.losHeight]);
    let minY = Math.min(...elevations);
    let maxY = Math.max(...elevations);
    const yDataRange = maxY - minY;
    minY -= yDataRange * 0.15; 
    maxY += yDataRange * 0.15;
    if (maxY === minY) { maxY +=10; minY -=10; }
    if (maxY < minY) [maxY, minY] = [minY, maxY]; 

    const maxXKm = totalDistanceKm; 
    const maxX = maxXKm * 1000; 

    const getX = (distanceKm: number) => (distanceKm / maxXKm) * chartWidth;
    const getY = (elevation: number) => chartHeight - ((elevation - minY) / (maxY - minY)) * chartHeight;

    // 1. Draw Grid Lines
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    ctx.font = "9px Inter, sans-serif";
    ctx.fillStyle = TEXT_COLOR;

    const numYTicks = 5;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= numYTicks; i++) {
      const val = minY + (i / numYTicks) * (maxY - minY);
      const y = getY(val);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();
      ctx.fillText(val.toFixed(0) + "m", -8, y);
    }

    const numXTicks = Math.min(5, Math.max(1, Math.floor(totalDistanceKm / (totalDistanceKm > 5 ? 2 : 1) ) ) ); 
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i <= numXTicks; i++) {
      const distKm = (i / numXTicks) * maxXKm;
      const x = getX(distKm);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, chartHeight);
      ctx.stroke();
      ctx.fillText((distKm*1000).toFixed(0) + "m", x, chartHeight + 8);
    }
    
    // 2. Draw Terrain Profile
    ctx.beginPath();
    ctx.moveTo(getX(data[0].distance), getY(data[0].terrainElevation));
    data.forEach(p => ctx.lineTo(getX(p.distance), getY(p.terrainElevation)));
    ctx.lineTo(getX(data[data.length - 1].distance), chartHeight);
    ctx.lineTo(getX(data[0].distance), chartHeight);
    ctx.closePath();
    ctx.fillStyle = TERRAIN_FILL_COLOR;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(getX(data[0].distance), getY(data[0].terrainElevation));
    data.forEach(p => ctx.lineTo(getX(p.distance), getY(p.terrainElevation)));
    ctx.strokeStyle = TERRAIN_STROKE_COLOR;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. Draw LOS Line
    ctx.beginPath();
    ctx.moveTo(getX(data[0].distance), getY(data[0].losHeight));
    ctx.lineTo(getX(data[data.length - 1].distance), getY(data[data.length - 1].losHeight));
    ctx.strokeStyle = LOS_LINE_COLOR;
    ctx.lineWidth = 1.5; 
    ctx.stroke();

    // 4. Draw Tower Lines and Site Names
    ctx.strokeStyle = TOWER_LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.fillStyle = TEXT_COLOR; 
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    const xA = getX(data[0].distance);
    const yTerrainA = getY(data[0].terrainElevation);
    const yLosA = getY(data[0].losHeight);
    ctx.beginPath();
    ctx.moveTo(xA, yTerrainA);
    ctx.lineTo(xA, yLosA);
    ctx.stroke();
    ctx.fillText(pointAName, xA, yLosA - 5);

    const xB = getX(data[data.length - 1].distance);
    const yTerrainB = getY(data[data.length - 1].terrainElevation);
    const yLosB = getY(data[data.length - 1].losHeight);
    ctx.beginPath();
    ctx.moveTo(xB, yTerrainB);
    ctx.lineTo(xB, yLosB);
    ctx.stroke();
    ctx.fillText(pointBName, xB, yLosB - 5);

    // 5. Draw Hover Effects (if hoverData exists)
    if (hoverData) {
      const hxPx = hoverData.xPx; // Pixel X within chart area
      const hyPxLos = hoverData.yPx; // Pixel Y on LOS line within chart area

      // Vertical guide line
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = HOVER_LINE_COLOR;
      ctx.lineWidth = 1;
      ctx.moveTo(hxPx, 0);
      ctx.lineTo(hxPx, chartHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dot on LOS line
      ctx.beginPath();
      ctx.arc(hxPx, hyPxLos, 4, 0, 2 * Math.PI);
      ctx.fillStyle = HOVER_DOT_COLOR;
      ctx.fill();
      ctx.strokeStyle = TOOLTIP_BG_COLOR; 
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    
    ctx.setTransform(originalTransform); // Restore transform for tooltip drawing

    // 6. Draw Tooltip (on canvas)
    if (hoverData && mousePosition) {
        const p = hoverData.point;
        const lines = [
            `Distance to Site: ${(p.distance * 1000).toFixed(2)} m`,
            `Line of Sight height: ${p.losHeight.toFixed(1)} m`,
            `Fresnel height: ${p.clearance.toFixed(1)} m`
        ];
        
        ctx.font = "10px Inter, sans-serif";
        const lineHeight = 14; // Increased for better readability
        const tooltipPadding = 6;
        const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
        const tooltipWidth = textWidth + 2 * tooltipPadding;
        const tooltipHeight = lines.length * lineHeight + 2 * tooltipPadding - (lineHeight - 10); // Adjust based on line height

        let tipX = mousePosition.x + 15; 
        let tipY = mousePosition.y + 15; 

        if (tipX + tooltipWidth > rect.width - PADDING.right/2) tipX = mousePosition.x - tooltipWidth - 15;
        if (tipY + tooltipHeight > rect.height - PADDING.bottom/2) tipY = mousePosition.y - tooltipHeight - 15;
        if (tipX < PADDING.left/2) tipX = PADDING.left/2;
        if (tipY < PADDING.top/2) tipY = PADDING.top/2;
        
        // Rounded rectangle for tooltip
        ctx.beginPath();
        const cornerRadius = 4;
        ctx.moveTo(tipX + cornerRadius, tipY);
        ctx.lineTo(tipX + tooltipWidth - cornerRadius, tipY);
        ctx.quadraticCurveTo(tipX + tooltipWidth, tipY, tipX + tooltipWidth, tipY + cornerRadius);
        ctx.lineTo(tipX + tooltipWidth, tipY + tooltipHeight - cornerRadius);
        ctx.quadraticCurveTo(tipX + tooltipWidth, tipY + tooltipHeight, tipX + tooltipWidth - cornerRadius, tipY + tooltipHeight);
        ctx.lineTo(tipX + cornerRadius, tipY + tooltipHeight);
        ctx.quadraticCurveTo(tipX, tipY + tooltipHeight, tipX, tipY + tooltipHeight - cornerRadius);
        ctx.lineTo(tipX, tipY + cornerRadius);
        ctx.quadraticCurveTo(tipX, tipY, tipX + cornerRadius, tipY);
        ctx.closePath();

        ctx.fillStyle = TOOLTIP_BG_COLOR;
        ctx.globalAlpha = 0.9; // Make tooltip slightly translucent
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = TOOLTIP_BORDER_COLOR;
        ctx.lineWidth = 0.5;
        ctx.stroke();


        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        lines.forEach((line, i) => {
            if (line.startsWith("Line of Sight height:")) ctx.fillStyle = LOS_LINE_COLOR;
            else ctx.fillStyle = TOOLTIP_TEXT_COLOR;
            ctx.fillText(line, tipX + tooltipPadding, tipY + tooltipPadding + (i * lineHeight) + (lineHeight / 2) );
        });
    }
    // Note: ctx.restore() was removed from here as setTransform(originalTransform) is used.
    // If using save/restore, ensure they are balanced.

  }, [data, totalDistanceKm, pointAName, pointBName, hoverData, mousePosition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null) {
        setHoverData(null);
        setMousePosition(null);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const mouseCanvasX = event.clientX - rect.left;
      const mouseCanvasY = event.clientY - rect.top;
      
      setMousePosition({ x: mouseCanvasX, y: mouseCanvasY }); 

      const chartWidth = rect.width - PADDING.left - PADDING.right;
      const chartHeight = rect.height - PADDING.top - PADDING.bottom;
      const mouseXInChartArea = mouseCanvasX - PADDING.left;

      if (mouseXInChartArea >= 0 && mouseXInChartArea <= chartWidth) {
        const distanceKmHovered = (mouseXInChartArea / chartWidth) * totalDistanceKm;
        
        let closestPoint = data[0];
        let minDiff = Math.abs(data[0].distance - distanceKmHovered);
        for (let i = 1; i < data.length; i++) {
          const diff = Math.abs(data[i].distance - distanceKmHovered);
          if (diff < minDiff) {
            minDiff = diff;
            closestPoint = data[i];
          }
        }
        
        // Calculate pixel coordinates for the dot based on this closestPoint
        // Need scales from drawChart context or recalculate them here.
        const elevations = data.flatMap(p => [p.terrainElevation, p.losHeight]);
        let tempMinY = Math.min(...elevations);
        let tempMaxY = Math.max(...elevations);
        const yDataRange = tempMaxY - tempMinY;
        tempMinY -= yDataRange * 0.15;
        tempMaxY += yDataRange * 0.15;
        if (tempMaxY === tempMinY) { tempMaxY +=10; tempMinY -=10; }
        if (tempMaxY < tempMinY) [tempMaxY, tempMinY] = [tempMinY, tempMaxY];

        const getXPx = (distKm: number) => (distKm / totalDistanceKm) * chartWidth;
        const getYPx = (elev: number) => chartHeight - ((elev - tempMinY) / (tempMaxY - tempMinY)) * chartHeight;

        setHoverData({ 
            xPx: getXPx(closestPoint.distance),
            yPx: getYPx(closestPoint.losHeight),
            point: { ...closestPoint, distanceMeters: closestPoint.distance * 1000 }
        });
      } else {
        setHoverData(null);
      }
    };
    
    const handleMouseOut = () => {
      setHoverData(null);
      setMousePosition(null);
    };

    // Use ResizeObserver for better resize handling
    const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(drawChart);
    });
    resizeObserver.observe(canvas);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseout', handleMouseOut);

    drawChart(); // Initial draw

    return () => {
      resizeObserver.unobserve(canvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseout', handleMouseOut);
    };
  }, [drawChart, data, totalDistanceKm]); 
  
  useEffect(() => { 
      drawChart();
  }, [hoverData, mousePosition, drawChart]); // Redraw when hoverData or mousePosition changes for tooltip

  if (isLoading) {
      return (
          <div className={cn("h-full flex items-center justify-center p-2 bg-muted/30 rounded-md", isStale && "opacity-50")}>
              <p className="text-muted-foreground text-xs text-center">Loading analysis data...</p>
          </div>
      );
  }

  if (!data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null) {
    return (
        <div className={cn("h-full flex items-center justify-center p-2 bg-muted/30 rounded-md", isStale && "opacity-50")}>
          <p className="text-muted-foreground text-xs text-center">
            Not enough data to display profile. Perform analysis.
          </p>
        </div>
    );
  }

  return (
    <div className={cn("w-full h-full relative", isStale && "opacity-50")}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', cursor: 'crosshair' }} />
    </div>
  );
}

    