
"use client"

import type { LOSPoint } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from 'lucide-react'; // Changed icon
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import type { ChartConfig } from "@/components/ui/chart";

interface ElevationProfileChartProps {
  profile: LOSPoint[];
}

const chartConfig = {
  terrainElevation: {
    label: "Terrain (m)",
    color: "hsl(var(--chart-3))", // Using a muted color for terrain area
  },
  losHeight: {
    label: "LOS Path (m)",
    color: "hsl(var(--chart-1))", // Primary blue for LOS line
  },
} satisfies ChartConfig;


export default function ElevationProfileChart({ profile }: ElevationProfileChartProps) {
  if (!profile || profile.length === 0) {
    // This state is handled by page.tsx now, but keep a fallback
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

  return (
    <Card className="shadow-xl w-full bg-card/80 backdrop-blur-sm border-border">
      <CardHeader className="py-2 px-4">
        <CardTitle className="flex items-center text-base">
          <BarChart3 className="mr-2 h-5 w-5 text-primary" />
          Elevation Profile
        </CardTitle>
        {/* <CardDescription className="text-xs">Terrain vs. Line-of-Sight path with Earth curvature.</CardDescription> */}
      </CardHeader>
      <CardContent className="px-2 pt-2 pb-0"> {/* Adjusted padding */}
        <ResponsiveContainer width="100%" height={150}> {/* Reduced height for overlay */}
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}> {/* Adjusted margins */}
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3}/>
            <XAxis
              dataKey="distance"
              type="number"
              // name="Distance"
              // unit=" km"
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => `${value.toFixed(1)}km`}
              fontSize={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              // name="Elevation"
              // unit=" m"
              stroke="hsl(var(--muted-foreground))"
              domain={[minY, maxY]}
              tickFormatter={(value) => `${Math.round(value)}m`}
              fontSize={10}
              axisLine={false}
              tickLine={false}
              width={40}
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
                 const label = name === 'terrainElevation' ? chartConfig.terrainElevation.label : chartConfig.losHeight.label;
                 return [`${value.toFixed(1)} m`, label];
              }}
              labelFormatter={(label) => `Dist: ${label.toFixed(1)} km`}
            />
            {/* <Legend wrapperStyle={{ color: "hsl(var(--foreground))", fontSize: "10px" }} verticalAlign="top" height={25} /> */}
            <Area
              type="monotone"
              dataKey="terrainElevation"
              stroke={chartConfig.terrainElevation.color}
              fill={chartConfig.terrainElevation.color}
              fillOpacity={0.3}
              strokeWidth={1.5}
              name={chartConfig.terrainElevation.label}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="losHeight"
              stroke={chartConfig.losHeight.color}
              strokeWidth={2}
              name={chartConfig.losHeight.label}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
