import { preferencesDataSchema, PreferencesData } from '@/lib/schemas/preferences';
import { Conversation, ChatStreamEvent } from '@/types/chat';
import type { SharedItinerary, ShareLinkResponse } from '@/types/itinerary';
import type { GeocodedLocation } from '@/types/map';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetch user preferences from the backend.
 * Applies Zod schema defaults for any missing fields.
 */
export async function fetchPreferences(): Promise<PreferencesData> {
  const response = await fetch(`${API_BASE}/preferences`);
  if (!response.ok) {
    throw new Error(`Failed to fetch preferences: ${response.status}`);
  }
  const data = await response.json();
  // Parse with Zod to apply defaults and validate
  return preferencesDataSchema.parse(data);
}

/**
 * Update user preferences in the backend.
 * Returns the saved preferences with Zod validation.
 */
export async function updatePreferences(preferences: PreferencesData): Promise<PreferencesData> {
  const response = await fetch(`${API_BASE}/preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferences),
  });
  if (!response.ok) {
    throw new Error(`Failed to update preferences: ${response.status}`);
  }
  const data = await response.json();
  // Parse with Zod to validate response
  return preferencesDataSchema.parse(data);
}

/**
 * Fetch all conversations for the current user.
 */
export async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE}/chat/conversations`);
  if (!response.ok) {
    throw new Error(`Failed to fetch conversations: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetch a single conversation with its messages.
 */
export async function fetchConversation(id: string): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/chat/conversations/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch conversation: ${response.status}`);
  }
  return response.json();
}

/**
 * Stream chat messages from Claude.
 * Uses Server-Sent Events (SSE) for real-time streaming responses.
 */
export async function* streamChat(
  message: string,
  conversationId?: string
): AsyncGenerator<ChatStreamEvent> {
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversation_id: conversationId
    })
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data) {
          try {
            yield JSON.parse(data) as ChatStreamEvent;
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
  }
}

/**
 * Fetch a shared itinerary by its share token.
 * Public endpoint - no authentication required.
 */
export async function fetchSharedItinerary(token: string): Promise<SharedItinerary> {
  const response = await fetch(`${API_BASE}/share/${token}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Share link not found or expired');
    }
    throw new Error(`Failed to fetch shared itinerary: ${response.status}`);
  }
  return response.json();
}

/**
 * Create a shareable link for an itinerary.
 */
export async function createShareLink(
  itineraryId: string,
  title?: string
): Promise<ShareLinkResponse> {
  const response = await fetch(`${API_BASE}/itineraries/${itineraryId}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create share link: ${response.status}`);
  }
  return response.json();
}

/**
 * Export itinerary as Markdown file (triggers download).
 */
export async function exportItineraryMarkdown(
  itineraryId: string,
  proposalId?: string
): Promise<Blob> {
  const params = proposalId ? `?proposal_id=${proposalId}` : '';
  const response = await fetch(
    `${API_BASE}/itineraries/${itineraryId}/export/markdown${params}`
  );
  if (!response.ok) {
    throw new Error(`Failed to export markdown: ${response.status}`);
  }
  return response.blob();
}

/**
 * Export itinerary as JSON file (triggers download).
 */
export async function exportItineraryJson(
  itineraryId: string,
  proposalId?: string
): Promise<Blob> {
  const params = proposalId ? `?proposal_id=${proposalId}` : '';
  const response = await fetch(
    `${API_BASE}/itineraries/${itineraryId}/export/json${params}`
  );
  if (!response.ok) {
    throw new Error(`Failed to export JSON: ${response.status}`);
  }
  return response.blob();
}

/**
 * Geocode a location name to coordinates.
 * Uses the destination knowledge base for known locations.
 */
export async function geocodeLocation(location: string): Promise<GeocodedLocation | null> {
  try {
    const response = await fetch(`${API_BASE}/geocoding/${encodeURIComponent(location)}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Location not found
      }
      throw new Error(`Failed to geocode location: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.warn(`Failed to geocode "${location}":`, error);
    return null;
  }
}

/**
 * List all known geocoded locations from the knowledge base.
 */
export async function listKnownLocations(): Promise<GeocodedLocation[]> {
  const response = await fetch(`${API_BASE}/geocoding`);
  if (!response.ok) {
    throw new Error(`Failed to list locations: ${response.status}`);
  }
  return response.json();
}
