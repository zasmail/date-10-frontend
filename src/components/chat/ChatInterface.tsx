'use client';

import { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Message, ItineraryData, FlightSearchResult, StoredItinerary } from '@/types/chat';
import { streamChat, fetchConversation, fetchHealth } from '@/lib/api';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { CreateItineraryDialog } from './CreateItineraryDialog';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, WifiOff, MapPin, Calendar } from 'lucide-react';
import { useItineraryPanel, ItineraryItem, ItineraryBuildingParams } from '@/contexts/ItineraryPanelContext';

export interface ChatInterfaceHandle {
  sendMessage: (content: string) => void;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  const config = {
    connecting: {
      icon: Loader2,
      text: 'Connecting...',
      className: 'text-yellow-600',
      iconClassName: 'animate-spin',
    },
    connected: {
      icon: CheckCircle2,
      text: 'Connected',
      className: 'text-green-600',
      iconClassName: '',
    },
    disconnected: {
      icon: WifiOff,
      text: 'Disconnected',
      className: 'text-muted-foreground',
      iconClassName: '',
    },
    error: {
      icon: AlertCircle,
      text: 'Connection error',
      className: 'text-red-600',
      iconClassName: '',
    },
  }[status];

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 text-xs ${config.className}`}>
      <Icon className={`h-3 w-3 ${config.iconClassName}`} />
      <span>{config.text}</span>
    </div>
  );
}

export const ChatInterface = forwardRef<ChatInterfaceHandle>(function ChatInterface(_props, ref) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<StoredItinerary[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const inputRef = useRef<{ focus: () => void; setValue: (value: string) => void } | null>(null);

  // Track the current building item ID for streaming updates
  const currentBuildingItemRef = useRef<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Itinerary panel context
  const {
    state,
    addItem,
    updateItinerary,
    updateFlights,
    setItemStatus,
    setStatusMessage,
    setItemError,
    loadSavedItems,
    clearItems,
    getBuildingItem,
    selectItem,
  } = useItineraryPanel();

  // Check backend health on mount
  useEffect(() => {
    let cancelled = false;

    async function checkConnection() {
      try {
        await fetchHealth();
        if (!cancelled) {
          setConnectionStatus('connected');
        }
      } catch {
        if (!cancelled) {
          setConnectionStatus('error');
        }
      }
    }

    checkConnection();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load existing conversation if ID in URL
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setConversationId(id);
      setLoadingConversation(true);
      setMessages([]);
      setSavedItineraries([]);

      // Don't clear items immediately - we want to preserve persisted building items
      // They'll be merged with backend items below

      fetchConversation(id)
        .then((conv) => {
          if (conv.messages) {
            const loadedMessages = conv.messages.map(m => ({
              ...m,
              id: m.id || uuidv4()
            }));
            setMessages(loadedMessages);
          }

          // Populate itinerary panel from saved itineraries (stored separately from messages)
          if (conv.itineraries && conv.itineraries.length > 0) {
            setSavedItineraries(conv.itineraries);

            // Convert StoredItinerary to ItineraryItem for the panel
            const backendItems: ItineraryItem[] = conv.itineraries.map((stored) => ({
              id: `saved-${stored.id}`,
              messageId: stored.id, // Use itinerary ID since there's no message link
              itinerary: {
                destination: stored.destination,
                start_date: stored.start_date,
                end_date: stored.end_date,
                num_travelers: stored.num_travelers,
                proposals: stored.proposals,
              },
              flights: undefined,
              status: 'saved' as const,
              createdAt: stored.created_at,
            }));

            // Merge with existing persisted items (keep building items, replace saved ones)
            const existingBuildingItems = state.items.filter(item => item.status === 'building');
            const mergedItems = [...existingBuildingItems, ...backendItems];
            loadSavedItems(mergedItems);
          } else {
            // No backend items, but keep any persisted building items
            const existingBuildingItems = state.items.filter(item => item.status === 'building');
            if (existingBuildingItems.length > 0) {
              loadSavedItems(existingBuildingItems);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load conversation:', err);
          setError('Failed to load conversation. Starting a new one.');
        })
        .finally(() => {
          setLoadingConversation(false);
        });
    } else {
      // New conversation - clear messages but keep building items
      setConversationId(undefined);
      setMessages([]);
      setSavedItineraries([]);

      // Keep building items, clear saved ones
      const buildingItems = state.items.filter(item => item.status === 'building');
      if (buildingItems.length !== state.items.length) {
        loadSavedItems(buildingItems);
      }
    }
  }, [searchParams, clearItems, loadSavedItems]);

  const handleSend = useCallback(async (content: string) => {
    setError(null);
    setIsLoading(true);
    currentBuildingItemRef.current = null;

    // Add user message immediately
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add empty assistant message to stream into
    const assistantId = uuidv4();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '' }
    ]);
    setStreamingMessageId(assistantId);

    try {
      for await (const event of streamChat(content, conversationId)) {
        if (event.type === 'conversation_id') {
          setConversationId(event.conversation_id);
          // Update URL with conversation ID for persistence
          router.replace(`/chat?id=${event.conversation_id}`, { scroll: false });
        } else if (event.type === 'text') {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: updated[lastIdx].content + (event.content || '')
            };
            return updated;
          });
        } else if (event.type === 'tool_start') {
          // Show tool status
          const toolName = event.tool_name === 'generate_itinerary' ? 'Creating itinerary...' :
                          event.tool_name === 'search_flights' ? 'Searching flights...' :
                          'Processing...';
          setToolStatus(toolName);

          // Create a new panel item when itinerary or flight tool starts
          if (event.tool_name === 'generate_itinerary' || event.tool_name === 'search_flights') {
            // Check if there's already a building item (e.g., from Create button)
            if (!currentBuildingItemRef.current) {
              const existingBuildingItem = getBuildingItem();
              if (existingBuildingItem) {
                // Use the existing building item
                currentBuildingItemRef.current = existingBuildingItem.id;
              } else {
                // Create a new item
                const itemId = addItem(assistantId, 'building');
                currentBuildingItemRef.current = itemId;
              }
            }
            // Update status message with more detail
            if (currentBuildingItemRef.current) {
              let statusMsg = '';
              if (event.tool_name === 'generate_itinerary') {
                // More descriptive progress for itinerary generation
                statusMsg = 'Analyzing your preferences...';
              } else if (event.tool_name === 'search_flights') {
                statusMsg = 'Searching for flights...';
              } else {
                statusMsg = `Running ${event.tool_name}...`;
              }
              setStatusMessage(currentBuildingItemRef.current, statusMsg);
            }
          }
        } else if (event.type === 'flight_search_start') {
          setToolStatus('Searching for flights...');
          // Create panel item if not already created
          if (!currentBuildingItemRef.current) {
            const existingBuildingItem = getBuildingItem();
            if (existingBuildingItem) {
              currentBuildingItemRef.current = existingBuildingItem.id;
            } else {
              const itemId = addItem(assistantId, 'building');
              currentBuildingItemRef.current = itemId;
            }
          }
          if (currentBuildingItemRef.current) {
            setStatusMessage(currentBuildingItemRef.current, 'Searching for flights...');
          }
        } else if (event.type === 'itinerary') {
          // Add itinerary to the current assistant message
          setToolStatus(null);
          const itineraryData = event.data as ItineraryData;
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              ...updated[lastIdx],
              itinerary: itineraryData
            };
            return updated;
          });

          // Update the panel item with itinerary data
          if (currentBuildingItemRef.current) {
            updateItinerary(currentBuildingItemRef.current, itineraryData);
          }
        } else if (event.type === 'flights') {
          // Add flights to the current assistant message
          setToolStatus(null);
          const flightsData = event.data as FlightSearchResult;
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              ...updated[lastIdx],
              flights: flightsData
            };
            return updated;
          });

          // Update the panel item with flights data
          if (currentBuildingItemRef.current) {
            updateFlights(currentBuildingItemRef.current, flightsData);
          }
        } else if (event.type === 'tool_error') {
          setToolStatus(null);
          console.error('Tool error:', event.error);
        } else if (event.type === 'done') {
          // Streaming complete - mark item as complete
          setToolStatus(null);
          setStreamingMessageId(null);
          if (currentBuildingItemRef.current) {
            // Briefly show finalizing before marking complete
            setStatusMessage(currentBuildingItemRef.current, 'Finalizing...');
            // Small delay to show the finalizing status
            setTimeout(() => {
              if (currentBuildingItemRef.current) {
                setItemStatus(currentBuildingItemRef.current, 'complete');
                currentBuildingItemRef.current = null;
              }
            }, 500);
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the empty assistant message on error
      setMessages((prev) => prev.slice(0, -1));
      // Update connection status on error
      setConnectionStatus('error');
      setToolStatus(null);
      setStreamingMessageId(null);
      currentBuildingItemRef.current = null;
    } finally {
      setIsLoading(false);
      setToolStatus(null);
    }
  }, [conversationId, router, addItem, updateItinerary, updateFlights, setItemStatus]);

  const handleExampleClick = useCallback((prompt: string) => {
    handleSend(prompt);
  }, [handleSend]);

  // Handle creating a new itinerary from the dialog
  const handleCreateItinerary = useCallback((params: ItineraryBuildingParams, panelItemId: string) => {
    // Track that we're creating for this panel item
    currentBuildingItemRef.current = panelItemId;

    // Send a message to Claude to generate the itinerary
    const prompt = `Create a detailed travel itinerary for ${params.destination} from ${params.startDate} to ${params.endDate} for ${params.travelers} traveler${params.travelers > 1 ? 's' : ''}.`;
    handleSend(prompt);
  }, [handleSend]);

  // Expose sendMessage method via ref for programmatic access
  useImperativeHandle(ref, () => ({
    sendMessage: handleSend,
  }), [handleSend]);

  return (
    <Card className="flex flex-col h-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="flex flex-col flex-1 p-0 min-h-0">
        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-4">
            <ConnectionIndicator status={connectionStatus} />
            {conversationId && (
              <span className="text-xs text-muted-foreground">
                Conversation saved
              </span>
            )}
            {savedItineraries.length > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {savedItineraries.length} itinerar{savedItineraries.length !== 1 ? 'ies' : 'y'}
              </span>
            )}
          </div>
          {messages.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Saved itineraries summary */}
        {savedItineraries.length > 0 && (
          <div className="px-4 py-2 border-b bg-primary/5 shrink-0">
            <div className="text-xs font-medium mb-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Saved Itineraries
            </div>
            <div className="flex flex-wrap gap-2">
              {savedItineraries.map((it) => (
                <div
                  key={it.id}
                  className="text-xs bg-background rounded px-2 py-1 border"
                >
                  <span className="font-medium">{it.destination}</span>
                  <span className="text-muted-foreground ml-1">
                    {it.start_date} - {it.end_date}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    ({it.proposals.length} proposals)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 text-sm shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading conversation indicator */}
        {loadingConversation && (
          <div className="flex items-center gap-2 bg-muted px-4 py-2 text-sm text-muted-foreground shrink-0">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading conversation...</span>
          </div>
        )}

        {/* Message list */}
        <MessageList
          messages={messages}
          streamingMessageId={streamingMessageId}
          toolStatus={toolStatus}
          onExampleClick={handleExampleClick}
        />

        {/* Chat input */}
        <ChatInput
          ref={inputRef}
          onSend={handleSend}
          disabled={isLoading || connectionStatus === 'error'}
          itineraryItems={state.items}
          selectedItineraryId={state.selectedId}
          onItinerarySelect={selectItem}
          onCreateItinerary={() => setShowCreateDialog(true)}
        />
      </CardContent>

      {/* Create itinerary dialog */}
      <CreateItineraryDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateItinerary}
      />
    </Card>
  );
});
