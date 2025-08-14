
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Loader2, MapPin } from 'lucide-react';
import type { KmzPlacemark } from '@/lib/kmz-parser';
import type { BulkAnalysisResultItem } from '@/app/bulk-los-analyzer/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoogleMapsLoader, GoogleMapsScriptGuard } from '@/components/GoogleMapsLoaderProvider';

const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India center
const defaultZoom = 4;

interface BulkAnalysisMapProps {
  placemarks: KmzPlacemark[];
  results: BulkAnalysisResultItem[];
}

function BulkAnalysisMapInner({ placemarks, results }: BulkAnalysisMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<KmzPlacemark | null>(null);
  const { isLoaded: isMapApiLoaded } = useGoogleMapsLoader(); // Get loading state from context

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (window.google && window.google.maps) {
      map.setMapTypeId(google.maps.MapTypeId.HYBRID); 
      map.setOptions({
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative',
        clickableIcons: false,
      });
    }
  }, []);

  useEffect(() => {
    if (isMapApiLoaded && mapRef.current && placemarks.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      placemarks.forEach(p => bounds.extend(new window.google.maps.LatLng(p.lat, p.lng)));
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, 50); 
         const listener = window.google.maps.event.addListenerOnce(mapRef.current, 'idle', () => {
          if (mapRef.current?.getZoom() && mapRef.current.getZoom()! > 16) { 
            mapRef.current.setZoom(16);
          }
        });
        return () => {
           if (listener && window.google && window.google.maps) { 
              window.google.maps.event.removeListener(listener);
           }
         };
      }
    } else if (isMapApiLoaded && mapRef.current) {
        mapRef.current.setCenter(defaultCenter);
        mapRef.current.setZoom(defaultZoom);
    }
  }, [placemarks, isMapApiLoaded]);

  const feasibleLinks = results.filter(r => r.losPossible);

  if (placemarks.length === 0) {
     return (
        <Card className="h-full shadow-md">
         <CardHeader><CardTitle className="text-lg">Site Map</CardTitle></CardHeader>
         <CardContent className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MapPin className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-500" />
            <p>Upload a KMZ file to see sites on the map.</p>
         </CardContent>
        </Card>
     )
  }

  return (
    <Card className="h-full shadow-md flex flex-col">
      <CardHeader><CardTitle className="text-lg">Site Map</CardTitle></CardHeader>
      <CardContent className="flex-1 p-0">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={defaultCenter}
          zoom={defaultZoom}
          onLoad={handleMapLoad}
        >
          {placemarks.map(p => (
            <Marker 
              key={`${p.name}-${p.lat}-${p.lng}`} 
              position={{ lat: p.lat, lng: p.lng }} 
              title={p.name}
              onClick={() => setSelectedMarker(p)}
              icon={{
                  path: window.google?.maps?.SymbolPath?.CIRCLE,
                  fillColor: '#FFC107', // Amber
                  fillOpacity: 0.9,
                  strokeColor: '#000000',
                  strokeWeight: 0.5,
                  scale: 5,
              }}
            />
          ))}
          {feasibleLinks.map(link => (
            <Polyline
              key={link.id}
              path={[{ lat: link.pointA.lat, lng: link.pointA.lng }, { lat: link.pointB.lat, lng: link.pointB.lng }]}
              options={{
                strokeColor: 'hsl(var(--app-accent))', 
                strokeOpacity: 0.8,
                strokeWeight: 2.5,
                geodesic: true,
              }}
            />
          ))}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-1 text-sm bg-background text-foreground">
                <h4 className="font-semibold">{selectedMarker.name}</h4>
                <p>Lat: {selectedMarker.lat.toFixed(5)}</p>
                <p>Lng: {selectedMarker.lng.toFixed(5)}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </CardContent>
    </Card>
  );
};


const BulkAnalysisMap: React.FC<BulkAnalysisMapProps> = (props) => {
  return (
    <GoogleMapsScriptGuard 
      loadingMessage="Initializing Bulk Analysis Map..."
      errorMessage="Error loading Bulk Analysis Map."
    >
      <BulkAnalysisMapInner {...props} />
    </GoogleMapsScriptGuard>
  );
};

export default BulkAnalysisMap;
