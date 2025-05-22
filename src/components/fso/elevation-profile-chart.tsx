
"use client"

import type { LOSPoint } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Minus, Maximize } from 'lucide-react';
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

const chartConfig = {
  terrainElevation: {
    label: "Terrain (m)",
    color: "hsl(var(--chart-3))", 
  },
  losHeight: {
    label: "LOS Path (m)",
    color: "hsl(var(--chart-1))", 
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
        <CardContent className="h-[150px] flex items-center justify-center px-4 pb-2">
          <p className="text-muted-foreground text-sm">No data available for chart.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = profile.map(p => ({
    distance: p.distance, 
    terrainElevation: p.terrainElevation,
    losHeight: p.losHeight,
    clearance: p.clearance,
  }));
  
  const allElevations = profile.flatMap(p => [p.terrainElevation, p.losHeight]);
  const minY = Math.min(...allElevations) - 10; 
  const maxY = Math.max(...allElevations) + 20;

  const pointAData = chartData[0];
  const pointBData = chartData[chartData.length - 1];

  return (
    <Card className="shadow-xl w-full bg-card/80 backdrop-blur-sm border-border">
      <CardHeader className="py-2 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-base">
            <BarChart3 className="mr-2 h-5 w-5 text-primary" />
            Elevation Profile
          </CardTitle>
          {/* Placeholder for expand/collapse if needed later */}
        </div>
        {/* <CardDescription className="text-xs">Terrain vs. Line-of-Sight path with Earth curvature.</CardDescription> */}
      </CardHeader>
      <CardContent className="px-2 pt-2 pb-0"> 
        <ResponsiveContainer width="100%" height={150}> 
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -15, bottom: 0 }}> 
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3}/>
            <XAxis
              dataKey="distance"
              type="number"
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => `${value.toFixed(1)}km`}
              fontSize={10}
              axisLine={false}
              tickLine={false}
              padding={{ left: 10, right: 10 }} // Add padding to XAxis
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              domain={[minY, maxY]}
              tickFormatter={(value) => `${Math.round(value)}m`}
              fontSize={10}
              axisLine={false}
              tickLine={false}
              width={50} // Increased width for YAxis labels
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: "4px 8px",
                fontSize: "10px"
              }}
              labelStyle={{ color: "hsl(var(--foreground))", marginBottom: "2px" }}
              itemStyle={{padding: "0px"}}
              formatter={(value: number, name: string, props) => {
                 const item = props.payload as LOSPoint & { losHeight: number; terrainElevation: number };
                 if (name === 'terrainElevation') return [`${item.terrainElevation.toFixed(1)} m`, chartConfig.terrainElevation.label];
                 if (name === 'losHeight') return [`${item.losHeight.toFixed(1)} m (${item.clearance.toFixed(1)}m clear)`, chartConfig.losHeight.label];
                 return [`${value.toFixed(1)} m`, name];
              }}
              labelFormatter={(label) => `Dist: ${parseFloat(label as string).toFixed(1)} km`}
            />
            <Area
              type="monotone"
              dataKey="terrainElevation"
              stroke={chartConfig.terrainElevation.color}
              fill={chartConfig.terrainElevation.color}
              fillOpacity={0.3} // Ensure low opacity
              strokeWidth={1.5}
              name={chartConfig.terrainElevation.label}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="losHeight"
              stroke={chartConfig.losHeight.color}
              strokeWidth={2.5} // Increased strokeWidth for better visibility
              name={chartConfig.losHeight.label}
              dot={false}
              isAnimationActive={false}
            />
            {/* Reference Dots for Site A and B names */}
            {pointAData && (
              <ReferenceDot 
                x={pointAData.distance} 
                y={pointAData.losHeight} 
                r={4} 
                fill={chartConfig.losHeight.color} 
                stroke="hsl(var(--background))" 
                strokeWidth={1}
                isFront={true}
              >
                  <text x={pointAData.distance} y={pointAData.losHeight - 10} dy={-4} fontSize="10px" fill="hsl(var(--foreground))" textAnchor="middle">{pointAName}</text>
              </ReferenceDot>
            )}
            {pointBData && (
              <ReferenceDot 
                x={pointBData.distance} 
                y={pointBData.losHeight} 
                r={4} 
                fill={chartConfig.losHeight.color} 
                stroke="hsl(var(--background))"
                strokeWidth={1}
                isFront={true}
              >
                <text x={pointBData.distance} y={pointBData.losHeight - 10} dy={-4} fontSize="10px" fill="hsl(var(--foreground))" textAnchor="middle">{pointBName}</text>
              </ReferenceDot>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

