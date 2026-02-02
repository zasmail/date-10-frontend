'use client';

import { UseFormReturn } from 'react-hook-form';
import { PreferencesData } from '@/lib/schemas/preferences';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from './TagInput';

interface ActivitiesSectionProps {
  form: UseFormReturn<PreferencesData>;
}

/**
 * Activities section of the preferences form.
 * Manages preferred activities and intensity level.
 */
export function ActivitiesSection({ form }: ActivitiesSectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="activities.preferred"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Activities</FormLabel>
            <FormDescription>
              Types of activities you enjoy (hiking, diving, museums, food tours, etc.)
            </FormDescription>
            <FormControl>
              <TagInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Type an activity and press Enter..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="activities.intensity_level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Activity Intensity</FormLabel>
            <FormDescription>
              How physically demanding should activities be?
            </FormDescription>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select intensity level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">Low - Relaxed, minimal physical activity</SelectItem>
                <SelectItem value="medium">Medium - Moderate activity levels</SelectItem>
                <SelectItem value="high">High - Active adventures, challenging experiences</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
