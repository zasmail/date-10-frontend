'use client';

import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl/mapbox';
import { ItineraryMapProps, MapDestination, MapBounds } from '@/types/map';
import { LocationMarker } from './LocationMarker';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/**
 * Calculate the bounding box that contains all destinations.
 */
function calculateBounds(destinations: MapDestination[]): MapBounds | null {
  if (destinations.length === 0) return null;

  let north = -Infinity;
  let south = Infinity;
  let east = -Infinity;
  let west = Infinity;

  for (const dest of destinations) {
    north = Math.max(north, dest.lat);
    south = Math.min(south, dest.lat);
    east = Math.max(east, dest.lng);
    west = Math.min(west, dest.lng);
  }

  return { north, south, east, west };
}

/**
 * Interactive map component that displays itinerary destinations and routes.
 */
export function ItineraryMap({
  destinations,
  showRoute = true,
  className = '',
  onMarkerClick,
  initialZoom,
  interactive = true,
}: ItineraryMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Sort destinations by day number for route drawing
  const sortedDestinations = useMemo(
    () => [...destinations].sort((a, b) => a.dayNumber - b.dayNumber),
    [destinations]
  );

  // Create GeoJSON line for the route
  const routeGeoJSON = useMemo(() => {
    if (!showRoute || sortedDestinations.length < 2) return null;

    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: sortedDestinations.map((d) => [d.lng, d.lat]),
      },
    };
  }, [sortedDestinations, showRoute]);

  // Fit map to bounds when destinations change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || destinations.length === 0) return;

    const bounds = calculateBounds(destinations);
    if (!bounds) return;

    // Add padding to the bounds
    const padding = { top: 50, bottom: 50, left: 50, right: 50 };

    // If only one destination, zoom to it directly
    if (destinations.length === 1) {
      mapRef.current.flyTo({
        center: [destinations[0].lng, destinations[0].lat],
        zoom: initialZoom ?? 10,
        duration: 1000,
      });
    } else {
      mapRef.current.fitBounds(
        [
          [bounds.west, bounds.south],
          [bounds.east, bounds.north],
        ],
        {
          padding,
          maxZoom: initialZoom ?? 12,
          duration: 1000,
        }
      );
    }
  }, [destinations, mapLoaded, initialZoom]);

  const handleMarkerClick = useCallback(
    (destination: MapDestination) => {
      setSelectedId((prev) =>
        prev === destination.id ? null : destination.id
      );
      onMarkerClick?.(destination);
    },
    [onMarkerClick]
  );

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  // Calculate initial center from destinations or default to world view
  const initialViewState = useMemo(() => {
    if (destinations.length === 0) {
      return { longitude: 0, latitude: 20, zoom: 2 };
    }

    const bounds = calculateBounds(destinations);
    if (!bounds) {
      return { longitude: 0, latitude: 20, zoom: 2 };
    }

    return {
      longitude: (bounds.east + bounds.west) / 2,
      latitude: (bounds.north + bounds.south) / 2,
      zoom: initialZoom ?? 4,
    };
  }, [destinations, initialZoom]);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ minHeight: '300px' }}
      >
        <div className="text-center text-muted-foreground p-4">
          <p className="font-medium">Map unavailable</p>
          <p className="text-sm mt-1">
            Set NEXT_PUBLIC_MAPBOX_TOKEN to enable maps
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%', minHeight: '300px' }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        onLoad={handleMapLoad}
        interactive={interactive}
        scrollZoom={interactive}
        dragPan={interactive}
        dragRotate={interactive}
        doubleClickZoom={interactive}
        touchZoomRotate={interactive}
      >
        {/* Route line between destinations */}
        {routeGeoJSON && mapLoaded && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': '#3b82f6',
                'line-width': 3,
                'line-opacity': 0.8,
                'line-dasharray': [2, 1],
              }}
            />
          </Source>
        )}

        {/* Destination markers */}
        {sortedDestinations.map((destination) => (
          <LocationMarker
            key={destination.id}
            destination={destination}
            isSelected={selectedId === destination.id}
            onClick={() => handleMarkerClick(destination)}
          />
        ))}
      </Map>

      {/* Legend */}
      {destinations.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-md px-3 py-2 text-xs shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-blue-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #3b82f6 0, #3b82f6 6px, transparent 6px, transparent 10px)' }} />
              <span className="text-muted-foreground">Travel route</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/20 border border-destructive" />
              <span className="text-muted-foreground">Destination</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
