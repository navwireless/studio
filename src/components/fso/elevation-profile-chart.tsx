
"use client"

import type { LOSPoint } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from 'lucide-react'; // Removed Minus, Maximize as they are not used
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart, Area, ReferenceDot
} from 'recharts';
import type { ChartConfig } from "@/components/ui/chart";

interface ElevationProfileChartProps {
  profile: LOSPoint[];
  pointAName?: string;
  pointBName?: string;
  // visible prop is removed as parent (BottomPanel) controls visibility and rendering
}

const chartConfig = {
  terrainElevation: {
    label: "Terrain (m)",
    color: "hsl(var(--muted))",
  },
  losHeight: {
    label: "LOS Path (m)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export default function ElevationProfileChart({ profile, pointAName = "Site A", pointBName = "Site B" }: ElevationProfileChartProps) {
  // Parent component (BottomPanel) will handle not rendering this if profile is empty or not available.
  if (!profile || profile.length === 0) {
    return (
        <div className="h-full flex items-center justify-center p-4 bg-muted/30 rounded-md">
          <p className="text-muted-foreground text-xs text-center">
            Elevation data not available or analysis not yet performed.
          </p>
        </div>
    );
  }

  const chartData = profile.map(p => ({
    distance: p.distance,
    terrainElevation: parseFloat(p.terrainElevation.toFixed(1)),
    losHeight: parseFloat(p.losHeight.toFixed(1)),
    clearance: parseFloat(p.clearance.toFixed(1)),
  }));

  const allElevations = profile.flatMap(p => [p.terrainElevation, p.losHeight]);
  const minY = Math.min(...allElevations) - 10;
  const maxY = Math.max(...allElevations) + 20;

  const pointAData = chartData[0];
  const pointBData = chartData[chartData.length - 1];
  
  // Removed totalDistanceKm and displayDistance as they are now shown in BottomPanel's OverallResultsDisplay

  // The outer Card and CardHeader are removed, as this chart is now part of BottomPanel's structure.
  // The parent div in BottomPanel will provide background and padding if needed.
  return (
    <ResponsiveContainer width="100%" height="100%"> {/* Ensure it fills parent in BottomPanel */}
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3}/>
        <XAxis
          dataKey="distance"
          type="number"
          stroke="hsl(var(--muted-foreground))"
          tickFormatter={(value, index) => {
            // Show first, last, and a few intermediate ticks to prevent clutter
            if (index === 0 || index === chartData.length -1 || index % Math.floor(chartData.length / 4) === 0){
                 return `${value.toFixed(1)}km`;
            }
            return '';
          }}
          fontSize={9}
          axisLine={false}
          tickLine={false}
          padding={{ left: 5, right: 5 }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          domain={[minY, maxY]}
          tickFormatter={(value) => `${Math.round(value)}m`}
          fontSize={9}
          axisLine={false}
          tickLine={false}
          width={40} // Reduced width for Y-axis
        />
        <Tooltip
          cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: '3 3' }}
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
            padding: "6px 10px", // Smaller padding
            fontSize: "10px", // Smaller font
            boxShadow: "0 2px 8px hsla(var(--shadow, 0 0% 0% / 0.15))"
          }}
          labelStyle={{ display: 'none' }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as typeof chartData[0];
              return (
                <div className="p-1 bg-popover border border-border rounded-md shadow-lg">
                  <p className="text-xs text-muted-foreground mb-0.5">Dist: {data.distance.toFixed(1)} km</p>
                  <p style={{ color: chartConfig.terrainElevation.color }} className="text-xs">
                    Terrain: {data.terrainElevation.toFixed(1)} m
                  </p>
                  <p style={{ color: chartConfig.losHeight.color }} className="text-xs font-semibold">
                    LOS Path: {data.losHeight.toFixed(1)} m
                  </p>
                   <p className="text-xs" style={{color: data.clearance >= 0 ? 'hsl(var(--los-success-text))' : 'hsl(var(--los-failure-text))'}}>
                    Clearance: {data.clearance.toFixed(1)} m
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        {/* Render Area for terrain first */}
        <Area
          type="monotone"
          dataKey="terrainElevation"
          stroke={chartConfig.terrainElevation.color} // Use a subtle stroke for the area's top line
          fill={chartConfig.terrainElevation.color} // Fill color for terrain
          fillOpacity={0.4}
          strokeWidth={1.5}
          name={chartConfig.terrainElevation.label}
          dot={false}
        />
        {/* Render Line for LOS path on top */}
        <Line
          type="monotone"
          dataKey="losHeight"
          stroke={chartConfig.losHeight.color} // Primary color for LOS line
          strokeWidth={2.5} // Ensure it's clearly visible
          name={chartConfig.losHeight.label}
          dot={false}
          // activeDot={{ r: 4, fill: chartConfig.losHeight.color, stroke: 'hsl(var(--background))', strokeWidth: 1 }}
        />
        {pointAData && (
          <ReferenceDot
            x={pointAData.distance}
            y={pointAData.losHeight}
            r={4} // Slightly smaller dot
            fill={chartConfig.losHeight.color}
            stroke="hsl(var(--background))"
            strokeWidth={1.5}
            isFront={true}
          >
              <text x={pointAData.distance} y={pointAData.losHeight - 8} dy={-3} fontSize="9px" fill="hsl(var(--foreground))" textAnchor="middle">{pointAName}</text>
          </ReferenceDot>
        )}
        {pointBData && (
          <ReferenceDot
            x={pointBData.distance}
            y={pointBData.losHeight}
            r={4} // Slightly smaller dot
            fill={chartConfig.losHeight.color}
            stroke="hsl(var(--background))"
            strokeWidth={1.5}
            isFront={true}
          >
            <text x={pointBData.distance} y={pointBData.losHeight - 8} dy={-3} fontSize="9px" fill="hsl(var(--foreground))" textAnchor="middle">{pointBName}</text>
          </ReferenceDot>
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
