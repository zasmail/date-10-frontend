'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchHealth } from '@/lib/api';
import { MessageSquare, Settings, Share2, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';

type HealthStatus = 'checking' | 'healthy' | 'error';

function StatusBadge({ status, error }: { status: HealthStatus; error: string | null }) {
  const config = {
    checking: {
      icon: Loader2,
      text: 'Connecting...',
      className: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      iconClassName: 'animate-spin',
    },
    healthy: {
      icon: CheckCircle2,
      text: 'Connected',
      className: 'text-green-600 bg-green-50 border-green-200',
      iconClassName: '',
    },
    error: {
      icon: XCircle,
      text: 'Offline',
      className: 'text-red-600 bg-red-50 border-red-200',
      iconClassName: '',
    },
  }[status];

  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${config.className}`}>
      <Icon className={`h-4 w-4 ${config.iconClassName}`} />
      <span>{config.text}</span>
      {error && status === 'error' && (
        <span className="text-xs font-normal ml-1">({error})</span>
      )}
    </div>
  );
}

const WORKFLOW_STEPS = [
  {
    step: 1,
    title: 'Set Preferences',
    description: 'Tell us about your date style, budget, and interests',
    icon: Settings,
    href: '/preferences',
    optional: true,
  },
  {
    step: 2,
    title: 'Chat with AI',
    description: 'Describe your dream date and get personalized suggestions',
    icon: MessageSquare,
    href: '/chat',
    optional: false,
  },
  {
    step: 3,
    title: 'Share Plans',
    description: 'Share your date plans with your partner',
    icon: Share2,
    href: null,
    optional: true,
  },
];

export default function Home() {
  const [health, setHealth] = useState<HealthStatus>('checking');
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setHealth('checking');
    setError(null);
    try {
      const data = await fetchHealth();
      setHealth(data.status === 'healthy' ? 'healthy' : 'error');
    } catch (err) {
      setError((err as Error).message);
      setHealth('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const doFetch = async () => {
      try {
        const data = await fetchHealth();
        if (!cancelled) {
          setHealth(data.status === 'healthy' ? 'healthy' : 'error');
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          setHealth('error');
        }
      }
    };

    doFetch();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">Date 10</h1>
          <p className="text-xl text-muted-foreground max-w-md">
            Your AI-powered date planning assistant. Plan perfect dates, romantic getaways, and unforgettable experiences together.
          </p>
        </div>

        {/* App Screenshot */}
        <div className="relative w-full max-w-md mx-auto mt-4">
          <div className="rounded-xl overflow-hidden shadow-2xl border border-border/50 bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://i.imgur.com/5MhcaGK.png"
              alt="Date 10 chat interface showing AI-powered date planning"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <StatusBadge status={health} error={error} />
          {health !== 'checking' && (
            <Button variant="ghost" size="icon" onClick={checkHealth} className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 mt-2">
          <Button asChild size="lg" disabled={health === 'error'}>
            <Link href="/chat">
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Planning
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/preferences">
              <Settings className="mr-2 h-5 w-5" />
              Set Preferences
            </Link>
          </Button>
        </div>

        {health === 'error' && (
          <p className="text-sm text-muted-foreground">
            The backend service is unavailable. Some features may not work.
          </p>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 border-t py-12 px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {WORKFLOW_STEPS.map((step) => (
              <Card key={step.step} className="relative">
                {step.optional && (
                  <span className="absolute top-3 right-3 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Optional
                  </span>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {step.description}
                  </CardDescription>
                  {step.href && (
                    <Button asChild variant="link" className="mt-2 p-0 h-auto">
                      <Link href={step.href}>
                        {step.step === 1 ? 'Configure now' : 'Get started'} →
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
