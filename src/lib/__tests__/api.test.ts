/**
 * Tests for API client functions
 */

import { streamChat } from '../api';

describe('API Client', () => {
  describe('streamChat', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should make POST request to /chat/stream', async () => {
      const mockFetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode('data: {"type":"text_chunk","text":"Hello"}\n\n'),
                })
                .mockResolvedValueOnce({ done: true }),
            }),
          },
        } as any)
      );

      global.fetch = mockFetch;

      const message = 'Create itinerary for Chile';
      const conversationId = 'test-conv-id';

      const generator = streamChat(message, conversationId);
      await generator.next();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/chat/stream',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      // Verify body contains both fields
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.message).toBe(message);
      expect(callBody.conversation_id).toBe(conversationId);
    });

    it('should throw error when response is not ok', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as any)
      );

      const generator = streamChat('message', 'test-id');

      await expect(generator.next()).rejects.toThrow('Chat request failed: 500');
    });

    it('should throw error when body is null', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          body: null,
        } as any)
      );

      const generator = streamChat('message', 'test-id');

      await expect(generator.next()).rejects.toThrow('No response body');
    });

    it('should parse SSE events correctly', async () => {
      const mockEvents = [
        'data: {"type":"text_chunk","text":"Hello"}\n\n',
        'data: {"type":"itinerary_created","itinerary":{"destination":"Chile"}}\n\n',
        'data: {"type":"done"}\n\n',
      ];

      let eventIndex = 0;
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn(() => {
                if (eventIndex < mockEvents.length) {
                  return Promise.resolve({
                    done: false,
                    value: new TextEncoder().encode(mockEvents[eventIndex++]),
                  });
                }
                return Promise.resolve({ done: true });
              }),
            }),
          },
        } as any)
      );

      const generator = streamChat('message', 'test-id');
      const events: any[] = [];

      for await (const event of generator) {
        events.push(event);
      }

      expect(events).toHaveLength(3);
      expect(events[0]).toEqual({ type: 'text_chunk', text: 'Hello' });
      expect(events[1].type).toBe('itinerary_created');
      expect(events[1].itinerary.destination).toBe('Chile');
      expect(events[2]).toEqual({ type: 'done' });
    });

    it('should handle error events from stream', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode(
                    'data: {"type":"error","message":"API Error"}\n\n'
                  ),
                })
                .mockResolvedValueOnce({ done: true }),
            }),
          },
        } as any)
      );

      const generator = streamChat('message', 'test-id');
      const events: any[] = [];

      for await (const event of generator) {
        events.push(event);
      }

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('error');
      expect(events[0].message).toBe('API Error');
    });
  });
});
