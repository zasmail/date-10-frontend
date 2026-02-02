'use client';

import { UseFormReturn } from 'react-hook-form';
import { PreferencesData } from '@/lib/schemas/preferences';
import { Input } from '@/components/ui/input';
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

interface AccommodationSectionProps {
  form: UseFormReturn<PreferencesData>;
}

/**
 * Accommodation section of the preferences form.
 * Manages accommodation style, budget, and requirements.
 */
export function AccommodationSection({ form }: AccommodationSectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="accommodation.style"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Accommodation Style</FormLabel>
            <FormDescription>
              Your preferred type of accommodation
            </FormDescription>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select accommodation style" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="boutique">Boutique Hotels - Unique, character-rich stays</SelectItem>
                <SelectItem value="resort">Resorts - Full-service amenities and luxury</SelectItem>
                <SelectItem value="airbnb">Airbnb/Vacation Rentals - Local living experience</SelectItem>
                <SelectItem value="hostel">Hostels - Budget-friendly, social atmosphere</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="accommodation.max_nightly_rate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Nightly Rate (USD)</FormLabel>
            <FormDescription>
              Your upper budget limit per night
            </FormDescription>
            <FormControl>
              <Input
                type="number"
                min={0}
                max={10000}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="accommodation.requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Requirements</FormLabel>
            <FormDescription>
              Must-have amenities (wifi, pool, kitchen, parking, gym, etc.)
            </FormDescription>
            <FormControl>
              <TagInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Type a requirement and press Enter..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
