
"use client";

import React from 'react';
import { MapPin, Waypoints, Laptop, Calculator, Settings, HelpCircle, Files, Crosshair } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

export type ActiveTool = 'singleLink' | 'bulkAnalysis' | 'sites' | 'links' | 'devices' | 'coverage';

interface AppSidebarProps {
  activeTool: ActiveTool;
  onToolChange: (tool: ActiveTool) => void;
}

const mainTools: { tool: ActiveTool; icon: React.ElementType; label: string }[] = [
  { tool: 'singleLink', icon: Crosshair, label: "Single Link Analysis" },
  { tool: 'bulkAnalysis', icon: Files, label: "Bulk Analysis" },
  { tool: 'sites', icon: MapPin, label: "Sites (Placeholder)" },
  { tool: 'links', icon: Waypoints, label: "Links (Placeholder)" },
  { tool: 'devices', icon: Laptop, label: "Devices (Placeholder)" },
  { tool: 'coverage', icon: Calculator, label: "Coverage (Placeholder)" },
];

const bottomSidebarItems = [
 { icon: Settings, label: "Settings" },
 { icon: HelpCircle, label: "Help" },
];

export default function AppSidebar({ activeTool, onToolChange }: AppSidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside className="bg-card text-card-foreground w-16 flex flex-col items-center py-4 space-y-3 border-r border-border shadow-md">
        <div className="flex-grow space-y-3">
          {mainTools.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onToolChange(item.tool)}
                  className={cn(
                    "p-3 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors duration-150",
                    activeTool === item.tool ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                  aria-label={item.label}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="sr-only">{item.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="space-y-3">
          {bottomSidebarItems.map((item) => (
             <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <button
                  className="p-3 rounded-lg text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors duration-150"
                  aria-label={item.label}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="sr-only">{item.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </aside>
    </TooltipProvider>
  );
}
