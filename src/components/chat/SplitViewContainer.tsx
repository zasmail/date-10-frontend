'use client';

import React, { ReactNode, useState } from 'react';
import { useBreakpoint } from '@/hooks/useMediaQuery';
import { useItineraryPanel } from '@/contexts/ItineraryPanelContext';
import { PanelRightClose, PanelRightOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplitViewContainerProps {
  chatPane: ReactNode;
  itineraryPane: ReactNode;
}

export function SplitViewContainer({ chatPane, itineraryPane }: SplitViewContainerProps) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const { state, togglePanel, setPanelOpen } = useItineraryPanel();
  const { isPanelOpen, items } = state;
  const [activeTab, setActiveTab] = useState<'chat' | 'itinerary'>('chat');

  const hasItems = items.length > 0;

  // Mobile: Tab-based navigation
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {/* Tab bar */}
        <div className="flex border-b border-border bg-background">
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              'flex-1 py-3 px-4 text-sm font-medium transition-colors',
              activeTab === 'chat'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('itinerary')}
            className={cn(
              'flex-1 py-3 px-4 text-sm font-medium transition-colors relative',
              activeTab === 'itinerary'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Itinerary
            {hasItems && (
              <span className="absolute top-2 right-4 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            <div className="h-full">{chatPane}</div>
          ) : (
            <div className="h-full">{itineraryPane}</div>
          )}
        </div>
      </div>
    );
  }

  // Tablet: Slide-over overlay
  if (isTablet) {
    return (
      <div className="relative h-full">
        {/* Chat pane - full width */}
        <div className="h-full">{chatPane}</div>

        {/* Toggle button - always visible */}
        {!isPanelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            className={cn(
              "fixed right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full shadow-lg transition-colors",
              hasItems
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            aria-label="Open itinerary panel"
          >
            <PanelRightOpen className="h-5 w-5" />
          </button>
        )}

        {/* Overlay panel */}
        {isPanelOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/30 z-40 transition-opacity"
              onClick={() => setPanelOpen(false)}
            />

            {/* Slide-over panel */}
            <div className="fixed right-0 top-0 h-full w-[400px] max-w-[85vw] bg-background border-l border-border z-50 shadow-xl animate-in slide-in-from-right duration-300">
              {/* Close button */}
              <button
                onClick={() => setPanelOpen(false)}
                className="absolute top-4 left-4 z-10 p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="h-full overflow-auto pt-16">
                {itineraryPane}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Desktop: Side-by-side grid - always show panel
  return (
    <div
      className={cn(
        'h-full grid transition-all duration-300',
        isPanelOpen
          ? 'grid-cols-[1fr_minmax(400px,480px)]'
          : 'grid-cols-[1fr]'
      )}
    >
      {/* Chat pane */}
      <div className="h-full overflow-hidden relative">
        {chatPane}

        {/* Collapse/Expand button - always visible */}
        <button
          onClick={togglePanel}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-muted hover:bg-muted/80 transition-all"
          aria-label={isPanelOpen ? 'Collapse itinerary panel' : 'Expand itinerary panel'}
        >
          {isPanelOpen ? (
            <PanelRightClose className="h-5 w-5 text-muted-foreground" />
          ) : (
            <PanelRightOpen className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Itinerary pane - always rendered when open */}
      {isPanelOpen && (
        <div className="h-full border-l border-border overflow-hidden bg-muted/30">
          {itineraryPane}
        </div>
      )}
    </div>
  );
}
