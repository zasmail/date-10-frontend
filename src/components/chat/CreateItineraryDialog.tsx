'use client';

import { useState } from 'react';
import { useItineraryPanel, ItineraryBuildingParams } from '@/contexts/ItineraryPanelContext';
import { MapPin, Calendar, Users, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateItineraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: ItineraryBuildingParams, panelItemId: string) => void;
}

export function CreateItineraryDialog({ isOpen, onClose, onSubmit }: CreateItineraryDialogProps) {
  const { addItemWithParams } = useItineraryPanel();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !startDate || !endDate) return;

    setIsSubmitting(true);

    const params: ItineraryBuildingParams = {
      destination,
      startDate,
      endDate,
      travelers,
    };

    // Create the panel item immediately
    const panelItemId = addItemWithParams(params);

    // Call the parent's onSubmit which will trigger the API call
    onSubmit(params, panelItemId);

    // Reset form and close
    setDestination('');
    setStartDate('');
    setEndDate('');
    setTravelers(2);
    setIsSubmitting(false);
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Create Itinerary</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            Tell us about your trip and we'll create a detailed plan
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <MapPin className="h-4 w-4 inline mr-1" />
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Tokyo, Japan"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autoFocus
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Travelers */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Users className="h-4 w-4 inline mr-1" />
              Number of Travelers
            </label>
            <select
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'traveler' : 'travelers'}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !destination || !startDate || !endDate}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-medium transition-all',
              'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
              'hover:from-blue-600 hover:to-indigo-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2'
            )}
          >
            <Sparkles className="h-4 w-4" />
            Create Itinerary
          </button>
        </form>
      </div>
    </div>
  );
}
