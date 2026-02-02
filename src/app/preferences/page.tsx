'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PreferencesData } from '@/lib/schemas/preferences';
import { fetchPreferences, updatePreferences } from '@/lib/api';
import { PreferencesForm } from '@/components/preferences/PreferencesForm';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, MessageSquare, CheckCircle2 } from 'lucide-react';

/**
 * Preferences page - allows users to view and edit their travel preferences.
 */
export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<PreferencesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPreferences() {
      try {
        const data = await fetchPreferences();
        if (!cancelled) {
          setPreferences(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load preferences');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPreferences();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (data: PreferencesData) => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      const saved = await updatePreferences(data);
      setPreferences(saved);
      setSaveSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b shrink-0">
          <div className="container max-w-4xl mx-auto py-3 flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Date Preferences</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading your preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !preferences) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b shrink-0">
          <div className="container max-w-4xl mx-auto py-3 flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Date Preferences</h1>
          </div>
        </header>
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
            <h2 className="text-lg font-semibold text-destructive mb-2">Unable to Load Preferences</h2>
            <p className="text-sm text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with navigation */}
      <header className="border-b shrink-0">
        <div className="container max-w-4xl mx-auto py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Date Preferences</h1>
              <p className="text-sm text-muted-foreground">
                Personalize your date recommendations
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Planning
            </Link>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container max-w-4xl mx-auto py-8 px-4">
        {/* Success message */}
        {saveSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Preferences saved successfully!</p>
              <p className="text-sm">Your date recommendations will now be personalized.</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Info banner */}
        <div className="mb-6 rounded-lg border bg-muted/30 p-4">
          <h2 className="font-medium mb-1">Why set preferences?</h2>
          <p className="text-sm text-muted-foreground">
            Your preferences help our AI understand your date style, budget, and interests.
            This enables more relevant and personalized date recommendations when you use the chat.
          </p>
        </div>

        {preferences && (
          <PreferencesForm
            defaultValues={preferences}
            onSubmit={handleSubmit}
            saving={saving}
          />
        )}
      </main>
    </div>
  );
}
