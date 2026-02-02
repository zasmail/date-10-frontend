'use client';

import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { ItineraryChip } from './ItineraryChip';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  streamingStatus?: string | null;
}

function InlineTypingIndicator({ status }: { status?: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
      </div>
      {status && <span className="text-sm text-muted-foreground">{status}</span>}
    </div>
  );
}

export function MessageBubble({ message, isStreaming, streamingStatus }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const showTypingIndicator = isStreaming && !message.content;

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[90%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div>
            {showTypingIndicator ? (
              <InlineTypingIndicator status={streamingStatus} />
            ) : (
              <>
                {message.content && (
                  <div className="markdown-content">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-semibold mt-3 mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>,
                        p: ({ children }) => <p className="my-2">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="ml-2">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        code: ({ children }) => (
                          <code className="bg-background/50 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-background/50 p-3 rounded-md overflow-x-auto my-2 text-sm">{children}</pre>
                        ),
                        a: ({ href, children }) => (
                          <a href={href} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-primary/30 pl-4 my-2 italic">{children}</blockquote>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Render itinerary/flights chip if present */}
                {(message.itinerary || message.flights) && (
                  <ItineraryChip
                    messageId={message.id}
                    itinerary={message.itinerary}
                    flights={message.flights}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
