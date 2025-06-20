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
        className="bg-background/75 hover:bg-background/90 backdrop-blur-md text-foreground p-0 shadow rounded-lg w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-colors duration-150"
        aria-label="Zoom In"
      >
        <Plus className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomOut}
        className="bg-background/75 hover:bg-background/90 backdrop-blur-md text-foreground p-0 shadow rounded-lg w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-colors duration-150"
        aria-label="Zoom Out"
      >
        <Minus className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default CustomZoomControl;
