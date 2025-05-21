"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export default function InteractiveMapPlaceholder() {
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
          priority
        />
         <p className="mt-2 text-sm text-muted-foreground">Interactive map will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
