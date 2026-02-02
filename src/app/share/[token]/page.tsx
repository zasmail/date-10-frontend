'use client';

import { use } from 'react';
import SharedItineraryView from '@/components/share/SharedItineraryView';

interface SharePageProps {
  params: Promise<{ token: string }>;
}

/**
 * Public share page for viewing shared itineraries.
 * No authentication required - anyone with the link can view.
 */
export default function SharePage({ params }: SharePageProps) {
  const { token } = use(params);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <SharedItineraryView token={token} />
    </main>
  );
}
