'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { ItineraryItem } from '@/contexts/ItineraryPanelContext';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItineraryContextSelectorProps {
  items: ItineraryItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onCreateNew: () => void;
  disabled?: boolean;
}

export function ItineraryContextSelector({
  items,
  selectedId,
  onSelect,
  onCreateNew,
  disabled = false,
}: ItineraryContextSelectorProps) {
  // Empty state - show create button
  if (items.length === 0) {
    return (
      <button
        onClick={onCreateNew}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md",
          "border border-dashed border-primary/50 text-primary",
          "hover:bg-primary/5 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Plus className="h-4 w-4" />
        Create Itinerary
      </button>
    );
  }

  // Get display name for an item
  const getDisplayName = (item: ItineraryItem) => {
    return item.itinerary?.destination || item.buildingParams?.destination || 'Untitled';
  };

  const selectedItem = items.find(i => i.id === selectedId);

  return (
    <Select
      value={selectedId || ''}
      onValueChange={(value) => {
        if (value === '__new__') {
          onCreateNew();
        } else {
          onSelect(value || null);
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-auto min-w-[180px] h-8 text-sm">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <SelectValue placeholder="Select itinerary...">
            {selectedItem ? getDisplayName(selectedItem) : 'Select itinerary...'}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            <div className="flex items-center gap-2">
              <span>{getDisplayName(item)}</span>
              {item.status === 'building' && (
                <span className="flex items-center gap-1 text-xs text-blue-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Building
                </span>
              )}
            </div>
          </SelectItem>
        ))}
        <SelectSeparator />
        <SelectItem value="__new__" className="text-primary">
          <div className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Itinerary...
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
