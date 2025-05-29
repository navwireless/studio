
// src/components/fso/custom-profile-chart.tsx
"use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';
import type { LOSPoint } from '@/types';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface CustomProfileChartProps {
  data: LOSPoint[];
  pointAName?: string;
  pointBName?: string;
  totalDistanceKm?: number;
  isActionPending: boolean; // Reflects parent's analysis state
  onTowerHeightChangeFromGraph: (siteId: 'pointA' | 'pointB', newHeight: number) => void;
}

const PADDING = { top: 20, right: 30, bottom: 40, left: 50 }; 
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

interface ChartMetrics {
    minYData: number; maxYData: number; maxXKm: number;
    chartPixelWidth: number; chartPixelHeight: number;
    canvasElementRect: DOMRect;
    padding: typeof PADDING;
    getPixelXFromKm: (distanceKm: number) => number;
    getPixelYFromElevation: (elevation: number) => number;
    getElevationFromPixelY: (pixelY: number) => number;
}

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

export default function CustomProfileChart({
  data,
  pointAName = "Site A",
  pointBName = "Site B",
  totalDistanceKm,
  isActionPending, // From parent, reflects server analysis state
  onTowerHeightChangeFromGraph
}: CustomProfileChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverData, setHoverData] = useState<{ xPx: number; yPx: number; point: LOSPoint & { distanceMeters: number } } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  const [draggingTower, setDraggingTower] = useState<'A' | 'B' | null>(null);
  const [dragStartInfo, setDragStartInfo] = useState<{ 
    mouseClientY: number;
    initialTowerHeightMeters: number;
    siteTerrainElevation: number;
  } | null>(null);
  const [isInteractingByDrag, setIsInteractingByDrag] = useState(false);
  const chartMetricsRef = useRef<ChartMetrics | null>(null);


  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null) {
        if (canvas) { // Clear canvas if no data
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return; // Avoid drawing on invisible canvas
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                ctx.clearRect(0, 0, rect.width, rect.height);
            }
        }
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) {
        // If canvas is not visible yet, skip drawing or schedule a retry.
        // For simplicity, we'll skip. Parent component should ensure visibility.
        return;
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
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

    const maxXKm = totalDistanceKm; 
    // const maxX = maxXKm * 1000; // Not used directly for getX which takes km

    const getX = (distanceKm: number) => (distanceKm / maxXKm) * chartWidth;
    const getY = (elevation: number) => chartHeight - ((elevation - minY) / (maxY - minY)) * chartHeight;

    chartMetricsRef.current = {
        minYData: minY, maxYData: maxY, maxXKm,
        chartPixelWidth: chartWidth, chartPixelHeight: chartHeight,
        canvasElementRect: rect, 
        padding: PADDING,
        getPixelXFromKm: getX,
        getPixelYFromElevation: getY,
        getElevationFromPixelY: (pxY: number) => minY + ((chartHeight - pxY) / chartHeight) * (maxY - minY)
    };


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

    // 4. Draw Tower Lines and Site Names (with interactive handles)
    ctx.fillStyle = TEXT_COLOR; 
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    const towerHandleRadiusVisual = 6;

    // Site A Tower
    const xA = getX(data[0].distance);
    const yTerrainA = getY(data[0].terrainElevation);
    const yLosA = getY(data[0].losHeight);
    ctx.strokeStyle = TOWER_LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xA, yTerrainA);
    ctx.lineTo(xA, yLosA);
    ctx.stroke();
    // Handle
    ctx.beginPath();
    ctx.arc(xA, yLosA, towerHandleRadiusVisual, 0, 2 * Math.PI); 
    ctx.fillStyle = TOWER_LINE_COLOR; 
    ctx.fill();
    ctx.strokeStyle = TOOLTIP_BG_COLOR; 
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = TEXT_COLOR; 
    ctx.fillText(pointAName, xA, yLosA - (towerHandleRadiusVisual + 2)); 

    // Site B Tower
    const xB = getX(data[data.length - 1].distance);
    const yTerrainB = getY(data[data.length - 1].terrainElevation);
    const yLosB = getY(data[data.length - 1].losHeight);
    ctx.strokeStyle = TOWER_LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xB, yTerrainB);
    ctx.lineTo(xB, yLosB);
    ctx.stroke();
    // Handle
    ctx.beginPath();
    ctx.arc(xB, yLosB, towerHandleRadiusVisual, 0, 2 * Math.PI); 
    ctx.fillStyle = TOWER_LINE_COLOR;
    ctx.fill();
    ctx.strokeStyle = TOOLTIP_BG_COLOR;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = TEXT_COLOR; 
    ctx.fillText(pointBName, xB, yLosB - (towerHandleRadiusVisual + 2));


    // 5. Draw Hover Effects
    if (hoverData && !draggingTower) { 
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

    // 6. Draw Tooltip
    if (hoverData && mousePosition && !draggingTower) { 
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
  }, [data, totalDistanceKm, pointAName, pointBName, hoverData, mousePosition, draggingTower]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(() => {
        requestAnimationFrame(drawChart);
    });
    observer.observe(canvas);
    
    const handleMouseMove = (event: MouseEvent) => {
        if (draggingTower || !chartMetricsRef.current || !data || data.length < 2) {
            if (!draggingTower) setHoverData(null); // Clear hover if not dragging but metrics are missing
            return;
        }
    
        const metrics = chartMetricsRef.current;
        const mouseCanvasX = event.clientX - metrics.canvasElementRect.left;
        const mouseCanvasY = event.clientY - metrics.canvasElementRect.top;
        setMousePosition({ x: mouseCanvasX, y: mouseCanvasY });
    
        const mouseXInChartArea = mouseCanvasX - metrics.padding.left;
    
        if (mouseXInChartArea >= 0 && mouseXInChartArea <= metrics.chartPixelWidth) {
            const distanceKmHovered = (mouseXInChartArea / metrics.chartPixelWidth) * metrics.maxXKm;
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
                xPx: metrics.getPixelXFromKm(closestPoint.distance), 
                yPx: metrics.getPixelYFromElevation(closestPoint.losHeight), 
                point: { ...closestPoint, distanceMeters: closestPoint.distance * 1000 }
            });
        } else {
            setHoverData(null);
        }
    };

    const handleMouseOut = () => {
        if (draggingTower) return;
        setHoverData(null);
        setMousePosition(null);
    };

    const handleCanvasMouseDown = (event: MouseEvent) => {
        if (!chartMetricsRef.current || !data || data.length < 2 || !onTowerHeightChangeFromGraph) return;
        
        const metrics = chartMetricsRef.current;
        const clickXCanvas = event.clientX - metrics.canvasElementRect.left;
        const clickYCanvas = event.clientY - metrics.canvasElementRect.top;
    
        const towerHandleClickRadius = 8; 
    
        const towerAx_canvas = metrics.padding.left + metrics.getPixelXFromKm(data[0].distance);
        const towerAy_canvas = metrics.padding.top + metrics.getPixelYFromElevation(data[0].losHeight);
        const distA = Math.sqrt(Math.pow(clickXCanvas - towerAx_canvas, 2) + Math.pow(clickYCanvas - towerAy_canvas, 2));
    
        if (distA < towerHandleClickRadius) {
            const siteAData = data[0];
            setDragStartInfo({
                mouseClientY: event.clientY,
                initialTowerHeightMeters: siteAData.losHeight - siteAData.terrainElevation,
                siteTerrainElevation: siteAData.terrainElevation
            });
            setDraggingTower('A');
            setIsInteractingByDrag(true);
            if(canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
            event.preventDefault();
            return;
        }
    
        const towerBx_canvas = metrics.padding.left + metrics.getPixelXFromKm(data[data.length - 1].distance);
        const towerBy_canvas = metrics.padding.top + metrics.getPixelYFromElevation(data[data.length - 1].losHeight);
        const distB = Math.sqrt(Math.pow(clickXCanvas - towerBx_canvas, 2) + Math.pow(clickYCanvas - towerBy_canvas, 2));
    
        if (distB < towerHandleClickRadius) {
            const siteBData = data[data.length - 1];
             setDragStartInfo({
                mouseClientY: event.clientY,
                initialTowerHeightMeters: siteBData.losHeight - siteBData.terrainElevation,
                siteTerrainElevation: siteBData.terrainElevation
            });
            setDraggingTower('B');
            setIsInteractingByDrag(true);
            if(canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
            event.preventDefault();
            return;
        }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseout', handleMouseOut);
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    
    drawChart(); // Initial draw

    return () => {
      observer.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseout', handleMouseOut);
      canvas.removeEventListener('mousedown', handleCanvasMouseDown);
    };
  }, [drawChart, data, totalDistanceKm, onTowerHeightChangeFromGraph, draggingTower]); 
  
  useEffect(() => { 
      drawChart();
  }, [hoverData, mousePosition, drawChart, data]); // Redraw if data changes too


  useEffect(() => {
    const canvasElem = canvasRef.current; // Local variable for cleanup
    if (!draggingTower || !dragStartInfo || !chartMetricsRef.current || !canvasElem) {
        if (isInteractingByDrag && !draggingTower) setIsInteractingByDrag(false); // Ensure drag state is reset if prerequisites fail
        return;
    }

    const metrics = chartMetricsRef.current;

    const handleGlobalMouseMove = (event: MouseEvent) => {
        if (!draggingTower || !dragStartInfo || !metrics) return;

        const clientYDelta = event.clientY - dragStartInfo.mouseClientY;
        const currentTowerAbsoluteLOSElevation = dragStartInfo.initialTowerHeightMeters + dragStartInfo.siteTerrainElevation;
        const currentHandlePixelYInChartArea = metrics.getPixelYFromElevation(currentTowerAbsoluteLOSElevation);
        
        // In canvas, Y=0 is top. Dragging mouse down increases clientY, which should decrease pixel Y on chart for taller tower.
        const newHandlePixelYInChartArea = currentHandlePixelYInChartArea - clientYDelta;
        
        const newAbsLOSElevation = metrics.getElevationFromPixelY(newHandlePixelYInChartArea);
        let newTowerHeight = newAbsLOSElevation - dragStartInfo.siteTerrainElevation;
        newTowerHeight = Math.max(0, Math.min(100, parseFloat(newTowerHeight.toFixed(1))));
        
        // console.log('MouseMove Drag:', { clientYDelta, newTowerHeight });
        // For live update of chart during drag, would need to update 'data' prop or pass temporary height to drawChart
    };

    const handleGlobalMouseUp = (event: MouseEvent) => {
        if (!draggingTower || !dragStartInfo || !metrics || !onTowerHeightChangeFromGraph) {
            if (draggingTower && canvasElem) canvasElem.style.cursor = 'crosshair'; // Reset cursor if drag was aborted
            setDraggingTower(null);
            setDragStartInfo(null);
            setIsInteractingByDrag(false);
            return;
        }

        const clientYDelta = event.clientY - dragStartInfo.mouseClientY;
        const currentTowerAbsoluteLOSElevation = dragStartInfo.initialTowerHeightMeters + dragStartInfo.siteTerrainElevation;
        const currentHandlePixelYInChartArea = metrics.getPixelYFromElevation(currentTowerAbsoluteLOSElevation);
        const newHandlePixelYInChartArea = currentHandlePixelYInChartArea - clientYDelta;
        const newAbsLOSElevation = metrics.getElevationFromPixelY(newHandlePixelYInChartArea);
        let finalNewTowerHeight = newAbsLOSElevation - dragStartInfo.siteTerrainElevation;

        finalNewTowerHeight = Math.max(0, Math.min(100, parseFloat(finalNewTowerHeight.toFixed(1))));
        
        console.log('MouseUp: Calling onTowerHeightChangeFromGraph with', draggingTower, finalNewTowerHeight);
        onTowerHeightChangeFromGraph(draggingTower === 'A' ? 'pointA' : 'pointB', finalNewTowerHeight);
        
        setDraggingTower(null);
        setDragStartInfo(null);
        setIsInteractingByDrag(false); 
        if (canvasElem) canvasElem.style.cursor = 'crosshair';
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        if (canvasElem && canvasElem.style.cursor === 'grabbing') canvasElem.style.cursor = 'crosshair';
        // if (isInteractingByDrag) setIsInteractingByDrag(false); // Redundant, set in mouseup
    };
  }, [draggingTower, dragStartInfo, onTowerHeightChangeFromGraph, isInteractingByDrag]);


  if (isInteractingByDrag || isActionPending) { 
      return (
          <div className={cn("h-full flex items-center justify-center p-2 bg-slate-800/60 backdrop-blur-sm rounded-md relative z-10")}>
               <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <span className="ml-2 text-xs text-slate-300">
                {isInteractingByDrag ? 'Adjusting height...' : 'Analyzing...'}
                </span>
          </div>
      );
  }
  
  if (!data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null) {
    return (
        <div className={cn("h-full flex items-center justify-center p-2 bg-muted/30 rounded-md")}>
          <p className="text-muted-foreground text-xs text-center">
            Not enough data to display profile. Perform analysis.
          </p>
        </div>
    );
  }

  return (
    <div className={cn("w-full h-full relative")}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', cursor: draggingTower ? 'grabbing': 'crosshair' }} />
    </div>
  );
}
