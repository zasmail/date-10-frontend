'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { Compass, MapPin, Calendar, Sparkles } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onExampleClick?: (prompt: string) => void;
}

const EXAMPLE_PROMPTS = [
  {
    icon: Compass,
    title: 'Romantic getaways',
    prompt: 'What are the most romantic destinations for a weekend trip from NYC?',
  },
  {
    icon: Calendar,
    title: 'Plan a date trip',
    prompt: 'Plan a 3-day romantic trip to Paris for our anniversary',
  },
  {
    icon: MapPin,
    title: 'Date ideas',
    prompt: 'What are unique date experiences we should try in San Francisco?',
  },
  {
    icon: Sparkles,
    title: 'Special occasions',
    prompt: 'Help me plan a surprise birthday trip for my partner',
  },
];

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onExampleClick }: { onExampleClick?: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 px-4">
      <div className="text-center max-w-lg">
        <div className="mb-4">
          <Compass className="h-12 w-12 mx-auto text-primary/60" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Welcome to Date 10</h2>
        <p className="text-muted-foreground mb-6">
          I'm your AI date planning assistant. Ask me about romantic destinations, date ideas, activities, or help planning your perfect getaway.
        </p>

        <div className="text-left">
          <p className="text-sm font-medium text-muted-foreground mb-3">Try asking:</p>
          <div className="grid gap-2">
            {EXAMPLE_PROMPTS.map((example, index) => {
              const Icon = example.icon;
              return (
                <button
                  key={index}
                  onClick={() => onExampleClick?.(example.prompt)}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left group"
                >
                  <div className="flex-shrink-0 p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{example.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{example.prompt}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Tip: Set your date preferences for more personalized recommendations
        </p>
      </div>
    </div>
  );
}

export function MessageList({ messages, isLoading, onExampleClick }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
      {messages.length === 0 && !isLoading ? (
        <WelcomeScreen onExampleClick={onExampleClick} />
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && <TypingIndicator />}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
