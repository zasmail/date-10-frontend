'use client';

import { useState } from 'react';
import { Marker, Popup } from 'react-map-gl/mapbox';
import { MapPin } from 'lucide-react';
import { LocationMarkerProps } from '@/types/map';

/**
 * A map marker component that displays a destination with day number badge.
 * Includes a popup with location details when clicked.
 */
export function LocationMarker({
  destination,
  isSelected = false,
  onClick,
}: LocationMarkerProps) {
  const [showPopup, setShowPopup] = useState(false);

  const handleMarkerClick = () => {
    setShowPopup(!showPopup);
    onClick?.();
  };

  return (
    <>
      <Marker
        longitude={destination.lng}
        latitude={destination.lat}
        anchor="bottom"
        onClick={handleMarkerClick}
      >
        <div className="relative cursor-pointer group">
          {/* Day number badge */}
          <div
            className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {destination.dayNumber}
          </div>

          {/* Marker icon */}
          <div
            className={`transition-transform duration-200 group-hover:scale-110 ${
              isSelected ? 'scale-125' : ''
            }`}
          >
            <MapPin
              className={`w-8 h-8 ${
                isSelected
                  ? 'text-primary fill-primary/20'
                  : 'text-destructive fill-destructive/20'
              }`}
              strokeWidth={2}
            />
          </div>
        </div>
      </Marker>

      {/* Popup with destination details */}
      {showPopup && (
        <Popup
          longitude={destination.lng}
          latitude={destination.lat}
          anchor="bottom"
          offset={[0, -40]}
          onClose={() => setShowPopup(false)}
          closeButton={true}
          closeOnClick={false}
          className="map-popup"
        >
          <div className="p-2 min-w-[150px]">
            <div className="font-semibold text-sm text-foreground">
              Day {destination.dayNumber}: {destination.name}
            </div>
            {(destination.country || destination.region) && (
              <div className="text-xs text-muted-foreground mt-1">
                {[destination.region, destination.country]
                  .filter(Boolean)
                  .join(', ')}
              </div>
            )}
            {destination.description && (
              <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
                {destination.description}
              </div>
            )}
          </div>
        </Popup>
      )}
    </>
  );
}
