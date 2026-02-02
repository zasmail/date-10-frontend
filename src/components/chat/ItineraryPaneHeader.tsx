'use client';

import { useItineraryPanel, ItineraryItem } from '@/contexts/ItineraryPanelContext';
import { MapPin, Loader2, Library, Plane, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItineraryPaneHeaderProps {
  onCreateClick?: () => void;
}

function getItemLabel(item: ItineraryItem): string {
  if (item.itinerary?.destination) {
    return item.itinerary.destination;
  }
  if (item.flights?.destination) {
    return `Flights to ${item.flights.destination}`;
  }
  return 'New Itinerary';
}

function getItemDates(item: ItineraryItem): string | null {
  if (item.itinerary?.start_date && item.itinerary?.end_date) {
    return `${item.itinerary.start_date} - ${item.itinerary.end_date}`;
  }
  return null;
}

function getItemIcon(item: ItineraryItem, isBuilding: boolean) {
  if (isBuilding) {
    return <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />;
  }
  if (item.flights && !item.itinerary) {
    return <Plane className="h-4 w-4 text-slate-400 flex-shrink-0" />;
  }
  return <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />;
}

interface ItineraryTabProps {
  item: ItineraryItem;
  isSelected: boolean;
  onClick: () => void;
}

function ItineraryTab({ item, isSelected, onClick }: ItineraryTabProps) {
  const label = getItemLabel(item);
  const dates = getItemDates(item);
  const isBuilding = item.status === 'building';

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-shrink-0 px-3 py-2 rounded-lg transition-all text-left min-w-[140px] max-w-[200px]',
        isSelected
          ? 'bg-white shadow-sm border border-blue-200 ring-1 ring-blue-100'
          : 'bg-white/50 hover:bg-white border border-transparent hover:border-slate-200',
        isBuilding && 'animate-pulse'
      )}
    >
      <div className="flex items-center gap-2">
        {getItemIcon(item, isBuilding)}
        <span className="text-sm font-medium text-slate-800 truncate">{label}</span>
      </div>
      {dates && (
        <p className="text-xs text-slate-500 mt-0.5 truncate pl-6">{dates}</p>
      )}
    </button>
  );
}

export function ItineraryPaneHeader({ onCreateClick }: ItineraryPaneHeaderProps) {
  const { state, selectItem } = useItineraryPanel();
  const { items, selectedId } = state;

  // Empty state - show library title
  if (items.length === 0) {
    return (
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30">
        <div className="flex items-center gap-2">
          <Library className="h-5 w-5 text-blue-500" />
          <span className="font-semibold text-slate-800">Itinerary Library</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">Your trips will appear here</p>
      </div>
    );
  }

  // If only one item, show header with library context
  if (items.length === 1) {
    const item = items[0];
    const label = getItemLabel(item);
    const isBuilding = item.status === 'building';

    return (
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-slate-500 uppercase">Itinerary Library</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">1 trip</span>
            {onCreateClick && (
              <button
                onClick={onCreateClick}
                className="p-1 rounded hover:bg-blue-100 text-blue-500 transition-colors"
                title="Create new itinerary"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {getItemIcon(item, isBuilding)}
          <span className="font-medium text-slate-800">{label}</span>
          {isBuilding && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Building...
            </span>
          )}
        </div>
      </div>
    );
  }

  // Multiple items: show horizontal scrollable tabs
  return (
    <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Library className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-medium text-slate-500 uppercase">Itinerary Library</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{items.length} trips</span>
          {onCreateClick && (
            <button
              onClick={onCreateClick}
              className="p-1 rounded hover:bg-blue-100 text-blue-500 transition-colors"
              title="Create new itinerary"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-thin scrollbar-thumb-slate-300">
        {items.map((item) => (
          <ItineraryTab
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            onClick={() => selectItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
