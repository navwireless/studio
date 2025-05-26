
"use client"

import type { LOSPoint } from '@/types';
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot
} from 'recharts';

interface ElevationProfileChartProps {
  data: LOSPoint[]; 
  pointAName?: string;
  pointBName?: string;
}

export default function ElevationProfileChart({ data, pointAName = "Site A", pointBName = "Site B" }: ElevationProfileChartProps) {
  if (!data || data.length === 0) {
    return (
        <div className="h-full flex items-center justify-center p-2 bg-muted/30 rounded-md">
          <p className="text-muted-foreground text-xs text-center">
            Elevation data not available.
          </p>
        </div>
    );
  }

  const chartData = data.map(p => ({
    distance: parseFloat((p.distance * 1000).toFixed(0)), 
    terrain: parseFloat(p.terrainElevation.toFixed(1)),
    losHeight: parseFloat(p.losHeight.toFixed(1)),
    clearance: parseFloat(p.clearance.toFixed(1)),
  }));
  
  const pointAData = chartData[0];
  const pointBData = chartData[chartData.length - 1];
  
  const yDomainMin = Math.min(...chartData.map(p => p.terrain), ...chartData.map(p => p.losHeight)) - 10;
  const yDomainMax = Math.max(...chartData.map(p => p.terrain), ...chartData.map(p => p.losHeight)) + 10;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}> {/* Adjusted margins slightly */}
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2}/>
        <XAxis
          dataKey="distance"
          type="number"
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          tickFormatter={(value) => value.toFixed(0)}
          unit="m"
          axisLine={false}
          tickLine={false}
          padding={{ left: 10, right: 10 }}
          interval="preserveStartEnd" 
        />
        <YAxis
          domain={[yDomainMin, yDomainMax]}
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          tickFormatter={(value) => `${Math.round(value)}`}
          unit="m"
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
          labelFormatter={(label) => `Dist: ${(Number(label) / 1000).toFixed(2)} km`}
           content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const pointData = payload[0].payload as typeof chartData[0];
              return (
                <div className="p-1.5 bg-popover border border-border rounded-md shadow-lg text-xs">
                  <p className="text-muted-foreground mb-0.5">Dist: {(pointData.distance / 1000).toFixed(2)} km</p>
                  <p style={{ color: 'rgba(99, 102, 241, 1)' }} className="font-medium">
                    Terrain: {pointData.terrain.toFixed(1)} m
                  </p>
                  <p style={{ color: '#22d3ee' }} className="font-semibold">
                    LOS Path: {pointData.losHeight.toFixed(1)} m
                  </p>
                   <p className="font-medium" style={{color: pointData.clearance >= 0 ? 'hsl(var(--los-success-text))' : 'hsl(var(--los-failure-text))'}}>
                    Clearance: {pointData.clearance.toFixed(1)} m
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
          fill="rgba(99, 102, 241, 0.35)"   // indigo-500 @ 35 %
          stroke="rgba(99, 102, 241, 0.6)" // indigo-500 @ 60%
          strokeWidth={1}
          name="Terrain"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="losHeight"
          stroke="#22d3ee"                  // cyan-400
          strokeWidth={2}
          name="LOS Path"
          dot={false} 
          activeDot={{ r: 5, strokeWidth: 1, fill: '#22d3ee', stroke: 'hsl(var(--background))' }}
        />
        {pointAData && (
          <ReferenceDot
            x={pointAData.distance}
            y={pointAData.losHeight} 
            r={4}
            fill={'#22d3ee'}
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
            fill={'#22d3ee'}
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
