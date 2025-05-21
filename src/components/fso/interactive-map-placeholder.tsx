"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import type { PointCoordinates } from '@/types';

interface InteractiveMapPlaceholderProps {
  pointA?: (PointCoordinates & { towerHeight?: number }) | null;
  pointB?: (PointCoordinates & { towerHeight?: number }) | null;
}

export default function InteractiveMapPlaceholder({ pointA, pointB }: InteractiveMapPlaceholderProps) {
  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-primary" />
          Site Map
        </CardTitle>
        <CardDescription>Visual representation of the two points and path.</CardDescription>
      </CardHeader>
      <CardContent className="aspect-[4/3] flex flex-col items-center justify-center bg-muted/20 rounded-b-md p-2">
        <Image
          src="https://placehold.co/800x600.png"
          alt="Map placeholder showing terrain and path between two points"
          width={800}
          height={600}
          className="object-cover w-full h-full rounded-md"
          data-ai-hint="map terrain"
        />
        {pointA && pointB ? (
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Showing placeholder for Point A (Lat: {pointA.lat.toFixed(4)}, Lng: {pointA.lng.toFixed(4)}) 
            and Point B (Lat: {pointB.lat.toFixed(4)}, Lng: {pointB.lng.toFixed(4)}).
            <br />
            Interactive map feature is pending.
          </p>
        ) : (
         <p className="mt-2 text-sm text-muted-foreground">Interactive map will be displayed here when analysis is run.</p>
        )}
      </CardContent>
    </Card>
  );
}

