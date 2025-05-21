"use client"

import type { LOSPoint } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartConfig } from "@/components/ui/chart"; // Using existing chart config for consistency

interface ElevationProfileChartProps {
  profile: LOSPoint[];
}

const chartConfig = {
  terrainElevation: {
    label: "Terrain Elevation (m)",
    color: "hsl(var(--chart-1))", // Primary blue
  },
  losHeight: {
    label: "LOS Path (m)",
    color: "hsl(var(--chart-2))", // Accent green
  },
} satisfies ChartConfig;


export default function ElevationProfileChart({ profile }: ElevationProfileChartProps) {
  if (!profile || profile.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            Elevation Profile
          </CardTitle>
          <CardDescription>No data available to display chart.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p>Submit an analysis to view the elevation profile.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = profile.map(p => ({
    distance: p.distance, // km
    terrainElevation: p.terrainElevation, // meters
    losHeight: p.losHeight, // meters
    clearance: p.clearance, // meters
  }));
  
  // Determine Y-axis domain dynamically
  const allElevations = profile.flatMap(p => [p.terrainElevation, p.losHeight]);
  const minY = Math.min(...allElevations) - 20; // Add some padding
  const maxY = Math.max(...allElevations) + 20; // Add some padding

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          Elevation Profile
        </CardTitle>
        <CardDescription>Terrain vs. Line-of-Sight path with Earth curvature.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="distance"
              type="number"
              name="Distance"
              unit=" km"
              stroke="hsl(var(--foreground))"
              tickFormatter={(value) => `${value.toFixed(1)}`}
            />
            <YAxis
              name="Elevation"
              unit=" m"
              stroke="hsl(var(--foreground))"
              domain={[minY, maxY]}
              tickFormatter={(value) => `${Math.round(value)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number, name: string) => {
                const config = chartConfig[name as keyof typeof chartConfig];
                return [`${value.toFixed(2)} m`, config?.label || name];
              }}
            />
            <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
            <Line
              type="monotone"
              dataKey="terrainElevation"
              stroke={chartConfig.terrainElevation.color}
              strokeWidth={2}
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
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
