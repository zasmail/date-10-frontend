import { Suspense } from 'react';
import Link from 'next/link';
import { ChatInterface } from '@/components/chat/ChatInterface';
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

export default function ChatPage() {
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      {/* Header with navigation and help */}
      <header className="border-b shrink-0">
        <div className="container py-3 flex items-center justify-between">
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

      {/* Chat Interface */}
      <div className="container flex-1 pb-4 pt-4 min-h-0">
        <Suspense fallback={<ChatLoading />}>
          <ChatInterface />
        </Suspense>
      </div>
    </main>
  );
}
