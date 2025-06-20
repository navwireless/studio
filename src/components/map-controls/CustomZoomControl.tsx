"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface CustomZoomControlProps {
  map: google.maps.Map | null;
}

const CustomZoomControl: React.FC<CustomZoomControlProps> = ({ map }) => {
  if (!map) {
    return null; // Don't render if map instance isn't available
  }

  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom();
      if (currentZoom !== undefined) {
        map.setZoom(currentZoom + 1);
      }
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom();
      if (currentZoom !== undefined) {
        map.setZoom(currentZoom - 1);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      <Button
        variant="outline" // Using outline as a base for semi-transparent effect
        size="icon"
        onClick={handleZoomIn}
        className="bg-background/70 hover:bg-background/80 backdrop-blur-sm text-foreground p-2 shadow-md rounded-md w-8 h-8 sm:w-9 sm:h-9" // Custom small size
        aria-label="Zoom In"
      >
        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomOut}
        className="bg-background/70 hover:bg-background/80 backdrop-blur-sm text-foreground p-2 shadow-md rounded-md w-8 h-8 sm:w-9 sm:h-9" // Custom small size
        aria-label="Zoom Out"
      >
        <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </div>
  );
};

export default CustomZoomControl;
