'use client';

import { useState } from 'react';
import { FlightSearchResult, FlightOption, FlightSegment, FlightLeg } from '@/types/chat';
import { Plane, Clock, AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlightsDetailCardProps {
  flights: FlightSearchResult;
  isBuilding?: boolean;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function FlightLegCard({ leg, isLast }: { leg: FlightLeg; isLast: boolean }) {
  return (
    <div className={cn('flex items-start gap-3 py-2', !isLast && 'border-b border-dashed border-slate-200')}>
      <div className="flex-shrink-0 mt-1">
        <Plane className="h-4 w-4 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800">
              {leg.departure_airport} → {leg.arrival_airport}
            </span>
            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {leg.airline} {leg.flight_number}
            </span>
          </div>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(leg.duration_minutes)}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
          <span>{formatTime(leg.departure_time)}</span>
          <span className="text-slate-400">→</span>
          <span>{formatTime(leg.arrival_time)}</span>
        </div>
        {leg.operating_airline && leg.operating_airline !== leg.airline && (
          <p className="text-xs text-slate-500 mt-1">
            Operated by {leg.operating_airline}
          </p>
        )}
      </div>
    </div>
  );
}

function FlightSegmentCard({ segment, label }: { segment: FlightSegment; label: string }) {
  const totalDuration = segment.flights.reduce((sum, leg) => sum + leg.duration_minutes, 0);
  const firstLeg = segment.flights[0];
  const lastLeg = segment.flights[segment.flights.length - 1];

  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase">{label}</span>
        <span className="text-xs text-slate-500">{formatDate(firstLeg.departure_time)}</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-800">
          {firstLeg.departure_airport} → {lastLeg.arrival_airport}
        </span>
        <span className="text-sm text-slate-600">
          {formatDuration(totalDuration)}
          {segment.flights.length > 1 && (
            <span className="text-xs text-slate-400 ml-1">
              ({segment.flights.length - 1} stop{segment.flights.length > 2 ? 's' : ''})
            </span>
          )}
        </span>
      </div>
      <div className="space-y-1">
        {segment.flights.map((leg, idx) => (
          <FlightLegCard
            key={`${leg.flight_number}-${idx}`}
            leg={leg}
            isLast={idx === segment.flights.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function FlightOptionCard({ option, rank }: { option: FlightOption; rank: number }) {
  const [isExpanded, setIsExpanded] = useState(rank === 1);

  return (
    <div className={cn(
      'border rounded-lg overflow-hidden transition-all',
      rank === 1 ? 'border-green-300 bg-green-50/30' : 'border-slate-200 bg-white'
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {rank === 1 && (
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                Best Price
              </span>
            )}
            <span className="text-lg font-bold text-slate-800">
              ${option.total_price.toFixed(0)}
            </span>
            <span className="text-sm text-slate-500">
              (${option.price_per_person.toFixed(0)}/person)
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>

        {option.is_virtual_interlining && (
          <div className="flex items-center gap-1.5 mt-2 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">Self-transfer required between airlines</span>
          </div>
        )}

        {option.warnings.length > 0 && (
          <div className="mt-2 space-y-1">
            {option.warnings.slice(0, 2).map((warning, idx) => (
              <p key={idx} className="text-xs text-amber-600">{warning}</p>
            ))}
          </div>
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100 space-y-3">
          {option.segments.map((segment, idx) => (
            <FlightSegmentCard
              key={segment.segment_id}
              segment={segment}
              label={idx === 0 ? 'Outbound' : idx === 1 ? 'Return' : `Flight ${idx + 1}`}
            />
          ))}

          {option.booking_url && (
            <a
              href={option.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Now
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function FlightsDetailCard({ flights, isBuilding }: FlightsDetailCardProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedOptions = showAll ? flights.options : flights.options.slice(0, 3);

  if (flights.options.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Plane className="h-5 w-5 text-slate-400" />
          <h3 className="font-semibold text-slate-800">Flights</h3>
        </div>
        <div className="bg-slate-100 rounded-lg p-4 text-center">
          <p className="text-slate-600">No flight options found for this route.</p>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your dates or destination.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-slate-800">Flights</h3>
          {isBuilding && (
            <span className="text-xs text-blue-600 animate-pulse">Searching...</span>
          )}
        </div>
        {flights.price_range && (
          <span className="text-sm text-slate-600">{flights.price_range}</span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
        <span className="font-medium">{flights.origin}</span>
        <span className="text-slate-400">→</span>
        <span className="font-medium">{flights.destination}</span>
      </div>

      <div className="space-y-3">
        {displayedOptions.map((option, idx) => (
          <FlightOptionCard key={option.id} option={option} rank={idx + 1} />
        ))}
      </div>

      {flights.options.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          {showAll ? 'Show less' : `Show ${flights.options.length - 3} more options`}
        </button>
      )}
    </div>
  );
}
