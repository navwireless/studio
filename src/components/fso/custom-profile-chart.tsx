
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

// Adjusted Padding for more chart space
const PADDING_BASE = { top: 30, right: 20, bottom: 30, left: 45 }; 
const TEXT_COLOR = 'hsl(210, 25%, 90%)'; 
const GRID_COLOR = 'hsla(217, 30%, 50%, 0.4)'; 

const TERRAIN_FILL_COLOR = 'hsla(217, 70%, 60%, 0.25)'; 
const TERRAIN_STROKE_COLOR = 'hsla(217, 70%, 60%, 0.5)'; 
const LOS_LINE_COLOR = 'hsl(180, 70%, 65%)'; // Bright Cyan
const OBSTRUCTION_DOT_COLOR = 'hsl(0, 80%, 60%)'; // Bright Red
const TOWER_LINE_COLOR = 'hsl(45, 90%, 60%)'; // Bright Yellow/Amber
const HOVER_GUIDE_LINE_COLOR = 'hsla(210, 25%, 80%, 0.5)';
const HOVER_DOT_COLOR = LOS_LINE_COLOR;

const TOOLTIP_BG_COLOR = 'hsla(222, 40%, 15%, 0.9)'; // Slightly lighter than default popover
const TOOLTIP_TEXT_COLOR = 'hsl(210, 40%, 95%)'; 
const TOOLTIP_BORDER_COLOR = 'hsl(217, 33%, 35%)'; 
const MIN_TOWER_HEIGHT = 0;
const MAX_TOWER_HEIGHT = 100;
const TOWER_HANDLE_RADIUS_VISUAL = 6;
const TOWER_HANDLE_CLICK_RADIUS = 10;
const HORIZONTAL_PADDING_PERCENTAGE = 0.05; // Profile uses 90% of width

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
  effectivePixelWidth: number; 
  xOffsetPx: number; 
  minYData: number;
  maxYData: number;
  maxXKm: number;
  getPixelXFromKm: (distanceKm: number) => number;
  getPixelYFromElevation: (elevation: number) => number;
  getElevationFromPixelY: (pixelY: number) => number;
  getKmFromPixelX: (pixelX: number) => number; 
}

interface LiveDragVisuals {
  site: 'A' | 'B';
  currentLosY_px_ChartArea: number; 
  currentHeightMeters: number; 
}


const CustomProfileChart = React.memo(function CustomProfileChart({
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
  const [dragStartInfo, setDragStartInfo] = useState<{
    clientY: number; 
    initialTowerHeightMeters: number; 
    siteTerrainElevation: number; 
    initialLosY_px_ChartArea: number; 
  } | null>(null);

  const [liveDragVisuals, setLiveDragVisuals] = useState<LiveDragVisuals | null>(null);
  const isInteractingByDrag = !!draggingTower;

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
    
    const xOffsetPx = chartWidth * HORIZONTAL_PADDING_PERCENTAGE;
    const effectiveChartWidthPx = chartWidth * (1 - 2 * HORIZONTAL_PADDING_PERCENTAGE);


    ctx.clearRect(0, 0, rect.width, rect.height);

    const originalTransform = ctx.getTransform();
    ctx.translate(PADDING.left, PADDING.top); 

    const elevations = data.flatMap(p => [p.terrainElevation, p.losHeight]);
    let minY = Math.min(...elevations);
    let maxY = Math.max(...elevations);
    const yDataRange = maxY - minY;
    minY -= yDataRange * 0.15; // Add some padding to Y-axis
    maxY += yDataRange * 0.15;
    if (maxY === minY) { maxY += 10; minY -= 10; } // Avoid division by zero if all elevations are same
    if (maxY < minY) [maxY, minY] = [minY, maxY]; // Ensure minY < maxY


    const maxXKmActual = totalDistanceKm;

    const getX = (distanceKm: number) => xOffsetPx + (distanceKm / maxXKmActual) * effectiveChartWidthPx;
    const getY = (elevation: number) => chartHeight - ((elevation - minY) / (maxY - minY)) * chartHeight;
    const getElevationFromY = (pixelY_ChartArea: number) => minY + ((chartHeight - pixelY_ChartArea) / chartHeight) * (maxY - minY);
    const getKmFromX = (pixelX_ChartArea_relative_to_padding_left: number) => { 
        const effectivePx = pixelX_ChartArea_relative_to_padding_left - xOffsetPx;
        if (effectiveChartWidthPx === 0) return 0; 
        return (effectivePx / effectiveChartWidthPx) * maxXKmActual;
    };
    
    chartMetricsRef.current = {
      padding: PADDING, canvasRect: rect, chartPixelWidth: chartWidth, chartPixelHeight: chartHeight,
      effectivePixelWidth: effectiveChartWidthPx, xOffsetPx: xOffsetPx,
      minYData: minY, maxYData: maxY, maxXKm: maxXKmActual,
      getPixelXFromKm: getX, getPixelYFromElevation: getY,
      getElevationFromPixelY: getElevationFromY, getKmFromPixelX: getKmFromX,
    };

    // Draw Grid & Axes
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    ctx.font = "9px Inter, sans-serif";
    ctx.fillStyle = TEXT_COLOR;
    const numYTicks = 5;
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (let i = 0; i <= numYTicks; i++) {
      const val = minY + (i / numYTicks) * (maxY - minY);
      const yPx = getY(val);
      ctx.beginPath(); ctx.moveTo(0, yPx); ctx.lineTo(chartWidth, yPx); ctx.stroke();
      ctx.fillText(val.toFixed(0) + "m", -8, yPx);
    }
    const numXTicks = Math.min(5, Math.max(1, Math.floor(maxXKmActual / (maxXKmActual > 5 ? 2 : 1))));
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let i = 0; i <= numXTicks; i++) {
      const distKm = (i / numXTicks) * maxXKmActual;
      const xPx = getX(distKm); 
      ctx.beginPath(); ctx.moveTo(xPx, 0); ctx.lineTo(xPx, chartHeight); ctx.stroke();
      ctx.fillText((distKm * 1000).toFixed(0) + "m", xPx, chartHeight + 8);
    }

    // Draw Terrain Area
    ctx.beginPath();
    ctx.moveTo(getX(data[0].distance), getY(data[0].terrainElevation));
    data.forEach(p => ctx.lineTo(getX(p.distance), getY(p.terrainElevation)));
    ctx.lineTo(getX(data[data.length - 1].distance), chartHeight); // Close area to bottom
    ctx.lineTo(getX(data[0].distance), chartHeight); // Close area to bottom
    ctx.closePath();
    ctx.fillStyle = TERRAIN_FILL_COLOR; ctx.fill();
    // Draw Terrain Stroke
    ctx.beginPath();
    ctx.moveTo(getX(data[0].distance), getY(data[0].terrainElevation));
    data.forEach(p => ctx.lineTo(getX(p.distance), getY(p.terrainElevation)));
    ctx.strokeStyle = TERRAIN_STROKE_COLOR; ctx.lineWidth = 1; ctx.stroke();


    // Determine LOS line Y positions, considering live drag
    let yLosA_px_ChartArea = getY(data[0].losHeight);
    let yLosB_px_ChartArea = getY(data[data.length - 1].losHeight);

    if (liveDragVisuals) {
      if (liveDragVisuals.site === 'A') {
        yLosA_px_ChartArea = liveDragVisuals.currentLosY_px_ChartArea;
      } else if (liveDragVisuals.site === 'B') {
        yLosB_px_ChartArea = liveDragVisuals.currentLosY_px_ChartArea;
      }
    }

    const xA_px_ChartArea = getX(data[0].distance);
    const xB_px_ChartArea = getX(data[data.length - 1].distance);

    // Draw LOS Line
    ctx.beginPath();
    ctx.moveTo(xA_px_ChartArea, yLosA_px_ChartArea);
    ctx.lineTo(xB_px_ChartArea, yLosB_px_ChartArea);
    ctx.strokeStyle = LOS_LINE_COLOR; ctx.lineWidth = 1.5; ctx.stroke();
    
    // Display Aerial Distance
    if (totalDistanceKm !== undefined) {
        const midXLos = (xA_px_ChartArea + xB_px_ChartArea) / 2;
        const midYLos = (yLosA_px_ChartArea + yLosB_px_ChartArea) / 2;
        ctx.fillStyle = TEXT_COLOR;
        ctx.font = "10px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        const distanceText = totalDistanceKm < 1 ? `${(totalDistanceKm * 1000).toFixed(0)}m` : `${totalDistanceKm.toFixed(1)}km`;
        ctx.fillText(`Aerial Dist: ${distanceText}`, midXLos, midYLos - 5);
    }


    // Draw Obstruction Dots
    // Ensure maxXKmActual and effectiveChartWidthPx are positive to avoid issues
    if (data.length > 1 && maxXKmActual > 0 && effectiveChartWidthPx > 0) {
        for (let px_on_effective_width = 0; px_on_effective_width <= effectiveChartWidthPx; px_on_effective_width++) {
            const currentX_on_chart_area = xOffsetPx + px_on_effective_width;
            
            // Calculate currentKm based on the pixel's position within the effective drawing width
            const currentKm = (px_on_effective_width / effectiveChartWidthPx) * maxXKmActual;

            // Calculate LOS Y position at currentX_on_chart_area
            const losSlope = (xB_px_ChartArea - xA_px_ChartArea) === 0 ? 0 : (yLosB_px_ChartArea - yLosA_px_ChartArea) / (xB_px_ChartArea - xA_px_ChartArea); 
            const los_y_at_currentX = yLosA_px_ChartArea + losSlope * (currentX_on_chart_area - xA_px_ChartArea);

            // Interpolate terrain elevation at currentKm
            let terrain_elevation_at_currentKm = data[0].terrainElevation; // Default to first point
            if (data.length > 1) {
                // Find segment for currentKm
                for (let j = 0; j < data.length - 1; j++) {
                    if (currentKm >= data[j].distance && currentKm <= data[j+1].distance) {
                        const d1 = data[j].distance;
                        const d2 = data[j+1].distance;
                        const e1 = data[j].terrainElevation;
                        const e2 = data[j+1].terrainElevation;
                        if (d2 - d1 === 0) { // Avoid division by zero if points are at same distance
                            terrain_elevation_at_currentKm = e1;
                        } else {
                            const t_interp = (currentKm - d1) / (d2 - d1);
                            terrain_elevation_at_currentKm = e1 + t_interp * (e2 - e1);
                        }
                        break; // Found the segment
                    } else if (currentKm > data[data.length-1].distance && j === data.length - 2) { // If beyond last segment but iterating
                        terrain_elevation_at_currentKm = data[data.length-1].terrainElevation;
                    }
                }
            } else { // Only one data point, terrain is flat at that elevation for the whole path
                 terrain_elevation_at_currentKm = data[0].terrainElevation;
            }
            const terrain_y_at_currentX = getY(terrain_elevation_at_currentKm);

            // Check for obstruction (LOS line Y is >= Terrain line Y, since Y increases downwards)
            // Add a small tolerance (e.g., 1 pixel) to catch near-touches
            if (los_y_at_currentX >= terrain_y_at_currentX -1) { 
                ctx.beginPath();
                ctx.arc(currentX_on_chart_area, los_y_at_currentX, 2.5, 0, 2 * Math.PI); // Draw dot on the LOS line
                ctx.fillStyle = OBSTRUCTION_DOT_COLOR;
                ctx.fill();
            }
        }
    }


    // Draw Towers & Handles
    const yTerrainA_px_ChartArea = getY(data[0].terrainElevation);
    ctx.strokeStyle = TOWER_LINE_COLOR; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(xA_px_ChartArea, yTerrainA_px_ChartArea); ctx.lineTo(xA_px_ChartArea, yLosA_px_ChartArea); ctx.stroke();
    ctx.beginPath(); ctx.arc(xA_px_ChartArea, yLosA_px_ChartArea, TOWER_HANDLE_RADIUS_VISUAL, 0, 2 * Math.PI);
    ctx.fillStyle = TOWER_LINE_COLOR; ctx.fill();
    ctx.strokeStyle = TOOLTIP_BG_COLOR; ctx.lineWidth = 1.5; ctx.stroke(); // Border for handle
    ctx.fillStyle = TEXT_COLOR; ctx.font = "bold 10px Inter, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    ctx.fillText(pointAName, xA_px_ChartArea, yLosA_px_ChartArea - (TOWER_HANDLE_RADIUS_VISUAL + 2));

    const yTerrainB_px_ChartArea = getY(data[data.length - 1].terrainElevation);
    ctx.strokeStyle = TOWER_LINE_COLOR; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(xB_px_ChartArea, yTerrainB_px_ChartArea); ctx.lineTo(xB_px_ChartArea, yLosB_px_ChartArea); ctx.stroke();
    ctx.beginPath(); ctx.arc(xB_px_ChartArea, yLosB_px_ChartArea, TOWER_HANDLE_RADIUS_VISUAL, 0, 2 * Math.PI);
    ctx.fillStyle = TOWER_LINE_COLOR; ctx.fill();
    ctx.strokeStyle = TOOLTIP_BG_COLOR; ctx.lineWidth = 1.5; ctx.stroke(); // Border for handle
    ctx.fillStyle = TEXT_COLOR;
    ctx.fillText(pointBName, xB_px_ChartArea, yLosB_px_ChartArea - (TOWER_HANDLE_RADIUS_VISUAL + 2));

    // Display live tower height during drag
    if (liveDragVisuals) {
      ctx.fillStyle = TOWER_LINE_COLOR;
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.textBaseline = "middle";
      const textXOffset = TOWER_HANDLE_RADIUS_VISUAL + 5;
      if (liveDragVisuals.site === 'A') {
        ctx.textAlign = xA_px_ChartArea < chartWidth / 2 ? "left" : "right";
        const textX = xA_px_ChartArea + (ctx.textAlign === "left" ? textXOffset : -textXOffset);
        ctx.fillText(`${liveDragVisuals.currentHeightMeters.toFixed(0)}m`, textX, yLosA_px_ChartArea);
      } else if (liveDragVisuals.site === 'B') {
        ctx.textAlign = xB_px_ChartArea < chartWidth / 2 ? "left" : "right";
        const textX = xB_px_ChartArea + (ctx.textAlign === "left" ? textXOffset : -textXOffset);
        ctx.fillText(`${liveDragVisuals.currentHeightMeters.toFixed(0)}m`, textX, yLosB_px_ChartArea);
      }
    }

    // Draw Hover Guides & Tooltip
    if (hoverData && !isInteractingByDrag) {
      const hxPx_Canvas = hoverData.xPx; 
      const hyPxLos_Canvas = hoverData.yPx; 
      const hxPx_ChartArea = hxPx_Canvas - PADDING.left;

      // Vertical hover line
      ctx.beginPath(); ctx.setLineDash([3, 3]); ctx.strokeStyle = HOVER_GUIDE_LINE_COLOR; ctx.lineWidth = 1;
      ctx.moveTo(hxPx_ChartArea, 0); ctx.lineTo(hxPx_ChartArea, chartHeight); ctx.stroke();
      ctx.setLineDash([]);
      
      // Dot on LOS line at hover point
      const hyPxLos_ChartArea = hyPxLos_Canvas - PADDING.top;
      ctx.beginPath(); ctx.arc(hxPx_ChartArea, hyPxLos_ChartArea, 4, 0, 2 * Math.PI);
      ctx.fillStyle = HOVER_DOT_COLOR; ctx.fill();
      ctx.strokeStyle = TOOLTIP_BG_COLOR; ctx.lineWidth = 1.5; ctx.stroke(); // Border for hover dot
    }

    // Restore transform before drawing tooltip (which uses canvas coordinates)
    ctx.setTransform(originalTransform); 

    // Draw Tooltip (uses original canvas coordinates with mousePosition)
    if (hoverData && mousePosition && !isInteractingByDrag) {
      const p = hoverData.point;
      const lines = [
        `Distance to Site: ${(p.distance * 1000).toFixed(0)} m`, 
        `Line of Sight (AGL): ${p.losHeight.toFixed(1)} m`,
        `Terrain (AMSL): ${p.terrainElevation.toFixed(1)} m`,
        `Fresnel Clearance: ${p.clearance.toFixed(1)} m`
      ];
      ctx.font = "10px Inter, sans-serif";
      const lineHeight = 14; const tooltipPadding = 6;
      const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
      const tooltipWidth = textWidth + 2 * tooltipPadding;
      const tooltipHeight = lines.length * lineHeight + 2 * tooltipPadding - (lineHeight - 10); // Adjust for line spacing
      const cornerRadius = 4;
      let tipX = mousePosition.x + 15; let tipY = mousePosition.y - tooltipHeight - 5;
      if (tipX + tooltipWidth > rect.width - PADDING.right / 2) tipX = mousePosition.x - tooltipWidth - 15;
      if (tipY < PADDING.top / 2) tipY = mousePosition.y + 15;
      if (tipY + tooltipHeight > rect.height - PADDING.bottom / 2) tipY = rect.height - PADDING.bottom / 2 - tooltipHeight;
      if (tipX < PADDING.left / 2) tipX = PADDING.left / 2;

      ctx.globalAlpha = 0.9; ctx.fillStyle = TOOLTIP_BG_COLOR; ctx.strokeStyle = TOOLTIP_BORDER_COLOR; ctx.lineWidth = 0.5;
      drawRoundedRect(ctx, tipX, tipY, tooltipWidth, tooltipHeight, cornerRadius);
      ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1.0;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      lines.forEach((line, i) => {
        ctx.fillStyle = line.startsWith("Line of Sight") ? LOS_LINE_COLOR : TOOLTIP_TEXT_COLOR;
        ctx.fillText(line, tipX + tooltipPadding, tipY + tooltipPadding + (i * lineHeight) + (lineHeight / 2));
      });
    }
  }, [data, totalDistanceKm, pointAName, pointBName, hoverData, mousePosition, isInteractingByDrag, liveDragVisuals]);

  // Effect for initial draw and resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse move for tooltips
    const handleMouseMoveForTooltip = (event: MouseEvent) => {
      if (isInteractingByDrag || !chartMetricsRef.current || !data || data.length < 2) {
        if (hoverData) setHoverData(null); // Clear hover data if dragging or no chart metrics
        return;
      }
      const { canvasRect, padding, getPixelXFromKm, getPixelYFromElevation, getKmFromPixelX, xOffsetPx, effectivePixelWidth } = chartMetricsRef.current;
      if (!canvasRect) return;

      const mouseCanvasX = event.clientX - canvasRect.left;
      const mouseCanvasY = event.clientY - canvasRect.top;
      setMousePosition({ x: mouseCanvasX, y: mouseCanvasY });

      const mouseXInChartArea = mouseCanvasX - padding.left;
      
      // Check if mouse is within the effective drawing area for X
      if (mouseXInChartArea >= xOffsetPx && mouseXInChartArea <= xOffsetPx + effectivePixelWidth) {
        const distanceKmHovered = getKmFromPixelX(mouseXInChartArea); 
        // Find the closest data point to the hovered distance for tooltip info
        let closestPoint = data[0];
        let minDiff = Math.abs(data[0].distance - distanceKmHovered);

        for (let i = 0; i < data.length; i++) {
            const diff = Math.abs(data[i].distance - distanceKmHovered);
            if (diff < minDiff) {
                minDiff = diff;
                closestPoint = data[i];
            }
        }
        if(closestPoint) { // Ensure closestPoint is not undefined
            setHoverData({
            xPx: getPixelXFromKm(closestPoint.distance) + padding.left, // X on canvas for hover dot
            yPx: getPixelYFromElevation(closestPoint.losHeight) + padding.top, // Y on canvas for hover dot
            point: { ...closestPoint, distanceMeters: closestPoint.distance * 1000 }
            });
        } else {
            setHoverData(null);
        }
      } else {
        setHoverData(null);
      }
    };
    const handleMouseOutForTooltip = () => { if (!isInteractingByDrag) { setHoverData(null); setMousePosition(null); }};

    canvas.addEventListener('mousemove', handleMouseMoveForTooltip);
    canvas.addEventListener('mouseout', handleMouseOutForTooltip);

    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(drawChart));
    resizeObserver.observe(canvas);
    drawChart(); // Initial draw

    return () => {
      resizeObserver.unobserve(canvas);
      canvas.removeEventListener('mousemove', handleMouseMoveForTooltip);
      canvas.removeEventListener('mouseout', handleMouseOutForTooltip);
    };
  }, [drawChart, data, isInteractingByDrag, hoverData]); // Ensure drawChart is stable or dependencies are correct

  // Effect for handling tower drag mouse down
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleCanvasMouseDown = (event: MouseEvent) => {
      if (!chartMetricsRef.current || !data || data.length < 2 || !onTowerHeightChangeFromGraph) return;
      const { canvasRect, padding, getPixelXFromKm, getPixelYFromElevation } = chartMetricsRef.current;
      if (!canvasRect) return;

      const clickX_Canvas = event.clientX - canvasRect.left;
      const clickY_Canvas = event.clientY - canvasRect.top;

      // Check Site A tower handle
      const towerAx_px_ChartArea = getPixelXFromKm(data[0].distance);
      const towerAy_px_ChartArea = getPixelYFromElevation(data[0].losHeight);
      const distA = Math.sqrt(Math.pow(clickX_Canvas - (towerAx_px_ChartArea + padding.left), 2) + Math.pow(clickY_Canvas - (towerAy_px_ChartArea + padding.top), 2));

      if (distA < TOWER_HANDLE_CLICK_RADIUS) {
        setDraggingTower('A');
        setDragStartInfo({
          clientY: event.clientY,
          initialTowerHeightMeters: data[0].losHeight - data[0].terrainElevation,
          siteTerrainElevation: data[0].terrainElevation,
          initialLosY_px_ChartArea: towerAy_px_ChartArea,
        });
        setLiveDragVisuals(null); // Reset live visuals at start of new drag
        if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
        event.preventDefault(); return;
      }

      // Check Site B tower handle
      const towerBx_px_ChartArea = getPixelXFromKm(data[data.length - 1].distance);
      const towerBy_px_ChartArea = getPixelYFromElevation(data[data.length - 1].losHeight);
      const distB = Math.sqrt(Math.pow(clickX_Canvas - (towerBx_px_ChartArea + padding.left), 2) + Math.pow(clickY_Canvas - (towerBy_px_ChartArea + padding.top), 2));

      if (distB < TOWER_HANDLE_CLICK_RADIUS) {
        setDraggingTower('B');
        setDragStartInfo({
          clientY: event.clientY,
          initialTowerHeightMeters: data[data.length - 1].losHeight - data[data.length - 1].terrainElevation,
          siteTerrainElevation: data[data.length - 1].terrainElevation,
          initialLosY_px_ChartArea: towerBy_px_ChartArea,
        });
        setLiveDragVisuals(null);
        if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
        event.preventDefault(); return;
      }
    };

    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    return () => canvas.removeEventListener('mousedown', handleCanvasMouseDown);
  }, [data, onTowerHeightChangeFromGraph]); // Re-bind if data changes to get new tower positions

  // Effect for handling global mouse move and mouse up during drag
  useEffect(() => {
    if (!draggingTower || !dragStartInfo || !chartMetricsRef.current) {
      // Reset cursor if it was set to grabbing and drag ended prematurely
      if (canvasRef.current && canvasRef.current.style.cursor === 'grabbing') canvasRef.current.style.cursor = 'crosshair';
      return;
    }
    const { getElevationFromPixelY, chartPixelHeight, getPixelYFromElevation: getPixelY } = chartMetricsRef.current;
    
    let animationFrameId: number;

    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (!draggingTower || !dragStartInfo || !chartMetricsRef.current) return;
      
      const clientYDelta = event.clientY - dragStartInfo.clientY;
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(() => {
        // New tower LOS Y position in chart area coordinates (Y=0 at top)
        let newTowerLosY_px_ChartArea = dragStartInfo.initialLosY_px_ChartArea - clientYDelta; 

        // Clamp Y within chart boundaries
        newTowerLosY_px_ChartArea = Math.max(0, Math.min(chartPixelHeight, newTowerLosY_px_ChartArea));
        
        // Convert pixel Y back to absolute elevation
        const newTowerAbsoluteElevation = getElevationFromPixelY(newTowerLosY_px_ChartArea);
        // Calculate height relative to terrain
        let currentHeightMeters = newTowerAbsoluteElevation - dragStartInfo.siteTerrainElevation;
        
        // Clamp and round height
        currentHeightMeters = Math.round(currentHeightMeters);
        currentHeightMeters = Math.max(MIN_TOWER_HEIGHT, Math.min(MAX_TOWER_HEIGHT, currentHeightMeters));

        // Recalculate LOS Y pixel from clamped height for visual consistency
        const clampedAbsoluteElevation = currentHeightMeters + dragStartInfo.siteTerrainElevation;
        newTowerLosY_px_ChartArea = getPixelY(clampedAbsoluteElevation);

        setLiveDragVisuals({
          site: draggingTower,
          currentLosY_px_ChartArea: newTowerLosY_px_ChartArea,
          currentHeightMeters: currentHeightMeters,
        });
      });
    };

    const handleGlobalMouseUp = (event: MouseEvent) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      
      if (!draggingTower || !dragStartInfo || !chartMetricsRef.current) { // Safety check
          setDraggingTower(null); setDragStartInfo(null); setLiveDragVisuals(null);
          if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
          return;
      }
      let finalNewTowerHeightRelativeToTerrain: number;
      if (liveDragVisuals) {
        finalNewTowerHeightRelativeToTerrain = liveDragVisuals.currentHeightMeters;
      } else { // Fallback if mouseup occurs before any mousemove triggered liveDragVisuals
        const clientYDelta = event.clientY - dragStartInfo.clientY;
        let newTowerLosY_px_ChartArea = dragStartInfo.initialLosY_px_ChartArea - clientYDelta; 
        newTowerLosY_px_ChartArea = Math.max(0, Math.min(chartMetricsRef.current.chartPixelHeight, newTowerLosY_px_ChartArea));
        const newTowerAbsoluteElevation = chartMetricsRef.current.getElevationFromPixelY(newTowerLosY_px_ChartArea);
        finalNewTowerHeightRelativeToTerrain = newTowerAbsoluteElevation - dragStartInfo.siteTerrainElevation;
        
        finalNewTowerHeightRelativeToTerrain = Math.round(finalNewTowerHeightRelativeToTerrain);
        finalNewTowerHeightRelativeToTerrain = Math.max(MIN_TOWER_HEIGHT, Math.min(MAX_TOWER_HEIGHT, finalNewTowerHeightRelativeToTerrain));
      }
      
      onTowerHeightChangeFromGraph(draggingTower === 'A' ? 'pointA' : 'pointB', finalNewTowerHeightRelativeToTerrain);
      
      setDraggingTower(null);
      setDragStartInfo(null);
      setLiveDragVisuals(null);
      if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    const canvas = canvasRef.current;
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      // Ensure cursor is reset if component unmounts during drag
      if (canvas && canvas.style.cursor === 'grabbing') {
        canvas.style.cursor = 'crosshair';
      }
    };
  }, [draggingTower, dragStartInfo, onTowerHeightChangeFromGraph, data, liveDragVisuals]); // Add liveDragVisuals to dependencies if its state is read inside

  // Re-draw chart when liveDragVisuals change
  useEffect(() => {
    drawChart(); 
  }, [liveDragVisuals, drawChart]);


  if (isActionPending && !isInteractingByDrag) { 
    return (
      <div className={cn("h-full flex items-center justify-center p-2 bg-muted/30 rounded-md pointer-events-none")}>
        <p className="text-muted-foreground text-xs text-center">Analyzing...</p>
      </div>
    );
  }

  if (!data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null) {
     if (isActionPending) { 
        return (
            <div className={cn("h-full flex items-center justify-center p-2 bg-muted/30 rounded-md")}>
                <p className="text-muted-foreground text-xs text-center">Loading analysis data...</p>
            </div>
        );
     }
    return (
      <div className={cn("h-full flex items-center justify-center p-2 bg-muted/30 rounded-md")}>
        <p className="text-muted-foreground text-xs text-center">Not enough data to display profile.</p>
      </div>
    );
  }

  return (
    <div className={cn(
        "w-full h-full relative", 
        isStale && !isInteractingByDrag && "opacity-50", 
        isActionPending && !isInteractingByDrag && "pointer-events-none" 
      )}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="img"
        aria-label="Profile Elevation Chart. Interactive. Use Shift + Up/Down arrows to adjust Site A tower height. Use Up/Down arrows to adjust Site B tower height."
        onKeyDown={(e) => {
          if (!data || data.length < 2 || !onTowerHeightChangeFromGraph) return;
          const siteA_Height = Math.round(data[0].losHeight - data[0].terrainElevation);
          const siteB_Height = Math.round(data[data.length - 1].losHeight - data[data.length - 1].terrainElevation);

          const step = 1;
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (e.shiftKey) {
              onTowerHeightChangeFromGraph('pointA', Math.min(MAX_TOWER_HEIGHT, siteA_Height + step));
            } else {
              onTowerHeightChangeFromGraph('pointB', Math.min(MAX_TOWER_HEIGHT, siteB_Height + step));
            }
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (e.shiftKey) {
              onTowerHeightChangeFromGraph('pointA', Math.max(MIN_TOWER_HEIGHT, siteA_Height - step));
            } else {
              onTowerHeightChangeFromGraph('pointB', Math.max(MIN_TOWER_HEIGHT, siteB_Height - step));
            }
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          cursor: isInteractingByDrag ? 'grabbing' : (hoverData ? 'pointer' : 'crosshair'),
          outline: 'none'
        }}
        className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md transition-shadow"
      />
    </div>
  );
});

export default CustomProfileChart;

