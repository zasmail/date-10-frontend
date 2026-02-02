'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { preferencesFormSchema, PreferencesData } from '@/lib/schemas/preferences';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProfileSection } from './ProfileSection';
import { DestinationsSection } from './DestinationsSection';
import { ActivitiesSection } from './ActivitiesSection';
import { AccommodationSection } from './AccommodationSection';
import { BudgetSection } from './BudgetSection';
import { User, MapPin, Activity, Building2, Wallet, Loader2, Check, AlertCircle, Info } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

interface PreferencesFormProps {
  defaultValues: PreferencesData;
  onSubmit: (data: PreferencesData) => Promise<void>;
  saving: boolean;
}

type SectionStatus = 'empty' | 'partial' | 'complete';

interface SectionConfig {
  id: string;
  title: string;
  icon: typeof User;
  helpText: string;
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'profile',
    title: 'Profile',
    icon: User,
    helpText: 'Add travelers with their skills and preferences for personalized adventure recommendations.',
  },
  {
    id: 'destinations',
    title: 'Destinations',
    icon: MapPin,
    helpText: 'Your bucket list destinations, places visited, and spots to avoid.',
  },
  {
    id: 'activities',
    title: 'Activities',
    icon: Activity,
    helpText: 'Adventure activities you love — kitesurfing, canyoning, treks, and more.',
  },
  {
    id: 'accommodation',
    title: 'Accommodation',
    icon: Building2,
    helpText: 'Boutique stays, design preferences, and must-have amenities.',
  },
  {
    id: 'budget',
    title: 'Budget',
    icon: Wallet,
    helpText: 'Daily budget and flight budget to keep recommendations realistic.',
  },
];

function SectionStatusIndicator({ status }: { status: SectionStatus }) {
  if (status === 'complete') {
    return (
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white">
        <Check className="h-2.5 w-2.5" />
      </span>
    );
  }
  if (status === 'partial') {
    return (
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      </span>
    );
  }
  return null;
}

function ProgressBar({ sections }: { sections: Record<string, SectionStatus> }) {
  const completed = Object.values(sections).filter(s => s === 'complete').length;
  const partial = Object.values(sections).filter(s => s === 'partial').length;
  const total = Object.keys(sections).length;
  const percentage = Math.round(((completed + partial * 0.5) / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Profile completion</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {completed === total
          ? 'All sections complete! Your preferences are ready.'
          : `${completed} of ${total} sections complete`}
      </p>
    </div>
  );
}

/**
 * Main preferences form with tabbed sections for different preference categories.
 */
export function PreferencesForm({ defaultValues, onSubmit, saving }: PreferencesFormProps) {
  const form = useForm<PreferencesData>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues,
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Reset unsaved changes flag after successful save
  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
    setHasUnsavedChanges(false);
  });

  // Calculate section statuses based on form values
  const sectionStatuses = useMemo(() => {
    const values = form.getValues();

    const getProfileStatus = (): SectionStatus => {
      if (values.travelers.length === 0) return 'empty';
      if (values.travelers.every(t => t.name && t.description)) return 'complete';
      return 'partial';
    };

    const getDestinationsStatus = (): SectionStatus => {
      const { bucket_list, visited } = values.destinations;
      if (bucket_list.length === 0 && visited.length === 0) return 'empty';
      if (bucket_list.length > 0) return 'complete';
      return 'partial';
    };

    const getActivitiesStatus = (): SectionStatus => {
      if (values.activities.preferred.length === 0) return 'empty';
      if (values.activities.preferred.length >= 2) return 'complete';
      return 'partial';
    };

    const getAccommodationStatus = (): SectionStatus => {
      // Has defaults, so check if user has customized
      if (values.accommodation.requirements.length > 0) return 'complete';
      return 'partial'; // Has defaults set
    };

    const getBudgetStatus = (): SectionStatus => {
      const { daily_budget, flight_budget_per_person } = values.budget;
      if (!daily_budget && !flight_budget_per_person) return 'empty';
      if (daily_budget && flight_budget_per_person) return 'complete';
      return 'partial';
    };

    return {
      profile: getProfileStatus(),
      destinations: getDestinationsStatus(),
      activities: getActivitiesStatus(),
      accommodation: getAccommodationStatus(),
      budget: getBudgetStatus(),
    };
  }, [form.watch()]);

  const activeSection = SECTIONS.find(s => s.id === activeTab);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Date Preferences</CardTitle>
                <CardDescription>
                  Configure your preferences to get personalized date recommendations.
                </CardDescription>
              </div>
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full">
                  <AlertCircle className="h-4 w-4" />
                  <span>Unsaved changes</span>
                </div>
              )}
            </div>
            <div className="pt-4">
              <ProgressBar sections={sectionStatuses} />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const status = sectionStatuses[section.id as keyof typeof sectionStatuses];
                  return (
                    <TabsTrigger key={section.id} value={section.id} className="gap-2 relative">
                      <div className="relative">
                        <Icon className="h-4 w-4" />
                        <SectionStatusIndicator status={status} />
                      </div>
                      {section.title}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Section help text */}
              {activeSection && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{activeSection.helpText}</span>
                </div>
              )}

              <div className="mt-6">
                <TabsContent value="profile">
                  <ProfileSection form={form} />
                </TabsContent>

                <TabsContent value="destinations">
                  <DestinationsSection form={form} />
                </TabsContent>

                <TabsContent value="activities">
                  <ActivitiesSection form={form} />
                </TabsContent>

                <TabsContent value="accommodation">
                  <AccommodationSection form={form} />
                </TabsContent>

                <TabsContent value="budget">
                  <BudgetSection form={form} />
                </TabsContent>
              </div>
            </Tabs>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Your preferences are used to personalize date recommendations
              </p>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
