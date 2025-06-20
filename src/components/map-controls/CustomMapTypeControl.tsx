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
    <div className="flex bg-background/75 backdrop-blur-md shadow rounded-lg p-1 space-x-1"> {/* MODIFIED */}
      <Button
        variant="ghost" // Base variant is ghost, active state applies stronger styling
        size="sm"
        onClick={() => handleSetMapType(MAP_TYPE_IDS.ROADMAP)}
        className={cn(
          "h-8 text-xs px-3 rounded-md transition-colors duration-150", // Common styles including base rounding
          currentMapTypeId === MAP_TYPE_IDS.ROADMAP
            ? "bg-primary/90 hover:bg-primary text-primary-foreground"
            : "text-foreground hover:bg-muted/60"
        )}
        aria-label="Show Map View"
      >
        Map
      </Button>
      <Button
        variant="ghost" // Base variant is ghost
        size="sm"
        onClick={() => handleSetMapType(MAP_TYPE_IDS.SATELLITE)}
        className={cn(
          "h-8 text-xs px-3 rounded-md transition-colors duration-150", // Common styles including base rounding
          currentMapTypeId === MAP_TYPE_IDS.SATELLITE
            ? "bg-primary/90 hover:bg-primary text-primary-foreground"
            : "text-foreground hover:bg-muted/60"
        )}
        aria-label="Show Satellite View"
      >
        Satellite
      </Button>
    </div>
  );
};

export default CustomMapTypeControl;
