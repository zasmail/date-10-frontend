'use client';

import { useState, useEffect } from 'react';
import { ItineraryData, ItineraryProposal, ItineraryDay, ItineraryActivity } from '@/types/chat';
import type { MapDestination } from '@/types/map';
import { ItineraryMap } from '@/components/map';
import { geocodeLocation } from '@/lib/api';
import { Calendar, Users, MapPin, ChevronDown, Check, AlertCircle, Building, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface ItineraryDetailViewProps {
  itinerary: ItineraryData;
  isBuilding?: boolean;
}

function ActivityCard({ activity }: { activity: ItineraryActivity }) {
  return (
    <div className="pl-4 border-l-2 border-blue-200 py-2">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-blue-600">{activity.time}</span>
        <span className="font-medium text-slate-800">{activity.name}</span>
      </div>
      <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {activity.duration}
        </span>
        {activity.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {activity.location}
          </span>
        )}
        {activity.cost_estimate && (
          <span className="text-green-600">{activity.cost_estimate}</span>
        )}
        {activity.booking_required && (
          <span className="text-amber-600 font-medium flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Booking required
          </span>
        )}
      </div>
    </div>
  );
}

function DayCard({ day }: { day: ItineraryDay }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-semibold text-slate-800">
          Day {day.day_number}: {day.title}
        </h4>
        <span className="text-xs text-slate-500">{day.date}</span>
      </div>
      <p className="text-sm text-slate-600 mb-3 flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5" />
        {day.location}
      </p>

      <div className="space-y-3 mb-3">
        {day.activities.map((activity, idx) => (
          <ActivityCard key={idx} activity={activity} />
        ))}
      </div>

      {day.accommodation && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Building className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Accommodation</span>
          </div>
          <div className="bg-slate-50 rounded-md p-2.5">
            <p className="font-medium text-slate-800 text-sm">{day.accommodation.name}</p>
            <p className="text-xs text-slate-600">
              {day.accommodation.style} in {day.accommodation.area}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {day.accommodation.price_range}
            </p>
            {day.accommodation.notes && (
              <p className="text-xs text-slate-500 mt-1 italic">
                {day.accommodation.notes}
              </p>
            )}
          </div>
        </div>
      )}

      {day.notes && (
        <p className="mt-3 text-sm text-slate-500 italic border-l-2 border-slate-200 pl-3">
          {day.notes}
        </p>
      )}
    </div>
  );
}

function ProposalView({
  proposal,
  isExpanded,
  onToggle,
  mapDestinations,
}: {
  proposal: ItineraryProposal;
  isExpanded: boolean;
  onToggle: (open: boolean) => void;
  mapDestinations?: MapDestination[];
}) {
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={onToggle}
      className={cn(
        'bg-white rounded-xl shadow-sm border overflow-hidden transition-all',
        isExpanded ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
      )}
    >
      <CollapsibleTrigger asChild>
        <button className="w-full p-4 text-left hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-800 truncate">{proposal.title}</h3>
            </div>
            <ChevronDown className={cn(
              'h-5 w-5 text-slate-400 flex-shrink-0 ml-2 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )} />
          </div>
          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{proposal.summary}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-medium text-green-600">
              {proposal.total_budget_estimate}
            </span>
            <span className="text-xs text-slate-500">
              {proposal.days.length} day{proposal.days.length !== 1 ? 's' : ''}
            </span>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t border-slate-100">
        <div className="px-4 pb-4">
          {/* Map */}
          {mapDestinations && mapDestinations.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Trip Route
              </h4>
              <ItineraryMap
                destinations={mapDestinations}
                showRoute={true}
                className="h-[280px] rounded-lg overflow-hidden"
              />
            </div>
          )}

          {/* Highlights */}
          {proposal.highlights.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Highlights
              </h4>
              <ul className="space-y-1.5">
                {proposal.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Day-by-day */}
          <div className="mt-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Day-by-Day
            </h4>
            {proposal.days.map((day) => (
              <DayCard key={day.day_number} day={day} />
            ))}
          </div>

          {/* Caveats */}
          {proposal.caveats.length > 0 && (
            <div className="mt-4 bg-amber-50 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
                Things to Consider
              </h4>
              <ul className="space-y-1">
                {proposal.caveats.map((caveat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-amber-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    {caveat}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ItineraryDetailView({ itinerary, isBuilding }: ItineraryDetailViewProps) {
  const [expandedProposal, setExpandedProposal] = useState<string | null>(
    itinerary.proposals.length > 0 ? itinerary.proposals[0].id : null
  );
  const [mapDestinations, setMapDestinations] = useState<MapDestination[]>([]);

  // Geocode locations when expanded proposal changes
  useEffect(() => {
    if (!expandedProposal) return;

    const proposal = itinerary.proposals.find((p) => p.id === expandedProposal);
    if (!proposal) return;

    async function geocodeProposalLocations() {
      const locations = new Map<string, { dayNumber: number; title: string }>();

      // Collect unique locations from days
      for (const day of proposal!.days) {
        const locationName = day.location;
        if (locationName && !locations.has(locationName)) {
          locations.set(locationName, { dayNumber: day.day_number, title: day.title });
        }
      }

      // Also try to geocode the main destination
      if (itinerary.destination && !locations.has(itinerary.destination)) {
        locations.set(itinerary.destination, { dayNumber: 0, title: 'Destination' });
      }

      const destinations: MapDestination[] = [];

      for (const [locationName, { dayNumber, title }] of locations) {
        try {
          const geocoded = await geocodeLocation(locationName);
          if (geocoded) {
            destinations.push({
              id: `${expandedProposal}-${dayNumber}-${locationName}`,
              name: locationName,
              lat: geocoded.lat,
              lng: geocoded.lng,
              dayNumber: dayNumber || 1,
              description: title,
              country: geocoded.country,
              region: geocoded.region,
            });
          }
        } catch (err) {
          console.error(`Failed to geocode ${locationName}:`, err);
        }
      }

      // Sort by day number
      destinations.sort((a, b) => a.dayNumber - b.dayNumber);
      setMapDestinations(destinations);
    }

    geocodeProposalLocations();
  }, [itinerary, expandedProposal]);

  // Auto-expand first proposal when itinerary changes
  useEffect(() => {
    if (itinerary.proposals.length > 0 && !expandedProposal) {
      setExpandedProposal(itinerary.proposals[0].id);
    }
  }, [itinerary.proposals, expandedProposal]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-800">{itinerary.destination}</h2>
          {isBuilding && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded animate-pulse">
              Building...
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {itinerary.start_date} — {itinerary.end_date}
          </span>
          {itinerary.num_travelers && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {itinerary.num_travelers} traveler{itinerary.num_travelers !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Proposals */}
      {itinerary.proposals.length === 0 ? (
        <div className="bg-slate-50 rounded-lg p-6 text-center">
          <p className="text-slate-600">
            {isBuilding ? 'Creating your itinerary...' : 'No proposals yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {itinerary.proposals.length > 1 && (
            <p className="text-xs text-slate-500">
              {itinerary.proposals.length} options available. Click to expand each one.
            </p>
          )}
          {itinerary.proposals.map((proposal) => (
            <ProposalView
              key={proposal.id}
              proposal={proposal}
              isExpanded={expandedProposal === proposal.id}
              onToggle={(open) => setExpandedProposal(open ? proposal.id : null)}
              mapDestinations={expandedProposal === proposal.id ? mapDestinations : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
