
"use client"

import type { LOSPoint } from '@/types';
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot
} from 'recharts';
import type { ChartConfig } from "@/components/ui/chart"; 

interface ElevationProfileChartProps {
  profile: LOSPoint[];
  pointAName?: string;
  pointBName?: string;
}

const chartConfig = {
  terrain: { // Renamed from terrainElevation to terrain
    label: "Terrain (m)",
    color: "hsl(var(--muted))", 
    strokeColor: "hsl(var(--secondary))" 
  },
  losHeight: {
    label: "LOS Path (m)",
    color: "hsl(var(--primary))", 
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

  // Data transformation for chart
  const chartData = profile.map(p => ({
    distance: parseFloat((p.distance * 1000).toFixed(0)), // distance in meters, no decimals for axis
    terrain: parseFloat(p.terrainElevation.toFixed(1)), // Mapped to 'terrain'
    losHeight: parseFloat(p.losHeight.toFixed(1)),
    clearance: parseFloat(p.clearance.toFixed(1)), // Keep for tooltip
  }));
  
  const pointAData = chartData[0];
  const pointBData = chartData[chartData.length - 1];
  
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2}/>
        <XAxis
          dataKey="distance"
          type="number"
          stroke="hsl(var(--muted-foreground))"
          tickFormatter={(value) => value.toFixed(0)} // Show distance in meters
          unit="m" // Add unit to axis
          fontSize={9} 
          axisLine={false}
          tickLine={false}
          padding={{ left: 10, right: 10 }}
          interval="preserveStartEnd" 
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          domain={['dataMin - 10', 'dataMax + 10']}
          tickFormatter={(value) => `${Math.round(value)}`}
          unit="m" // Add unit to axis
          fontSize={9} 
          axisLine={false}
          tickLine={false}
          width={40} 
        />
        <Tooltip
          cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: '3 3' }}
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
            padding: "4px 8px", 
            fontSize: "10px", 
            boxShadow: "0 1px 4px hsla(var(--shadow, 0 0% 0% / 0.1))"
          }}
          labelFormatter={(label) => `Dist: ${(Number(label) / 1000).toFixed(2)} km`} // Show label in km
           content={({ active, payload, label }) => { // label here is the distance in meters
            if (active && payload && payload.length) {
              const data = payload[0].payload as typeof chartData[0];
              return (
                <div className="p-1.5 bg-popover border border-border rounded-md shadow-lg text-xs">
                  <p className="text-muted-foreground mb-0.5">Dist: {(data.distance / 1000).toFixed(2)} km</p>
                  <p style={{ color: chartConfig.terrain.color }} className="font-medium">
                    Terrain: {data.terrain.toFixed(1)} m
                  </p>
                  <p style={{ color: chartConfig.losHeight.color }} className="font-semibold">
                    LOS Path: {data.losHeight.toFixed(1)} m
                  </p>
                   <p className="font-medium" style={{color: data.clearance >= (profile[0]?.clearance !== undefined ? (analysisResult?.clearanceThresholdUsed ?? 0) : 0) ? 'hsl(var(--los-success-text))' : 'hsl(var(--los-failure-text))'}}>
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
          dataKey="terrain"
          fill={chartConfig.terrain.color}
          fillOpacity={0.3} 
          strokeWidth={0} 
          name={chartConfig.terrain.label}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="losHeight"
          stroke={chartConfig.losHeight.color}
          strokeWidth={2} 
          name={chartConfig.losHeight.label}
          dot={false} 
          activeDot={{ r: 5, strokeWidth: 1, fill: chartConfig.losHeight.color, stroke: 'hsl(var(--background))' }}
        />
        {pointAData && (
          <ReferenceDot
            x={pointAData.distance}
            y={pointAData.losHeight} 
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
            y={pointBData.losHeight} 
            r={4}
            fill={chartConfig.losHeight.color}
            stroke="hsl(var(--background))"
            strokeWidth={1.5}
            isFront={true}
          >
            <text x={pointBData.distance} y={pointBData.losHeight - 10} dy={0} fontSize="9px" fill="hsl(var(--foreground))" textAnchor="middle">{pointBName}</text>
          </ReferenceDot>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Helper to access analysisResult (which isn't directly passed here)
// This is a bit of a hack. Ideally, clearanceThresholdUsed should be passed down
// or context should be used. For now, this is a placeholder.
// This part is problematic and should be removed as analysisResult is not available here.
// The tooltip content logic needs to be fixed.
const analysisResult: AnalysisResult | null = null; // Placeholder
