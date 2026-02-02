export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  itinerary?: ItineraryData;
  flights?: FlightSearchResult;
}

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

// Itinerary types
export interface ItineraryActivity {
  time: string;
  name: string;
  description: string;
  duration: string;
  location?: string;
  cost_estimate?: string;
  booking_required?: boolean;
}

export interface ItineraryAccommodation {
  name: string;
  area: string;
  style: string;
  price_range: string;
  notes?: string;
}

export interface ItineraryDay {
  day_number: number;
  date: string;
  title: string;
  location: string;
  activities: ItineraryActivity[];
  accommodation?: ItineraryAccommodation;
  notes?: string;
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

export interface ItineraryData {
  destination: string;
  start_date: string;
  end_date: string;
  num_travelers?: number;
  proposals: ItineraryProposal[];
}

// Flight types
export interface FlightLeg {
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  airline: string;
  flight_number: string;
  duration_minutes: number;
  operating_airline?: string;
}

export interface FlightSegment {
  segment_id: number;
  flights: FlightLeg[];
}

export interface FlightOption {
  id: string;
  total_price: number;
  currency: string;
  price_per_person: number;
  segments: FlightSegment[];
  is_virtual_interlining: boolean;
  warnings: string[];
  booking_url?: string;
}

export interface FlightSearchResult {
  search_id: string;
  searched_at: string;
  origin: string;
  destination: string;
  options: FlightOption[];
  cheapest_price: number | null;
  price_range: string | null;
}

export interface ChatStreamEvent {
  type: 'conversation_id' | 'text' | 'done' | 'tool_start' | 'itinerary' | 'flights' | 'flight_search_start' | 'tool_error';
  content?: string;
  conversation_id?: string;
  tool_name?: string;
  tool_id?: string;
  data?: ItineraryData | FlightSearchResult;
  query?: Record<string, unknown>;
  error?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}
