'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchSharedItinerary, geocodeLocation } from '@/lib/api';
import type { SharedItinerary, ItineraryProposal, ItineraryDay, Activity } from '@/types/itinerary';
import type { MapDestination } from '@/types/map';
import { ItineraryMap } from '@/components/map';

interface SharedItineraryViewProps {
  token: string;
}

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div className="pl-4 border-l-2 border-blue-200 py-2">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-blue-600">{activity.time}</span>
        <span className="font-medium text-slate-800">{activity.name}</span>
      </div>
      <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
        <span>Duration: {activity.duration}</span>
        {activity.location && <span>Location: {activity.location}</span>}
        {activity.cost_estimate && <span>Cost: {activity.cost_estimate}</span>}
        {activity.booking_required && (
          <span className="text-amber-600 font-medium">Booking required</span>
        )}
      </div>
    </div>
  );
}

function DayCard({ day }: { day: ItineraryDay }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Day {day.day_number}: {day.title}
        </h3>
        <span className="text-sm text-slate-500">{day.date}</span>
      </div>
      <p className="text-sm text-slate-600 mb-4">
        <span className="font-medium">Location:</span> {day.location}
      </p>

      <div className="space-y-4 mb-4">
        <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Activities
        </h4>
        {day.activities.map((activity, idx) => (
          <ActivityCard key={idx} activity={activity} />
        ))}
      </div>

      {day.accommodation && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
            Accommodation
          </h4>
          <div className="bg-slate-50 rounded-md p-3">
            <p className="font-medium text-slate-800">{day.accommodation.name}</p>
            <p className="text-sm text-slate-600">
              {day.accommodation.style} in {day.accommodation.area}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {day.accommodation.price_range}
            </p>
            {day.accommodation.notes && (
              <p className="text-sm text-slate-500 mt-1 italic">
                {day.accommodation.notes}
              </p>
            )}
          </div>
        </div>
      )}

      {day.notes && (
        <p className="mt-4 text-sm text-slate-500 italic border-l-2 border-slate-200 pl-3">
          {day.notes}
        </p>
      )}
    </div>
  );
}

function ProposalView({ proposal, isExpanded, onToggle, mapDestinations }: {
  proposal: ItineraryProposal;
  isExpanded: boolean;
  onToggle: () => void;
  mapDestinations?: MapDestination[];
}) {
  return (
    <div className={`bg-white rounded-xl shadow-md border overflow-hidden transition-all ${isExpanded ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200'}`}>
      <button
        onClick={onToggle}
        className="w-full p-6 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">{proposal.title}</h2>
            {!isExpanded && (
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                Click to expand
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <p className="text-slate-600 mt-2">{proposal.summary}</p>
        <div className="flex items-center gap-4 mt-3">
          <p className="text-sm font-medium text-green-600">
            Estimated: {proposal.total_budget_estimate}
          </p>
          <p className="text-sm text-slate-500">
            {proposal.days.length} day{proposal.days.length !== 1 ? 's' : ''}
          </p>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-slate-100">
          {/* Map showing trip route */}
          {mapDestinations && mapDestinations.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
                Trip Route
              </h3>
              <ItineraryMap
                destinations={mapDestinations}
                showRoute={true}
                className="h-[350px]"
              />
            </div>
          )}

          {proposal.highlights.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
                Highlights
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {proposal.highlights.map((highlight, idx) => (
                  <li key={idx} className="text-sm text-slate-600">{highlight}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Day-by-Day Itinerary
            </h3>
            {proposal.days.map((day) => (
              <DayCard key={day.day_number} day={day} />
            ))}
          </div>

          {proposal.caveats.length > 0 && (
            <div className="mt-6 bg-amber-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wide mb-2">
                Things to Consider
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {proposal.caveats.map((caveat, idx) => (
                  <li key={idx} className="text-sm text-amber-700">{caveat}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SharedItineraryView({ token }: SharedItineraryViewProps) {
  const [itinerary, setItinerary] = useState<SharedItinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedProposal, setExpandedProposal] = useState<string | null>(null);
  const [mapDestinations, setMapDestinations] = useState<MapDestination[]>([]);

  useEffect(() => {
    async function loadItinerary() {
      try {
        const data = await fetchSharedItinerary(token);
        setItinerary(data);
        // Auto-expand first proposal
        if (data.proposals.length > 0) {
          setExpandedProposal(data.proposals[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load itinerary');
      } finally {
        setLoading(false);
      }
    }

    loadItinerary();
  }, [token]);

  // Geocode locations when the expanded proposal changes
  useEffect(() => {
    if (!itinerary || !expandedProposal) return;

    const proposal = itinerary.proposals.find(p => p.id === expandedProposal);
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
      if (itinerary!.destination && !locations.has(itinerary!.destination)) {
        locations.set(itinerary!.destination, { dayNumber: 0, title: 'Destination' });
      }

      const destinations: MapDestination[] = [];

      for (const [locationName, { dayNumber, title }] of locations) {
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
      }

      // Sort by day number
      destinations.sort((a, b) => a.dayNumber - b.dayNumber);
      setMapDestinations(destinations);
    }

    geocodeProposalLocations();
  }, [itinerary, expandedProposal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h1 className="text-xl font-semibold text-slate-800 mb-2">
            Unable to Load Itinerary
          </h1>
          <p className="text-slate-600">{error}</p>
          <p className="text-sm text-slate-500 mt-4">
            This link may have expired or been revoked.
          </p>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          {itinerary.title || `${itinerary.destination} Itinerary`}
        </h1>
        <div className="flex items-center justify-center gap-4 text-slate-600">
          <span>{itinerary.start_date} to {itinerary.end_date}</span>
          <span className="w-1 h-1 rounded-full bg-slate-400"></span>
          <span>{itinerary.num_travelers} traveler{itinerary.num_travelers !== 1 ? 's' : ''}</span>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Viewed {itinerary.view_count} time{itinerary.view_count !== 1 ? 's' : ''}
        </p>
      </header>

      {/* Instructions banner */}
      {itinerary.proposals.length > 1 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Multiple itinerary options below.</span>
            {' '}Click on each proposal to expand and view the full day-by-day details.
          </p>
        </div>
      )}

      {/* Proposals */}
      <div className="space-y-6">
        {itinerary.proposals.map((proposal) => (
          <ProposalView
            key={proposal.id}
            proposal={proposal}
            isExpanded={expandedProposal === proposal.id}
            onToggle={() => setExpandedProposal(
              expandedProposal === proposal.id ? null : proposal.id
            )}
            mapDestinations={expandedProposal === proposal.id ? mapDestinations : undefined}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="text-center mt-12 pt-8 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          Generated by <span className="font-medium text-blue-600">Date 10</span>
        </p>
      </footer>
    </div>
  );
}
