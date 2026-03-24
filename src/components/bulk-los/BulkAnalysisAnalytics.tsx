
"use client";

import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChartIcon, AlertTriangle } from 'lucide-react';
import type { BulkAnalysisResultItem } from '@/types';

interface BulkAnalysisAnalyticsProps {
  results: BulkAnalysisResultItem[];
}

const COLORS = {
  feasible: 'hsl(var(--app-accent))', // Green from globals.css
  blocked: 'hsl(var(--destructive))', // Red from globals.css
  error: 'hsl(var(--muted-foreground))', // Muted color for errors
};

const RADIAN = Math.PI / 180;
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't render label if too small

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px" fontWeight="bold">
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};


const BulkAnalysisAnalytics: React.FC<BulkAnalysisAnalyticsProps> = React.memo(function BulkAnalysisAnalytics({ results }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures charts only render on client after mount
  }, []);

  if (!isClient) {
    return (
      <Card className="shadow-md h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChartIcon className="mr-2 h-5 w-5 text-primary" />
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (results.length === 0) {
    return (
      <Card className="shadow-md h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChartIcon className="mr-2 h-5 w-5 text-primary" />
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
          <p className="text-muted-foreground text-sm">No analysis results yet.</p>
          <p className="text-xs text-muted-foreground">Run an analysis to see the summary.</p>
        </CardContent>
      </Card>
    );
  }

  const feasibleCount = results.filter(r => r.losPossible && !r.remarks.toLowerCase().includes('error')).length;
  const blockedCount = results.filter(r => !r.losPossible && !r.remarks.toLowerCase().includes('error')).length;
  const errorCount = results.filter(r => r.remarks.toLowerCase().includes('error')).length;
  const totalAnalyzed = feasibleCount + blockedCount + errorCount;


  const pieData = [
    { name: 'Feasible', value: feasibleCount, color: COLORS.feasible },
    { name: 'Blocked', value: blockedCount, color: COLORS.blocked },
  ];
  if (errorCount > 0) {
    pieData.push({ name: 'Errors', value: errorCount, color: COLORS.error });
  }


  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <BarChartIcon className="mr-2 h-5 w-5 text-primary" />
          Analysis Summary
        </CardTitle>
        <CardDescription>{totalAnalyzed} pairs analyzed.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 h-full w-full">
        {totalAnalyzed > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={Math.min(100, (typeof window !== "undefined" ? window.innerWidth : 300) / 4)} // Responsive radius
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
              {/* eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */}
                {pieData.map((entry, _index) => (
                  <Cell key={`cell-${_index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    fontSize: "12px",
                }}
                formatter={(value, name) => [`${value} (${((Number(value) / totalAnalyzed) * 100).toFixed(1)}%)`, name]}
              />
              <Legend 
                iconSize={10} 
                wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <AlertTriangle className="w-10 h-10 mb-2 text-amber-500" />
                <p>No data to display in chart.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
});

const MemoizedBulkAnalysisAnalytics = React.memo(BulkAnalysisAnalytics);
MemoizedBulkAnalysisAnalytics.displayName = "BulkAnalysisAnalytics";
export default MemoizedBulkAnalysisAnalytics;

    