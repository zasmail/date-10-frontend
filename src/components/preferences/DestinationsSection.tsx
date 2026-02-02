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
import { TagInput } from './TagInput';

interface DestinationsSectionProps {
  form: UseFormReturn<PreferencesData>;
}

/**
 * Destinations section of the preferences form.
 * Manages bucket list, visited places, and places to avoid.
 */
export function DestinationsSection({ form }: DestinationsSectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="destinations.bucket_list"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bucket List</FormLabel>
            <FormDescription>
              Places you dream of visiting
            </FormDescription>
            <FormControl>
              <TagInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Type a destination and press Enter..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="destinations.visited"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Already Visited</FormLabel>
            <FormDescription>
              Places you have been (helps avoid repetitive suggestions)
            </FormDescription>
            <FormControl>
              <TagInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Type a destination and press Enter..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="destinations.no_go"
        render={({ field }) => (
          <FormItem>
            <FormLabel>No-Go List</FormLabel>
            <FormDescription>
              Places you want to avoid
            </FormDescription>
            <FormControl>
              <TagInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Type a destination and press Enter..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
