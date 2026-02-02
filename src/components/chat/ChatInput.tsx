'use client';

import { useState, FormEvent, KeyboardEvent, forwardRef, useImperativeHandle, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export interface ChatInputRef {
  focus: () => void;
  setValue: (value: string) => void;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  function ChatInput({ onSend, disabled }, ref) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      setValue: (value: string) => setInput(value),
    }));

    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      if (input.trim() && !disabled) {
        onSend(input.trim());
        setInput('');
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Enter (without Shift)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    const characterCount = input.length;
    const isNearLimit = characterCount > 1800;

    return (
      <form onSubmit={handleSubmit} className="p-4 border-t shrink-0 bg-background">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "Waiting for response..." : "Describe your date ideas, ask for recommendations..."}
              disabled={disabled}
              className="min-h-[60px] resize-none pr-12"
              rows={2}
            />
            {isNearLimit && (
              <span className={`absolute bottom-2 right-2 text-xs ${characterCount > 2000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {characterCount}/2000
              </span>
            )}
          </div>
          <Button
            type="submit"
            disabled={disabled || !input.trim() || characterCount > 2000}
            className="h-auto"
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">Enter</kbd> to send
            <span className="mx-1.5">·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">Shift+Enter</kbd> for new line
          </p>
          {disabled && (
            <span className="text-xs text-muted-foreground animate-pulse">
              AI is thinking...
            </span>
          )}
        </div>
      </form>
    );
  }
);
