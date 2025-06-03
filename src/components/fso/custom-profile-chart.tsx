
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
  isActionPending?: boolean; 
  onTowerHeightChangeFromGraph: (siteId: 'pointA' | 'pointB', newHeight: number) => void;
}

const PADDING_BASE = { top: 20, right: 30, bottom: 40, left: 50 }; 
const TEXT_COLOR = 'hsl(210, 20%, 55%)'; 
const GRID_COLOR = 'hsla(217, 33%, 20%, 0.7)'; 

const TERRAIN_FILL_COLOR = 'rgba(99, 102, 241, 0.35)';
const TERRAIN_STROKE_COLOR = 'rgba(99, 102, 241, 0.6)';
const LOS_LINE_COLOR = '#22d3ee'; 
const TOWER_LINE_COLOR = '#eab308'; 
const HOVER_GUIDE_LINE_COLOR = 'rgba(200, 200, 200, 0.5)';
const HOVER_DOT_COLOR = '#22d3ee'; 

const TOOLTIP_BG_COLOR = 'hsla(222, 40%, 10%, 0.9)';
const TOOLTIP_TEXT_COLOR = 'hsl(210, 40%, 95%)';  
const TOOLTIP_BORDER_COLOR = 'hsl(217, 33%, 20%)'; 

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

interface ChartMetrics {
  padding: typeof PADDING_BASE;
  canvasRect: DOMRect | null;
  chartPixelWidth: number;
  chartPixelHeight: number;
  minYData: number;
  maxYData: number;
  maxXKm: number;
  getPixelXFromKm: (distanceKm: number) => number;
  getPixelYFromElevation: (elevation: number) => number;
  getElevationFromPixelY: (pixelY: number) => number;
  getKmFromPixelX: (pixelX: number) => number;
}


export default function CustomProfileChart({
  data,
  pointAName = "Site A",
  pointBName = "Site B",
  isStale,
  totalDistanceKm,
  isActionPending,
  onTowerHeightChangeFromGraph
}: CustomProfileChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverData, setHoverData] = useState<{ xPx: number; yPx: number; point: LOSPoint & { distanceMeters: number } } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  const [draggingTower, setDraggingTower] = useState<'A' | 'B' | null>(null);
  const [dragStartInfo, setDragStartInfo] = useState<{ clientY: number; initialTowerHeightMeters: number; siteTerrainElevation: number} | null>(null);
  const [isInteractingByDrag, setIsInteractingByDrag] = useState(false); // This state indicates active dragging

  const chartMetricsRef = useRef<ChartMetrics | null>(null);

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
    
    const PADDING = PADDING_BASE;
    const chartWidth = rect.width - PADDING.left - PADDING.right;
    const chartHeight = rect.height - PADDING.top - PADDING.bottom;

    ctx.clearRect(0, 0, rect.width, rect.height);
    
    const originalTransform = ctx.getTransform();
    ctx.translate(PADDING.left, PADDING.top);

    const elevations = data.flatMap(p => [p.terrainElevation, p.losHeight]);
    let minY = Math.min(...elevations);
    let maxY = Math.max(...elevations);
    const yDataRange = maxY - minY;
    minY -= yDataRange * 0.15; 
    maxY += yDataRange * 0.15;
    if (maxY === minY) { maxY +=10; minY -=10; }
    if (maxY < minY) [maxY, minY] = [minY, maxY]; 

    const maxXKmActual = totalDistanceKm; 

    const getX = (distanceKm: number) => (distanceKm / maxXKmActual) * chartWidth;
    const getY = (elevation: number) => chartHeight - ((elevation - minY) / (maxY - minY)) * chartHeight;
    const getElevationFromY = (pixelY: number) => minY + ((chartHeight - pixelY) / chartHeight) * (maxY - minY);
    const getKmFromX = (pixelX: number) => (pixelX / chartWidth) * maxXKmActual;

    chartMetricsRef.current = {
        padding: PADDING,
        canvasRect: rect,
        chartPixelWidth: chartWidth,
        chartPixelHeight: chartHeight,
        minYData: minY,
        maxYData: maxY,
        maxXKm: maxXKmActual,
        getPixelXFromKm: getX,
        getPixelYFromElevation: getY,
        getElevationFromPixelY: getElevationFromY,
        getKmFromPixelX: getKmFromX,
    };

    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    ctx.font = "9px Inter, sans-serif";
    ctx.fillStyle = TEXT_COLOR;

    const numYTicks = 5;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= numYTicks; i++) {
      const val = minY + (i / numYTicks) * (maxY - minY);
      const yPx = getY(val);
      ctx.beginPath();
      ctx.moveTo(0, yPx);
      ctx.lineTo(chartWidth, yPx);
      ctx.stroke();
      ctx.fillText(val.toFixed(0) + "m", -8, yPx);
    }

    const numXTicks = Math.min(5, Math.max(1, Math.floor(maxXKmActual / (maxXKmActual > 5 ? 2 : 1) ) ) ); 
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i <= numXTicks; i++) {
      const distKm = (i / numXTicks) * maxXKmActual;
      const xPx = getX(distKm);
      ctx.beginPath();
      ctx.moveTo(xPx, 0);
      ctx.lineTo(xPx, chartHeight);
      ctx.stroke();
      ctx.fillText((distKm*1000).toFixed(0) + "m", xPx, chartHeight + 8);
    }
    
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

    ctx.beginPath();
    ctx.moveTo(getX(data[0].distance), getY(data[0].losHeight));
    ctx.lineTo(getX(data[data.length - 1].distance), getY(data[data.length - 1].losHeight));
    ctx.strokeStyle = LOS_LINE_COLOR;
    ctx.lineWidth = 1.5; 
    ctx.stroke();

    ctx.fillStyle = TEXT_COLOR; 
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    const towerHandleRadiusVisual = 6;

    const xA = getX(data[0].distance);
    const yTerrainA = getY(data[0].terrainElevation);
    const yLosA = getY(data[0].losHeight);
    ctx.strokeStyle = TOWER_LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xA, yTerrainA);
    ctx.lineTo(xA, yLosA);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(xA, yLosA, towerHandleRadiusVisual, 0, 2 * Math.PI); 
    ctx.fillStyle = TOWER_LINE_COLOR; 
    ctx.fill();
    ctx.strokeStyle = TOOLTIP_BG_COLOR; 
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = TEXT_COLOR; 
    ctx.fillText(pointAName, xA, yLosA - (towerHandleRadiusVisual + 2)); 

    const xB = getX(data[data.length - 1].distance);
    const yTerrainB = getY(data[data.length - 1].terrainElevation);
    const yLosB = getY(data[data.length - 1].losHeight);
    ctx.strokeStyle = TOWER_LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xB, yTerrainB);
    ctx.lineTo(xB, yLosB);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(xB, yLosB, towerHandleRadiusVisual, 0, 2 * Math.PI); 
    ctx.fillStyle = TOWER_LINE_COLOR;
    ctx.fill();
    ctx.strokeStyle = TOOLTIP_BG_COLOR;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = TEXT_COLOR; 
    ctx.fillText(pointBName, xB, yLosB - (towerHandleRadiusVisual + 2));

    if (hoverData && !draggingTower && !isInteractingByDrag) { 
      const hxPx = hoverData.xPx; 
      const hyPxLos = hoverData.yPx; 

      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = HOVER_GUIDE_LINE_COLOR; 
      ctx.lineWidth = 1;
      ctx.moveTo(hxPx, 0);
      ctx.lineTo(hxPx, chartHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(hxPx, hyPxLos, 4, 0, 2 * Math.PI);
      ctx.fillStyle = HOVER_DOT_COLOR;
      ctx.fill();
      ctx.strokeStyle = TOOLTIP_BG_COLOR; 
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    
    ctx.setTransform(originalTransform);

    if (hoverData && mousePosition && !draggingTower && !isInteractingByDrag) { 
        const p = hoverData.point;
        const lines = [
            `Distance to Site: ${(p.distance * 1000).toFixed(2)} m`,
            `Line of Sight height: ${p.losHeight.toFixed(1)} m`,
            `Fresnel height: ${p.clearance.toFixed(1)} m`
        ];
        
        ctx.font = "10px Inter, sans-serif"; 
        const lineHeight = 14; 
        const tooltipPadding = 6;
        const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
        const tooltipWidth = textWidth + 2 * tooltipPadding;
        const tooltipHeight = lines.length * lineHeight + 2 * tooltipPadding - (lineHeight - 10); 
        const cornerRadius = 4;

        let tipX = mousePosition.x + 15; 
        let tipY = mousePosition.y - tooltipHeight - 5; 

        if (tipX + tooltipWidth > rect.width - PADDING.right/2) { 
            tipX = mousePosition.x - tooltipWidth - 15; 
        }
        if (tipY < PADDING.top/2) { 
            tipY = mousePosition.y + 15; 
        }
        if (tipY + tooltipHeight > rect.height - PADDING.bottom/2) { 
            tipY = rect.height - PADDING.bottom/2 - tooltipHeight;
        }
        if (tipX < PADDING.left/2) { 
            tipX = PADDING.left/2;
        }
        
        ctx.globalAlpha = 0.9; 
        ctx.fillStyle = TOOLTIP_BG_COLOR; 
        ctx.strokeStyle = TOOLTIP_BORDER_COLOR; 
        ctx.lineWidth = 0.5; 
        
        drawRoundedRect(ctx, tipX, tipY, tooltipWidth, tooltipHeight, cornerRadius);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        lines.forEach((line, i) => {
            if (line.startsWith("Line of Sight height:")) {
                ctx.fillStyle = LOS_LINE_COLOR; 
            } else {
                ctx.fillStyle = TOOLTIP_TEXT_COLOR; 
            }
            ctx.fillText(line, tipX + tooltipPadding, tipY + tooltipPadding + (i * lineHeight) + (lineHeight / 2) );
        });
    }
  }, [data, totalDistanceKm, pointAName, pointBName, hoverData, mousePosition, draggingTower, isInteractingByDrag]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMoveForTooltip = (event: MouseEvent) => {
        if (draggingTower || !chartMetricsRef.current || !data || data.length < 2 || isInteractingByDrag) return; 

        const { canvasRect, padding, getPixelXFromKm, getPixelYFromElevation, getKmFromPixelX } = chartMetricsRef.current;
        if (!canvasRect) return;

        const mouseCanvasX = event.clientX - canvasRect.left;
        const mouseCanvasY = event.clientY - canvasRect.top;
        setMousePosition({ x: mouseCanvasX, y: mouseCanvasY });

        const mouseXInChartArea = mouseCanvasX - padding.left;
        
        if (mouseXInChartArea >= 0 && mouseXInChartArea <= chartMetricsRef.current.chartPixelWidth) {
            const distanceKmHovered = getKmFromPixelX(mouseXInChartArea);
            let closestPoint = data[0];
            let minDiff = Math.abs(data[0].distance - distanceKmHovered);
            for (let i = 1; i < data.length; i++) {
                const diff = Math.abs(data[i].distance - distanceKmHovered);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestPoint = data[i];
                }
            }
            
            setHoverData({
                xPx: getPixelXFromKm(closestPoint.distance) + padding.left, 
                yPx: getPixelYFromElevation(closestPoint.losHeight) + padding.top, 
                point: { ...closestPoint, distanceMeters: closestPoint.distance * 1000 }
            });
        } else {
            setHoverData(null);
        }
    };

    const handleMouseOutForTooltip = () => {
        if (draggingTower || isInteractingByDrag) return;
        setHoverData(null);
        setMousePosition(null);
    };

    const handleCanvasMouseDown = (event: MouseEvent) => {
        if (!canvasRef.current || !data || data.length < 2 || !chartMetricsRef.current || !onTowerHeightChangeFromGraph) return;
    
        const { canvasRect, padding, getPixelXFromKm, getPixelYFromElevation } = chartMetricsRef.current;
        if (!canvasRect) return;

        const clickX = event.clientX - canvasRect.left;
        const clickY = event.clientY - canvasRect.top;
    
        const towerHandleClickRadius = 10; 
    
        const towerAx = getPixelXFromKm(data[0].distance) + padding.left;
        const towerAy = getPixelYFromElevation(data[0].losHeight) + padding.top;
        const distA = Math.sqrt(Math.pow(clickX - towerAx, 2) + Math.pow(clickY - towerAy, 2));
    
        if (distA < towerHandleClickRadius) {
            setDraggingTower('A');
            setDragStartInfo({
                clientY: event.clientY,
                initialTowerHeightMeters: data[0].losHeight - data[0].terrainElevation,
                siteTerrainElevation: data[0].terrainElevation
            });
            setIsInteractingByDrag(true);
            if(canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
            event.preventDefault();
            return;
        }
    
        const towerBx = getPixelXFromKm(data[data.length - 1].distance) + padding.left;
        const towerBy = getPixelYFromElevation(data[data.length - 1].losHeight) + padding.top;
        const distB = Math.sqrt(Math.pow(clickX - towerBx, 2) + Math.pow(clickY - towerBy, 2));
    
        if (distB < towerHandleClickRadius) {
            setDraggingTower('B');
            setDragStartInfo({
                clientY: event.clientY,
                initialTowerHeightMeters: data[data.length - 1].losHeight - data[data.length - 1].terrainElevation,
                siteTerrainElevation: data[data.length-1].terrainElevation
            });
            setIsInteractingByDrag(true);
            if(canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
            event.preventDefault();
            return;
        }
    };

    canvas.addEventListener('mousemove', handleMouseMoveForTooltip);
    canvas.addEventListener('mouseout', handleMouseOutForTooltip);
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    
    const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(drawChart);
    });
    resizeObserver.observe(canvas);

    drawChart(); 

    return () => {
      resizeObserver.unobserve(canvas);
      canvas.removeEventListener('mousemove', handleMouseMoveForTooltip);
      canvas.removeEventListener('mouseout', handleMouseOutForTooltip);
      canvas.removeEventListener('mousedown', handleCanvasMouseDown);
    };
  }, [drawChart, data, totalDistanceKm, onTowerHeightChangeFromGraph, draggingTower, isInteractingByDrag]); 
  
  useEffect(() => {
    const canvas = canvasRef.current;
    // Only proceed if dragging is active AND all necessary info is present
    if (!draggingTower || !dragStartInfo || !canvas || !chartMetricsRef.current || !onTowerHeightChangeFromGraph) {
        if (canvas && canvas.style.cursor === 'grabbing') canvas.style.cursor = 'crosshair'; // Reset cursor if drag ended unexpectedly
        if(isInteractingByDrag && !draggingTower) setIsInteractingByDrag(false); // Ensure isInteractingByDrag is reset if draggingTower becomes null
        return;
    }

    const { chartPixelHeight, minYData, maxYData } = chartMetricsRef.current;

    // handleGlobalMouseMove: This function is for visual updates during drag, NOT for final state change.
    // For simplicity, we are not implementing live visual updates of the tower on the canvas during drag.
    // The tower will visually update on the next `drawChart` call after `mouseUp` and parent state update.
    const handleGlobalMouseMove = (event: MouseEvent) => {
      // This function can be used for live visual feedback on the canvas if desired,
      // but for now, it's kept minimal as the main update happens on mouseUp.
    };

    const handleGlobalMouseUp = (event: MouseEvent) => {
        if (!draggingTower || !dragStartInfo || !chartMetricsRef.current || chartPixelHeight <= 0) {
            setDraggingTower(null);
            setDragStartInfo(null);
            if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
            setIsInteractingByDrag(false);
            return;
        }
        
        const { getElevationFromPixelY } = chartMetricsRef.current;
        const clientYDelta = event.clientY - dragStartInfo.clientY;
        
        // Calculate new Y position in pixels on the chart
        const currentTowerLosY_px = chartMetricsRef.current.getPixelYFromElevation(dragStartInfo.initialTowerHeightMeters + dragStartInfo.siteTerrainElevation);
        const newTowerLosY_px = currentTowerLosY_px + clientYDelta;
        
        // Convert new Y pixel position back to elevation
        const newTowerAbsoluteElevation = getElevationFromPixelY(newTowerLosY_px);
        let finalNewTowerHeightRelativeToTerrain = newTowerAbsoluteElevation - dragStartInfo.siteTerrainElevation;

        finalNewTowerHeightRelativeToTerrain = Math.max(0, Math.min(100, parseFloat(finalNewTowerHeightRelativeToTerrain.toFixed(1))));
        
        onTowerHeightChangeFromGraph(draggingTower === 'A' ? 'pointA' : 'pointB', finalNewTowerHeightRelativeToTerrain);
        
        setDraggingTower(null);
        setDragStartInfo(null);
        if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
        setIsInteractingByDrag(false); 
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
    };
  }, [draggingTower, dragStartInfo, data, totalDistanceKm, onTowerHeightChangeFromGraph, chartMetricsRef]); // isInteractingByDrag removed, as it's set by draggingTower

  useEffect(() => { 
      drawChart();
  }, [hoverData, mousePosition, drawChart, data]);


  // Conditional rendering for loading/empty states
  if (isActionPending && !isInteractingByDrag) { // Show "Analyzing..." if an action is pending AND not currently dragging
      return (
          <div className={cn("h-full flex items-center justify-center p-2 bg-muted/30 rounded-md", isStale && "opacity-50")}>
              <p className="text-muted-foreground text-xs text-center">Analyzing...</p>
          </div>
      );
  }

  if (!data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null) {
    return (
        <div className={cn("h-full flex items-center justify-center p-2 bg-muted/30 rounded-md", isStale && "opacity-50")}>
          <p className="text-muted-foreground text-xs text-center">
            Not enough data to display profile.
          </p>
        </div>
    );
  }
  // Render the canvas. It will be visible during drag.
  // `isStale` will apply opacity after drag and before re-analysis.
  // `isActionPending` will apply pointer-events-none if an analysis is running.
  return (
    <div className={cn(
        "w-full h-full relative", 
        isStale && !isInteractingByDrag && "opacity-50", // Only apply stale opacity if not actively dragging
        isActionPending && "pointer-events-none"
      )}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          cursor: draggingTower ? 'grabbing': 'crosshair' 
        }} 
      />
    </div>
  );
}
    

    