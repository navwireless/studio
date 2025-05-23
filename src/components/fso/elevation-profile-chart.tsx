
"use client"

import type { LOSPoint } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Minus, Maximize, Info } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart, Area, ReferenceDot
} from 'recharts';
import type { ChartConfig } from "@/components/ui/chart";

interface ElevationProfileChartProps {
  profile: LOSPoint[];
  pointAName?: string;
  pointBName?: string;
}

// Updated chartConfig for better LOS line visibility
const chartConfig = {
  terrainElevation: {
    label: "Terrain (m)",
    color: "hsl(var(--muted))", // More subdued color for terrain fill
  },
  losHeight: {
    label: "LOS Path (m)",
    color: "hsl(var(--primary))", // Vibrant primary blue for LOS line
  },
} satisfies ChartConfig;


export default function ElevationProfileChart({ profile, pointAName = "Site A", pointBName = "Site B" }: ElevationProfileChartProps) {
  if (!profile || profile.length === 0) {
    return (
      <Card className="shadow-xl bg-card/80 backdrop-blur-sm border-border">
        <CardHeader className="py-2 px-4">
          <CardTitle className="flex items-center text-base">
            <BarChart3 className="mr-2 h-5 w-5 text-primary" />
            Elevation Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[160px] flex items-center justify-center px-4 pb-2"> {/* Increased height */}
          <p className="text-muted-foreground text-sm">No data available for chart.</p>
        </CardContent>
      </Card>
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
  const totalDistanceKm = pointBData.distance;
  const displayDistance = totalDistanceKm < 1 
    ? `${(totalDistanceKm * 1000).toFixed(1)} m` 
    : `${totalDistanceKm.toFixed(2)} km`;

  return (
    <Card className="shadow-xl w-full bg-card/80 backdrop-blur-sm border-border">
      <CardHeader className="py-2 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-base">
            <BarChart3 className="mr-2 h-5 w-5 text-primary" />
            Elevation Profile
          </CardTitle>
          <div className="text-xs text-muted-foreground text-right">
            <div>Aerial Distance</div>
            <div className="font-semibold text-foreground text-sm">{displayDistance}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-2 pb-0"> 
        <ResponsiveContainer width="100%" height={160}> {/* Increased height */}
          <AreaChart data={chartData} margin={{ top: 15, right: 20, left: -15, bottom: 0 }}> 
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3}/>
            <XAxis
              dataKey="distance"
              type="number"
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => `${value.toFixed(1)}km`}
              fontSize={10}
              axisLine={false}
              tickLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              domain={[minY, maxY]}
              tickFormatter={(value) => `${Math.round(value)}m`}
              fontSize={10}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: "8px 12px",
                fontSize: "11px",
                boxShadow: "0 4px 12px hsla(var(--shadow, 0 0% 0% / 0.2))"
              }}
              labelStyle={{ display: 'none' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as typeof chartData[0];
                  return (
                    <div className="p-1.5 bg-popover border border-border rounded-md shadow-lg">
                      <p className="text-xs text-muted-foreground mb-1">Dist: {data.distance.toFixed(1)} km</p>
                      {payload.map((entry) => {
                        let entryName = "";
                        let entryColor = entry.color;
                        // Determine entry name and color based on dataKey
                        if (entry.dataKey === 'terrainElevation') {
                           entryName = chartConfig.terrainElevation.label;
                           entryColor = chartConfig.terrainElevation.color; // This will be --muted for fill, stroke is separate
                        } else if (entry.dataKey === 'losHeight') {
                           entryName = chartConfig.losHeight.label;
                           entryColor = chartConfig.losHeight.color; // This will be --primary
                        }
                        
                        return (
                          <p key={entry.name} style={{ color: entryColor }} className="text-xs">
                            {entryName}: {entry.value?.toFixed(1)} m
                          </p>
                        );
                      })}
                       <p className="text-xs" style={{color: chartConfig.losHeight.color}}>
                        Clearance to LOS: {data.clearance.toFixed(1)} m
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Terrain profile drawn first (underneath) */}
            <Area
              type="monotone"
              dataKey="terrainElevation"
              stroke="hsl(var(--secondary))" // Stroke for the terrain area outline
              fill={chartConfig.terrainElevation.color} // Fill for terrain area (muted)
              fillOpacity={0.5} 
              strokeWidth={1}
              name={chartConfig.terrainElevation.label}
              dot={false}
            />
            {/* LOS Path Line - This is the line connecting tower tops */}
            <Line
              type="monotone"
              dataKey="losHeight"
              stroke={chartConfig.losHeight.color} // Primary blue
              strokeWidth={2.5} 
              name={chartConfig.losHeight.label}
              dot={false} 
            />
            {/* Custom markers for Site A and Site B */}
            {pointAData && (
              <ReferenceDot 
                x={pointAData.distance} 
                y={pointAData.losHeight} 
                r={5} 
                fill={chartConfig.losHeight.color} // Match LOS line color
                stroke="hsl(var(--background))" 
                strokeWidth={2}
                isFront={true}
              >
                  <text x={pointAData.distance} y={pointAData.losHeight - 12} dy={-4} fontSize="10px" fill="hsl(var(--foreground))" textAnchor="middle">{pointAName}</text>
              </ReferenceDot>
            )}
            {pointBData && (
              <ReferenceDot 
                x={pointBData.distance} 
                y={pointBData.losHeight} 
                r={5}
                fill={chartConfig.losHeight.color} // Match LOS line color
                stroke="hsl(var(--background))"
                strokeWidth={2}
                isFront={true}
              >
                <text x={pointBData.distance} y={pointBData.losHeight - 12} dy={-4} fontSize="10px" fill="hsl(var(--foreground))" textAnchor="middle">{pointBName}</text>
              </ReferenceDot>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
    
