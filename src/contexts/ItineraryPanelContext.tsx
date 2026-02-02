'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { ItineraryData, FlightSearchResult } from '@/types/chat';

// Types for itinerary panel state
export type ItineraryItemStatus = 'building' | 'complete' | 'saved' | 'error';

export interface ItineraryBuildingParams {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
}

export interface ItineraryItem {
  id: string;
  messageId: string;
  itinerary?: ItineraryData;
  flights?: FlightSearchResult;
  status: ItineraryItemStatus;
  statusMessage?: string; // Detailed status during building
  buildingParams?: ItineraryBuildingParams; // Initial params when building
  error?: string;
  createdAt: string;
}

interface ItineraryPanelState {
  items: ItineraryItem[];
  selectedId: string | null;
  isPanelOpen: boolean;
}

// Action types
type ItineraryPanelAction =
  | { type: 'ADD_ITEM'; payload: ItineraryItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<ItineraryItem> } }
  | { type: 'SET_ITINERARY'; payload: { id: string; itinerary: ItineraryData } }
  | { type: 'SET_FLIGHTS'; payload: { id: string; flights: FlightSearchResult } }
  | { type: 'SET_STATUS'; payload: { id: string; status: ItineraryItemStatus; message?: string } }
  | { type: 'SET_STATUS_MESSAGE'; payload: { id: string; message: string } }
  | { type: 'SET_ERROR'; payload: { id: string; error: string } }
  | { type: 'SELECT_ITEM'; payload: string | null }
  | { type: 'TOGGLE_PANEL' }
  | { type: 'SET_PANEL_OPEN'; payload: boolean }
  | { type: 'LOAD_SAVED_ITEMS'; payload: ItineraryItem[] }
  | { type: 'CLEAR_ITEMS' };

// Initial state
const initialState: ItineraryPanelState = {
  items: [],
  selectedId: null,
  isPanelOpen: true,
};

// Reducer
function itineraryPanelReducer(
  state: ItineraryPanelState,
  action: ItineraryPanelAction
): ItineraryPanelState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItems = [...state.items, action.payload];
      return {
        ...state,
        items: newItems,
        selectedId: action.payload.id, // Auto-select new items
        isPanelOpen: true, // Open panel when item is added
      };
    }
    case 'UPDATE_ITEM': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };
    }
    case 'SET_ITINERARY': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, itinerary: action.payload.itinerary }
            : item
        ),
      };
    }
    case 'SET_FLIGHTS': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, flights: action.payload.flights }
            : item
        ),
      };
    }
    case 'SET_STATUS': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, status: action.payload.status, statusMessage: action.payload.message }
            : item
        ),
      };
    }
    case 'SET_STATUS_MESSAGE': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, statusMessage: action.payload.message }
            : item
        ),
      };
    }
    case 'SET_ERROR': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, status: 'error', error: action.payload.error, statusMessage: undefined }
            : item
        ),
      };
    }
    case 'SELECT_ITEM': {
      return {
        ...state,
        selectedId: action.payload,
        isPanelOpen: action.payload !== null ? true : state.isPanelOpen,
      };
    }
    case 'TOGGLE_PANEL': {
      return {
        ...state,
        isPanelOpen: !state.isPanelOpen,
      };
    }
    case 'SET_PANEL_OPEN': {
      return {
        ...state,
        isPanelOpen: action.payload,
      };
    }
    case 'LOAD_SAVED_ITEMS': {
      return {
        ...state,
        items: action.payload,
        selectedId: action.payload.length > 0 ? action.payload[0].id : null,
      };
    }
    case 'CLEAR_ITEMS': {
      return {
        ...state,
        items: [],
        selectedId: null,
      };
    }
    default:
      return state;
  }
}

// Context type
interface ItineraryPanelContextType {
  state: ItineraryPanelState;
  // Item management
  addItem: (messageId: string, status?: ItineraryItemStatus) => string;
  addItemWithParams: (params: ItineraryBuildingParams) => string;
  updateItinerary: (id: string, itinerary: ItineraryData) => void;
  updateFlights: (id: string, flights: FlightSearchResult) => void;
  setItemStatus: (id: string, status: ItineraryItemStatus, message?: string) => void;
  setStatusMessage: (id: string, message: string) => void;
  setItemError: (id: string, error: string) => void;
  // Selection
  selectItem: (id: string | null) => void;
  selectByMessageId: (messageId: string) => void;
  // Panel visibility
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  // Bulk operations
  loadSavedItems: (items: ItineraryItem[]) => void;
  clearItems: () => void;
  // Helpers
  getSelectedItem: () => ItineraryItem | undefined;
  getItemByMessageId: (messageId: string) => ItineraryItem | undefined;
  getBuildingItem: () => ItineraryItem | undefined;
}

// Create context
const ItineraryPanelContext = createContext<ItineraryPanelContextType | null>(null);

// Generate unique ID
function generateId(): string {
  return `itinerary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// LocalStorage key for persisting state
const STORAGE_KEY = 'wanderlust:itinerary-panel-state';
const MAX_BUILDING_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Save state to localStorage
function saveStateToStorage(state: ItineraryPanelState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save itinerary state to localStorage:', error);
  }
}

// Load state from localStorage with cleanup of stale building items
function loadStateFromStorage(): ItineraryPanelState | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const state = JSON.parse(stored) as ItineraryPanelState;
    const now = Date.now();

    // Filter out stale building items (older than 24 hours)
    const cleanedItems = state.items.filter((item) => {
      if (item.status === 'building') {
        const age = now - new Date(item.createdAt).getTime();
        return age < MAX_BUILDING_AGE_MS;
      }
      return true; // Keep all non-building items
    });

    return {
      ...state,
      items: cleanedItems,
    };
  } catch (error) {
    console.warn('Failed to load itinerary state from localStorage:', error);
    return null;
  }
}

// Provider component
interface ItineraryPanelProviderProps {
  children: ReactNode;
}

export function ItineraryPanelProvider({ children }: ItineraryPanelProviderProps) {
  // Initialize state from localStorage if available
  const [state, dispatch] = useReducer(
    itineraryPanelReducer,
    initialState,
    (initial) => {
      const stored = loadStateFromStorage();
      return stored || initial;
    }
  );

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  const addItem = useCallback((messageId: string, status: ItineraryItemStatus = 'building'): string => {
    const id = generateId();
    const newItem: ItineraryItem = {
      id,
      messageId,
      status,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ITEM', payload: newItem });
    return id;
  }, []);

  const addItemWithParams = useCallback((params: ItineraryBuildingParams): string => {
    const id = generateId();
    const newItem: ItineraryItem = {
      id,
      messageId: id, // Use same ID initially, will be updated when message is created
      status: 'building',
      statusMessage: 'Starting...',
      buildingParams: params,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ITEM', payload: newItem });
    return id;
  }, []);

  const updateItinerary = useCallback((id: string, itinerary: ItineraryData) => {
    dispatch({ type: 'SET_ITINERARY', payload: { id, itinerary } });
  }, []);

  const updateFlights = useCallback((id: string, flights: FlightSearchResult) => {
    dispatch({ type: 'SET_FLIGHTS', payload: { id, flights } });
  }, []);

  const setItemStatus = useCallback((id: string, status: ItineraryItemStatus, message?: string) => {
    dispatch({ type: 'SET_STATUS', payload: { id, status, message } });
  }, []);

  const setStatusMessage = useCallback((id: string, message: string) => {
    dispatch({ type: 'SET_STATUS_MESSAGE', payload: { id, message } });
  }, []);

  const setItemError = useCallback((id: string, error: string) => {
    dispatch({ type: 'SET_ERROR', payload: { id, error } });
  }, []);

  const selectItem = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_ITEM', payload: id });
  }, []);

  const selectByMessageId = useCallback((messageId: string) => {
    const item = state.items.find((i) => i.messageId === messageId);
    if (item) {
      dispatch({ type: 'SELECT_ITEM', payload: item.id });
    }
  }, [state.items]);

  const togglePanel = useCallback(() => {
    dispatch({ type: 'TOGGLE_PANEL' });
  }, []);

  const setPanelOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_PANEL_OPEN', payload: open });
  }, []);

  const loadSavedItems = useCallback((items: ItineraryItem[]) => {
    dispatch({ type: 'LOAD_SAVED_ITEMS', payload: items });
  }, []);

  const clearItems = useCallback(() => {
    dispatch({ type: 'CLEAR_ITEMS' });
  }, []);

  const getSelectedItem = useCallback((): ItineraryItem | undefined => {
    return state.items.find((item) => item.id === state.selectedId);
  }, [state.items, state.selectedId]);

  const getItemByMessageId = useCallback((messageId: string): ItineraryItem | undefined => {
    return state.items.find((item) => item.messageId === messageId);
  }, [state.items]);

  const getBuildingItem = useCallback((): ItineraryItem | undefined => {
    return state.items.find((item) => item.status === 'building');
  }, [state.items]);

  const value: ItineraryPanelContextType = {
    state,
    addItem,
    addItemWithParams,
    updateItinerary,
    updateFlights,
    setItemStatus,
    setStatusMessage,
    setItemError,
    selectItem,
    selectByMessageId,
    togglePanel,
    setPanelOpen,
    loadSavedItems,
    clearItems,
    getSelectedItem,
    getItemByMessageId,
    getBuildingItem,
  };

  return (
    <ItineraryPanelContext.Provider value={value}>
      {children}
    </ItineraryPanelContext.Provider>
  );
}

// Custom hook
export function useItineraryPanel(): ItineraryPanelContextType {
  const context = useContext(ItineraryPanelContext);
  if (!context) {
    throw new Error('useItineraryPanel must be used within an ItineraryPanelProvider');
  }
  return context;
}
