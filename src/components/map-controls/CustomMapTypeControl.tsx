"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CustomMapTypeControlProps {
  map: google.maps.Map | null;
  currentMapTypeId?: string; // e.g., 'roadmap', 'satellite'
}

const MAP_TYPE_IDS = {
  ROADMAP: 'roadmap',
  SATELLITE: 'satellite',
  // HYBRID: 'hybrid', // Could add more later
  // TERRAIN: 'terrain',
};

const CustomMapTypeControl: React.FC<CustomMapTypeControlProps> = ({ map, currentMapTypeId }) => {
  if (!map) {
    return null;
  }

  const handleSetMapType = (mapTypeId: google.maps.MapTypeId | string) => {
    map?.setMapTypeId(mapTypeId);
  };

  return (
    <div className="flex bg-background/70 backdrop-blur-sm shadow-md rounded-md p-0.5 space-x-0.5">
      <Button
        variant={currentMapTypeId === MAP_TYPE_IDS.ROADMAP ? "secondary" : "ghost"}
        size="sm" // Using sm for slightly more text space than icon
        onClick={() => handleSetMapType(MAP_TYPE_IDS.ROADMAP)}
        className={cn(
          "text-foreground hover:bg-background/80 h-7 text-xs px-2 sm:px-2.5", // Compact styling
          currentMapTypeId === MAP_TYPE_IDS.ROADMAP
            ? "bg-primary/80 hover:bg-primary/90 text-primary-foreground"
            : "hover:bg-muted/50"
        )}
        aria-label="Show Map View"
      >
        Map
      </Button>
      <Button
        variant={currentMapTypeId === MAP_TYPE_IDS.SATELLITE ? "secondary" : "ghost"}
        size="sm"
        onClick={() => handleSetMapType(MAP_TYPE_IDS.SATELLITE)}
        className={cn(
          "text-foreground hover:bg-background/80 h-7 text-xs px-2 sm:px-2.5", // Compact styling
          currentMapTypeId === MAP_TYPE_IDS.SATELLITE
            ? "bg-primary/80 hover:bg-primary/90 text-primary-foreground"
            : "hover:bg-muted/50"
        )}
        aria-label="Show Satellite View"
      >
        Satellite
      </Button>
    </div>
  );
};

export default CustomMapTypeControl;
