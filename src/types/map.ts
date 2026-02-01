/**
 * Map-related type definitions for itinerary visualization.
 */

/**
 * A destination point on the map with coordinates.
 */
export interface MapDestination {
  /** Unique identifier for this destination */
  id: string;
  /** Display name of the destination */
  name: string;
  /** Latitude coordinate */
  lat: number;
  /** Longitude coordinate */
  lng: number;
  /** Day number in the itinerary (1-indexed) */
  dayNumber: number;
  /** Optional description or notes about this stop */
  description?: string;
  /** Country where destination is located */
  country?: string;
  /** Region/province within the country */
  region?: string;
}

/**
 * Response from the geocoding API.
 */
export interface GeocodedLocation {
  /** Location name */
  name: string;
  /** Latitude coordinate */
  lat: number;
  /** Longitude coordinate */
  lng: number;
  /** Source of the coordinates */
  source: 'knowledge_base' | 'geocode_api';
  /** Country where location is */
  country?: string;
  /** Region/province */
  region?: string;
}

/**
 * Bounds for the map viewport.
 */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Props for the ItineraryMap component.
 */
export interface ItineraryMapProps {
  /** Array of destinations to display on the map */
  destinations: MapDestination[];
  /** Whether to draw route lines between destinations */
  showRoute?: boolean;
  /** Optional CSS class name */
  className?: string;
  /** Callback when a marker is clicked */
  onMarkerClick?: (destination: MapDestination) => void;
  /** Initial zoom level (default: auto-fit to bounds) */
  initialZoom?: number;
  /** Whether the map is interactive or display-only */
  interactive?: boolean;
}

/**
 * Props for the LocationMarker component.
 */
export interface LocationMarkerProps {
  /** The destination to display */
  destination: MapDestination;
  /** Whether this marker is currently selected */
  isSelected?: boolean;
  /** Callback when marker is clicked */
  onClick?: () => void;
}
