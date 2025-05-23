
"use client"

import type { LOSPoint } from '@/types';
// Card components are removed as this will be embedded.
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Line, ReferenceDot
} from 'recharts';
import type { ChartConfig } from "@/components/ui/chart"; // ChartConfig can still be useful

interface ElevationProfileChartProps {
  profile: LOSPoint[];
  pointAName?: string;
  pointBName?: string;
  // visible prop is removed as parent (BottomPanel) controls visibility and rendering
}

// Define colors based on CSS variables for theme consistency
const chartConfig = {
  terrainElevation: {
    label: "Terrain (m)",
    color: "hsl(var(--muted))", // A more subdued color for terrain area
    strokeColor: "hsl(var(--secondary))" // Slightly different stroke for area
  },
  losHeight: {
    label: "LOS Path (m)",
    color: "hsl(var(--primary))", // Primary theme color for LOS line
  },
} satisfies ChartConfig;


export default function ElevationProfileChart({ profile, pointAName = "Site A", pointBName = "Site B" }: ElevationProfileChartProps) {
  if (!profile || profile.length === 0) {
    return (
        <div className="h-full flex items-center justify-center p-2 bg-muted/30 rounded-md">
          <p className="text-muted-foreground text-xs text-center">
            Elevation data not available.
          </p>
        </div>
    );
  }

  const chartData = profile.map(p => ({
    distance: parseFloat(p.distance.toFixed(2)), // Keep 2 decimal places for distance on x-axis
    terrainElevation: parseFloat(p.terrainElevation.toFixed(1)),
    losHeight: parseFloat(p.losHeight.toFixed(1)),
    clearance: parseFloat(p.clearance.toFixed(1)),
  }));

  const allElevations = chartData.flatMap(p => [p.terrainElevation, p.losHeight]);
  const minY = Math.floor(Math.min(...allElevations) / 10) * 10 - 10; // Round down to nearest 10, subtract some padding
  const maxY = Math.ceil(Math.max(...allElevations) / 10) * 10 + 20; // Round up to nearest 10, add some padding


  const pointAData = chartData[0];
  const pointBData = chartData[chartData.length - 1];
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}> {/* Reduced margins further */}
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2}/>
        <XAxis
          dataKey="distance"
          type="number"
          stroke="hsl(var(--muted-foreground))"
          tickFormatter={(value, index) => {
            if (index === 0 || index === chartData.length - 1 || chartData.length <=5) { // Show first, last, and all if few points
                 return `${value.toFixed(1)}km`;
            }
            if (chartData.length > 5 && index % Math.floor(chartData.length / 3) === 0) { // Show 2-3 intermediate ticks
                return `${value.toFixed(1)}km`;
            }
            return '';
          }}
          fontSize={8} // Smaller font for x-axis
          axisLine={false}
          tickLine={false}
          padding={{ left: 10, right: 10 }}
          interval="preserveStartEnd" // Ensure first and last ticks are shown
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          domain={[minY, maxY]}
          tickFormatter={(value) => `${Math.round(value)}m`}
          fontSize={8} // Smaller font for y-axis
          axisLine={false}
          tickLine={false}
          width={35} 
        />
        <Tooltip
          cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: '3 3' }}
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
            padding: "4px 8px", 
            fontSize: "9px", 
            boxShadow: "0 1px 4px hsla(var(--shadow, 0 0% 0% / 0.1))"
          }}
          labelFormatter={(label) => `Dist: ${label.toFixed(1)} km`}
          formatter={(value: number, name: string, props: any) => {
            const originalName = props.payload.nameKey || name; // Reconstruct original name if available
            if (originalName === 'terrainElevation') return [`${value.toFixed(1)}m`, "Terrain"];
            if (originalName === 'losHeight') return [`${value.toFixed(1)}m`, "LOS Path"];
            if (originalName === 'clearance') return [`${value.toFixed(1)}m`, "Clearance"]; // if clearance is ever added
            return [value, name];
          }}
           content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as typeof chartData[0];
              return (
                <div className="p-1.5 bg-popover border border-border rounded-md shadow-lg text-xs">
                  <p className="text-muted-foreground mb-0.5">Dist: {data.distance.toFixed(1)} km</p>
                  <p style={{ color: chartConfig.terrainElevation.color }} className="font-medium">
                    Terrain: {data.terrainElevation.toFixed(1)} m
                  </p>
                  <p style={{ color: chartConfig.losHeight.color }} className="font-semibold">
                    LOS Path: {data.losHeight.toFixed(1)} m
                  </p>
                   <p className="font-medium" style={{color: data.clearance >= 0 ? 'hsl(var(--los-success-text))' : 'hsl(var(--los-failure-text))'}}>
                    Clearance: {data.clearance.toFixed(1)} m
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="terrainElevation"
          stroke={chartConfig.terrainElevation.strokeColor}
          fill={chartConfig.terrainElevation.color}
          fillOpacity={0.5} // Slightly more opaque fill
          strokeWidth={1} // Thinner stroke for area
          name={chartConfig.terrainElevation.label} // For default tooltip if custom one fails
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="losHeight"
          stroke={chartConfig.losHeight.color}
          strokeWidth={2.5} // Ensure LOS line is prominent
          name={chartConfig.losHeight.label} // For default tooltip
          dot={false}
          activeDot={{ r: 5, strokeWidth: 1, fill: chartConfig.losHeight.color, stroke: 'hsl(var(--background))' }}
        />
        {pointAData && (
          <ReferenceDot
            x={pointAData.distance}
            y={pointAData.losHeight} // Position dot on LOS path
            r={4}
            fill={chartConfig.losHeight.color}
            stroke="hsl(var(--background))"
            strokeWidth={1.5}
            isFront={true}
          >
              <text x={pointAData.distance} y={pointAData.losHeight - 10} dy={0} fontSize="9px" fill="hsl(var(--foreground))" textAnchor="middle">{pointAName}</text>
          </ReferenceDot>
        )}
        {pointBData && (
          <ReferenceDot
            x={pointBData.distance}
            y={pointBData.losHeight} // Position dot on LOS path
            r={4}
            fill={chartConfig.losHeight.color}
            stroke="hsl(var(--background))"
            strokeWidth={1.5}
            isFront={true}
          >
            <text x={pointBData.distance} y={pointBData.losHeight - 10} dy={0} fontSize="9px" fill="hsl(var(--foreground))" textAnchor="middle">{pointBName}</text>
          </ReferenceDot>
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

    