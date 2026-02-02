/**
 * TypeScript types for itinerary data structures.
 * Mirrors backend Pydantic schemas for type safety.
 */

export interface Activity {
  time: string;
  name: string;
  description: string;
  duration: string;
  location?: string;
  cost_estimate?: string;
  booking_required: boolean;
}

export interface Accommodation {
  name: string;
  area: string;
  style: string;
  price_range: string;
  notes: string;
}

export interface ItineraryDay {
  day_number: number;
  date: string;
  title: string;
  location: string;
  activities: Activity[];
  accommodation?: Accommodation;
  notes: string;
}

export interface ItineraryProposal {
  id: string;
  title: string;
  summary: string;
  days: ItineraryDay[];
  total_budget_estimate: string;
  highlights: string[];
  caveats: string[];
}

export interface Itinerary {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  num_travelers: number;
  proposals: ItineraryProposal[];
  selected_proposal_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SharedItinerary {
  destination: string;
  start_date: string;
  end_date: string;
  num_travelers: number;
  title?: string;
  proposals: ItineraryProposal[];
  view_count: number;
}

export interface ShareLinkResponse {
  token: string;
  share_url: string;
  title?: string;
  created_at: string;
}
