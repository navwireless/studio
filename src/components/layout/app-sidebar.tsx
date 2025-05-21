
"use client";

import React from 'react';
import { MapPin, Waypoints, Laptop, Calculator, Settings, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

const sidebarItems = [
  { icon: MapPin, label: "Sites" },
  { icon: Waypoints, label: "Links" },
  { icon: Laptop, label: "Devices" },
  { icon: Calculator, label: "Coverage" },
];

const bottomSidebarItems = [
 { icon: Settings, label: "Settings" },
 { icon: HelpCircle, label: "Help" },
];

export default function AppSidebar() {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="bg-card text-card-foreground w-16 flex flex-col items-center py-4 space-y-3 border-r border-border shadow-md">
        <div className="flex-grow space-y-3">
          {sidebarItems.map((item, index) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "p-3 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors duration-150",
                    activeIndex === index ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
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
