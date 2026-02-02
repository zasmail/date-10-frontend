'use client';

import { useState, useEffect } from 'react';
import { useItineraryPanel, ItineraryBuildingParams } from '@/contexts/ItineraryPanelContext';
import { ItineraryPaneHeader } from './ItineraryPaneHeader';
import { ItineraryDetailView } from './ItineraryDetailView';
import { FlightsDetailCard } from './FlightsDetailCard';
import { CreateItineraryDialog } from './CreateItineraryDialog';
import { MapPin, Plane, Sparkles, Plus, Loader2, AlertCircle, Calendar, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItineraryPaneProps {
  onCreateItinerary?: (params: ItineraryBuildingParams, panelItemId: string) => void;
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mb-5">
        <Sparkles className="h-10 w-10 text-blue-500" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">Your Itinerary Library</h3>
      <p className="text-sm text-slate-600 max-w-xs mb-6">
        Create detailed trip plans with day-by-day activities, recommendations, and more.
      </p>

      {/* Create Button */}
      <button
        onClick={onCreateClick}
        className={cn(
          'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
          'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
          'hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg',
          'transform hover:scale-105'
        )}
      >
        <Plus className="h-5 w-5" />
        Create Itinerary
      </button>

      <p className="text-xs text-slate-400 mt-6">
        Or ask in the chat to create one for you
      </p>
    </div>
  );
}

function BuildingState() {
  const { getSelectedItem } = useItineraryPanel();
  const selectedItem = getSelectedItem();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!selectedItem) return;

    // Calculate initial elapsed time
    const startTime = new Date(selectedItem.createdAt).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [selectedItem]);

  if (!selectedItem) return null;

  const params = selectedItem.buildingParams;
  const statusMessage = selectedItem.statusMessage || 'Starting...';

  // Format elapsed time
  const formatElapsed = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {/* Animated spinner */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-2">Creating Your Itinerary</h3>

      {/* Status message with elapsed time */}
      <div className="mb-4">
        <p className="text-sm text-blue-600 font-medium animate-pulse">
          {statusMessage}
        </p>
        <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mt-1">
          <Clock className="h-3 w-3" />
          <span>{formatElapsed(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Trip details */}
      {params && (
        <div className="bg-slate-50 rounded-lg p-4 w-full max-w-xs text-left">
          <div className="flex items-center gap-2 text-slate-700 mb-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{params.destination}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{params.startDate} to {params.endDate}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Users className="h-4 w-4 text-slate-400" />
            <span>{params.travelers} traveler{params.travelers !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Progress steps */}
      <div className="mt-6 w-full max-w-xs">
        <div className="flex justify-between text-xs text-slate-400">
          <span className={statusMessage.includes('Starting') ? 'text-blue-500 font-medium' : ''}>
            Starting
          </span>
          <span className={statusMessage.includes('Generating') ? 'text-blue-500 font-medium' : ''}>
            Generating
          </span>
          <span className={statusMessage.includes('Finalizing') ? 'text-blue-500 font-medium' : ''}>
            Finalizing
          </span>
        </div>
        <div className="h-1 bg-slate-200 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{
              width: statusMessage.includes('Starting') ? '20%' :
                     statusMessage.includes('Generating') ? '60%' :
                     statusMessage.includes('Finalizing') ? '90%' : '10%'
            }}
          />
        </div>
      </div>

      {/* Warning for stale items */}
      {elapsedSeconds > 300 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-left max-w-xs">
          <p className="text-xs text-amber-800">
            This is taking longer than expected. The request may have failed.
          </p>
          <button
            onClick={() => {
              if (selectedItem && confirm('Cancel this itinerary creation?')) {
                const { setItemError } = require('@/contexts/ItineraryPanelContext').useItineraryPanel();
                setItemError(selectedItem.id, 'Request timed out');
              }
            }}
            className="text-xs text-amber-700 underline mt-1 hover:text-amber-900"
          >
            Cancel and retry
          </button>
        </div>
      )}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { getSelectedItem, setItemStatus } = useItineraryPanel();
  const selectedItem = getSelectedItem();

  if (!selectedItem || selectedItem.status !== 'error') return null;

  const handleRetry = () => {
    if (onRetry && selectedItem.buildingParams) {
      // Reset status to building
      setItemStatus(selectedItem.id, 'building', 'Retrying...');
      // Trigger retry with original params
      onRetry();
    }
  };

  const handleDismiss = () => {
    // Mark as saved to hide from building state
    setItemStatus(selectedItem.id, 'saved');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Something went wrong</h3>
      <p className="text-sm text-slate-600 max-w-xs mb-4">
        {selectedItem.error || 'Failed to create itinerary. Please try again.'}
      </p>

      {/* Retry actions */}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {onRetry && selectedItem.buildingParams && (
          <button
            onClick={handleRetry}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              'bg-blue-500 text-white hover:bg-blue-600',
              'transform hover:scale-105'
            )}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function SelectedItemContent({
  onCreateClick,
  onRetry
}: {
  onCreateClick: () => void;
  onRetry?: (params: ItineraryBuildingParams) => void;
}) {
  const { getSelectedItem } = useItineraryPanel();
  const selectedItem = getSelectedItem();

  if (!selectedItem) {
    return <EmptyState onCreateClick={onCreateClick} />;
  }

  const isBuilding = selectedItem.status === 'building';
  const isError = selectedItem.status === 'error';
  const hasItinerary = !!selectedItem.itinerary;
  const hasFlights = !!selectedItem.flights;

  // Error state with retry callback
  if (isError) {
    return <ErrorState onRetry={
      onRetry && selectedItem.buildingParams
        ? () => onRetry(selectedItem.buildingParams!)
        : undefined
    } />;
  }

  // Building state with no data yet
  if (isBuilding && !hasItinerary && !hasFlights) {
    return <BuildingState />;
  }

  return (
    <div className="h-full overflow-auto">
      {/* Itinerary section */}
      {hasItinerary && (
        <ItineraryDetailView itinerary={selectedItem.itinerary!} isBuilding={isBuilding} />
      )}

      {/* Flights section */}
      {hasFlights && (
        <div className={hasItinerary ? 'border-t border-slate-200' : ''}>
          <FlightsDetailCard flights={selectedItem.flights!} isBuilding={isBuilding} />
        </div>
      )}

      {/* Flights-only message */}
      {hasFlights && !hasItinerary && (
        <div className="px-4 pb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            <p>
              These are standalone flight options. Ask me to create an itinerary to see the
              complete trip plan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ItineraryPane({ onCreateItinerary }: ItineraryPaneProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { state } = useItineraryPanel();
  const hasItems = state.items.length > 0;

  const handleCreateClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogSubmit = (params: ItineraryBuildingParams, panelItemId: string) => {
    if (onCreateItinerary) {
      onCreateItinerary(params, panelItemId);
    }
  };

  const handleRetry = (params: ItineraryBuildingParams) => {
    // Get the failed item's panel ID
    const failedItem = state.items.find(item => item.status === 'error' && item.buildingParams);
    if (failedItem && onCreateItinerary) {
      onCreateItinerary(params, failedItem.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <ItineraryPaneHeader onCreateClick={handleCreateClick} />
      <div className="flex-1 overflow-hidden">
        <SelectedItemContent
          onCreateClick={handleCreateClick}
          onRetry={onCreateItinerary ? handleRetry : undefined}
        />
      </div>

      {/* Floating create button when there are items */}
      {hasItems && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={handleCreateClick}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all',
              'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
              'hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl',
              'transform hover:scale-105'
            )}
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">New</span>
          </button>
        </div>
      )}

      {/* Dialog */}
      <CreateItineraryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleDialogSubmit}
      />
    </div>
  );
}
