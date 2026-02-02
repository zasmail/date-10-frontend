'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Message, ItineraryData, FlightSearchResult } from '@/types/chat';
import { streamChat, fetchConversation, fetchHealth } from '@/lib/api';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, WifiOff, Plane, Map } from 'lucide-react';

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

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const inputRef = useRef<{ focus: () => void; setValue: (value: string) => void } | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

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
      fetchConversation(id)
        .then((conv) => {
          if (conv.messages) {
            setMessages(conv.messages.map(m => ({
              ...m,
              id: m.id || uuidv4()
            })));
          }
        })
        .catch((err) => {
          console.error('Failed to load conversation:', err);
          setError('Failed to load conversation. Starting a new one.');
        })
        .finally(() => {
          setLoadingConversation(false);
        });
    }
  }, [searchParams]);

  const handleSend = useCallback(async (content: string) => {
    setError(null);
    setIsLoading(true);

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
        } else if (event.type === 'flight_search_start') {
          setToolStatus('Searching for flights...');
        } else if (event.type === 'itinerary') {
          // Add itinerary to the current assistant message
          setToolStatus(null);
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              ...updated[lastIdx],
              itinerary: event.data as ItineraryData
            };
            return updated;
          });
        } else if (event.type === 'flights') {
          // Add flights to the current assistant message
          setToolStatus(null);
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              ...updated[lastIdx],
              flights: event.data as FlightSearchResult
            };
            return updated;
          });
        } else if (event.type === 'tool_error') {
          setToolStatus(null);
          console.error('Tool error:', event.error);
        } else if (event.type === 'done') {
          // Streaming complete
          setToolStatus(null);
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
    } finally {
      setIsLoading(false);
      setToolStatus(null);
    }
  }, [conversationId, router]);

  const handleExampleClick = useCallback((prompt: string) => {
    handleSend(prompt);
  }, [handleSend]);

  const isShowingTypingIndicator = isLoading && messages[messages.length - 1]?.content === '';

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
          </div>
          {messages.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

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
          isLoading={isShowingTypingIndicator}
          toolStatus={toolStatus}
          onExampleClick={handleExampleClick}
        />

        {/* Chat input */}
        <ChatInput
          ref={inputRef}
          onSend={handleSend}
          disabled={isLoading || connectionStatus === 'error'}
        />
      </CardContent>
    </Card>
  );
}
