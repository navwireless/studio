
"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import type { LOSPoint } from '@/types'; // Assuming LOSPoint is { distance: number (km), terrainElevation: number, losHeight: number }
import { cn } from '@/lib/utils';

interface CustomProfileChartProps {
  data: LOSPoint[]; // Profile data
  pointAName?: string;
  pointBName?: string;
  isStale?: boolean; // For visual indication if needed
  totalDistanceKm?: number; // Expect this from analysisResult.distanceKm
  isLoading?: boolean; // To show a loading state
}

const PADDING = { top: 20, right: 30, bottom: 40, left: 50 }; // Increased bottom padding for X-axis labels
const AXIS_COLOR = 'hsl(var(--muted-foreground))';
const TEXT_COLOR = 'hsl(var(--muted-foreground))';
const GRID_COLOR = 'hsl(var(--border))';
const TERRAIN_FILL_COLOR = 'rgba(99, 102, 241, 0.35)'; // Match existing Recharts
const TERRAIN_STROKE_COLOR = 'rgba(99, 102, 241, 0.6)';
const LOS_LINE_COLOR = '#22d3ee'; // Match existing Recharts
const TOWER_LINE_COLOR = '#eab308'; // Match existing Recharts

export default function CustomProfileChart({
  data,
  pointAName = "Site A",
  pointBName = "Site B",
  isStale,
  totalDistanceKm,
  isLoading
}: CustomProfileChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Ensure canvas is not 0x0 if parent is hidden then shown
    if (rect.width === 0 || rect.height === 0) {
        // Attempt to redraw on next frame if dimensions are 0
        requestAnimationFrame(drawChart);
        return;
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const chartWidth = rect.width - PADDING.left - PADDING.right;
    const chartHeight = rect.height - PADDING.top - PADDING.bottom;

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.save();
    ctx.translate(PADDING.left, PADDING.top);

    // Determine data ranges
    const elevations = data.flatMap(p => [p.terrainElevation, p.losHeight]);
    let minY = Math.min(...elevations);
    let maxY = Math.max(...elevations);
    const yRange = maxY - minY;
    
    minY -= yRange * 0.15; // Increased padding for Y-axis
    maxY += yRange * 0.15;
    if (maxY === minY) { 
        maxY +=10;
        minY -=10;
    }

    const maxX = totalDistanceKm * 1000; // Max distance in meters

    // Scaling functions
    const getX = (distanceKm: number) => (distanceKm * 1000 / maxX) * chartWidth;
    const getY = (elevation: number) => chartHeight - ((elevation - minY) / (maxY - minY)) * chartHeight;

    // 1. Draw Grid
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    const numHorizontalGridLines = 5;
    for (let i = 0; i <= numHorizontalGridLines; i++) {
        const y = (chartHeight / numHorizontalGridLines) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
    }
    const numVerticalGridLines = Math.min(5, Math.floor(totalDistanceKm / (totalDistanceKm > 5 ? 2 : 1) ) ); // Dynamic vertical lines
    for (let i = 0; i <= numVerticalGridLines; i++) {
        const x = (chartWidth / numVerticalGridLines) * i;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, chartHeight);
    }
    ctx.stroke();

    // 2. Draw Terrain Profile
    ctx.beginPath();
    ctx.moveTo(getX(data[0].distance), getY(data[0].terrainElevation));
    data.forEach(p => {
      ctx.lineTo(getX(p.distance), getY(p.terrainElevation));
    });
    // Close path to fill area under terrain
    ctx.lineTo(getX(data[data.length - 1].distance), chartHeight); 
    ctx.lineTo(getX(data[0].distance), chartHeight); 
    ctx.closePath();
    ctx.fillStyle = TERRAIN_FILL_COLOR;
    ctx.fill();
    // Stroke the top line of terrain
    ctx.beginPath();
    ctx.moveTo(getX(data[0].distance), getY(data[0].terrainElevation));
    data.forEach(p => {
      ctx.lineTo(getX(p.distance), getY(p.terrainElevation));
    });
    ctx.strokeStyle = TERRAIN_STROKE_COLOR;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. Draw LOS Line
    ctx.beginPath();
    ctx.moveTo(getX(data[0].distance), getY(data[0].losHeight));
    ctx.lineTo(getX(data[data.length - 1].distance), getY(data[data.length - 1].losHeight));
    ctx.strokeStyle = LOS_LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Draw Tower Poles
    ctx.strokeStyle = TOWER_LINE_COLOR;
    ctx.lineWidth = 2;
    // Tower A
    ctx.beginPath();
    ctx.moveTo(getX(data[0].distance), getY(data[0].terrainElevation));
    ctx.lineTo(getX(data[0].distance), getY(data[0].losHeight));
    ctx.stroke();
    // Tower B
    ctx.beginPath();
    ctx.moveTo(getX(data[data.length - 1].distance), getY(data[data.length - 1].terrainElevation));
    ctx.lineTo(getX(data[data.length - 1].distance), getY(data[data.length - 1].losHeight));
    ctx.stroke();


    // 5. Draw Axes & Labels
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = "10px Inter, sans-serif"; // Using Inter as an example modern font
    // Y-axis labels
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= numHorizontalGridLines; i++) {
        const yPos = (chartHeight / numHorizontalGridLines) * i;
        const elVal = maxY - (yPos / chartHeight) * (maxY - minY);
        ctx.fillText(elVal.toFixed(0) + "m", -8, yPos);
    }
    
    // X-axis labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i <= numVerticalGridLines; i++) {
        const xPos = (chartWidth / numVerticalGridLines) * i;
        const distVal = (xPos / chartWidth) * maxX;
        const distLabel = distVal > 999 ? (distVal/1000).toFixed(1) + "km" : distVal.toFixed(0) + "m";
        ctx.fillText(distLabel, xPos, chartHeight + 8);
    }
    
    // Site Names
    ctx.fillStyle = TEXT_COLOR; // Or a more prominent color
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(pointAName, getX(data[0].distance), getY(data[0].losHeight) - 5);
    ctx.fillText(pointBName, getX(data[data.length-1].distance), getY(data[data.length - 1].losHeight) - 5);

    ctx.restore(); 

  }, [data, totalDistanceKm, pointAName, pointBName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use ResizeObserver to redraw on size changes
    const resizeObserver = new ResizeObserver(() => {
        // Delay draw to ensure layout is stable
        requestAnimationFrame(drawChart);
    });
    resizeObserver.observe(canvas);

    drawChart(); // Initial draw

    return () => {
        resizeObserver.unobserve(canvas);
        window.removeEventListener('resize', drawChart); // Just in case, though ResizeObserver is better
    }
  }, [drawChart]);

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
    <div className={cn("w-full h-full", isStale && "opacity-50")}>
      {/* Ensure parent div has explicit dimensions for canvas to correctly size */}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
