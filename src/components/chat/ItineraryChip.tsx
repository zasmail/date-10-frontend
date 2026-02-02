'use client';

import { ItineraryData, FlightSearchResult } from '@/types/chat';
import { useItineraryPanel } from '@/contexts/ItineraryPanelContext';
import { MapPin, Plane, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItineraryChipProps {
  messageId: string;
  itinerary?: ItineraryData;
  flights?: FlightSearchResult;
}

export function ItineraryChip({ messageId, itinerary, flights }: ItineraryChipProps) {
  const { selectByMessageId, getItemByMessageId, state } = useItineraryPanel();
  const item = getItemByMessageId(messageId);
  const isSelected = item?.id === state.selectedId;
  const isBuilding = item?.status === 'building';

  const handleClick = () => {
    selectByMessageId(messageId);
  };

  // Determine what to show
  const hasItinerary = !!itinerary;
  const hasFlights = !!flights;

  if (!hasItinerary && !hasFlights) {
    return null;
  }

  // Itinerary chip
  if (hasItinerary) {
    const proposalCount = itinerary.proposals.length;
    const dayCount = itinerary.proposals[0]?.days.length || 0;

    return (
      <button
        onClick={handleClick}
        className={cn(
          'mt-3 w-full text-left rounded-lg border p-3 transition-all hover:shadow-md',
          isSelected
            ? 'border-blue-400 bg-blue-50/50 ring-1 ring-blue-200'
            : 'border-slate-200 bg-white hover:border-blue-200',
          isBuilding && 'animate-pulse'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isBuilding ? (
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            ) : (
              <MapPin className="h-5 w-5 text-blue-500" />
            )}
            <div>
              <h4 className="font-semibold text-slate-800">{itinerary.destination}</h4>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {itinerary.start_date} - {itinerary.end_date}
                </span>
                {dayCount > 0 && (
                  <>
                    <span>•</span>
                    <span>{dayCount} days</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {proposalCount > 1 && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {proposalCount} options
              </span>
            )}
            <ChevronRight className={cn(
              'h-5 w-5 text-slate-400 transition-transform',
              isSelected && 'text-blue-500'
            )} />
          </div>
        </div>

        {/* Show first proposal summary */}
        {itinerary.proposals[0] && (
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">
            {itinerary.proposals[0].summary}
          </p>
        )}

        {isBuilding && (
          <p className="mt-2 text-xs text-blue-600">Creating your itinerary...</p>
        )}

        {isSelected && !isBuilding && (
          <p className="mt-2 text-xs text-blue-600">View details in the panel →</p>
        )}
      </button>
    );
  }

  // Flights-only chip
  return (
    <button
      onClick={handleClick}
      className={cn(
        'mt-3 w-full text-left rounded-lg border p-3 transition-all hover:shadow-md',
        isSelected
          ? 'border-blue-400 bg-blue-50/50 ring-1 ring-blue-200'
          : 'border-slate-200 bg-white hover:border-blue-200',
        isBuilding && 'animate-pulse'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isBuilding ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          ) : (
            <Plane className="h-5 w-5 text-blue-500" />
          )}
          <div>
            <h4 className="font-semibold text-slate-800">
              {flights!.origin} → {flights!.destination}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {flights!.options.length > 0 ? (
                <span>{flights!.options.length} flight options</span>
              ) : (
                <span>No flights found</span>
              )}
              {flights!.price_range && (
                <>
                  <span>•</span>
                  <span className="text-green-600 font-medium">{flights!.price_range}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <ChevronRight className={cn(
          'h-5 w-5 text-slate-400 transition-transform',
          isSelected && 'text-blue-500'
        )} />
      </div>

      {isBuilding && (
        <p className="mt-2 text-xs text-blue-600">Searching for flights...</p>
      )}

      {isSelected && !isBuilding && (
        <p className="mt-2 text-xs text-blue-600">View details in the panel →</p>
      )}
    </button>
  );
}
