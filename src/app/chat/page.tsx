'use client';

import { Suspense, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatInterface, ChatInterfaceHandle } from '@/components/chat/ChatInterface';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { SplitViewContainer } from '@/components/chat/SplitViewContainer';
import { ItineraryPane } from '@/components/chat/ItineraryPane';
import { ItineraryPanelProvider, ItineraryBuildingParams } from '@/contexts/ItineraryPanelContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Loader2 } from 'lucide-react';

function ChatLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground">Loading chat...</p>
    </div>
  );
}

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id') || undefined;
  const [key, setKey] = useState(0); // Used to force re-mount ChatInterface
  const chatRef = useRef<ChatInterfaceHandle>(null);

  const handleCreateItinerary = useCallback((params: ItineraryBuildingParams) => {
    // Format the message to trigger itinerary generation
    const message = `Create a detailed itinerary for ${params.destination} from ${params.startDate} to ${params.endDate} for ${params.travelers} traveler${params.travelers !== 1 ? 's' : ''}.`;

    // Send the message via ChatInterface
    if (chatRef.current) {
      chatRef.current.sendMessage(message);
    }
  }, []);

  const handleSelectConversation = useCallback((id: string | null) => {
    if (id) {
      router.push(`/chat?id=${id}`);
    } else {
      router.push('/chat');
    }
  }, [router]);

  const handleNewConversation = useCallback(() => {
    router.push('/chat');
    setKey((k) => k + 1); // Force re-mount to clear state
  }, [router]);

  return (
    <ItineraryPanelProvider>
      <main className="h-screen flex flex-col overflow-hidden">
        {/* Header with navigation and help */}
        <header className="border-b shrink-0">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="icon">
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">Date 10</h1>
                <p className="text-sm text-muted-foreground">
                  Plan your perfect date or romantic getaway
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/preferences">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Link>
            </Button>
          </div>
        </header>

        {/* Main content with sidebar */}
        <div className="flex-1 flex min-h-0">
          {/* Conversation sidebar */}
          <ConversationSidebar
            currentConversationId={conversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
          />

          {/* Split View with Chat and Itinerary Panel */}
          <div className="flex-1 min-h-0">
            <SplitViewContainer
              chatPane={
                <div className="h-full p-4">
                  <ChatInterface key={key} ref={chatRef} />
                </div>
              }
              itineraryPane={<ItineraryPane onCreateItinerary={handleCreateItinerary} />}
            />
          </div>
        </div>
      </main>
    </ItineraryPanelProvider>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoading />}>
      <ChatPageContent />
    </Suspense>
  );
}
