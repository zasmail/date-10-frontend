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

interface BudgetSectionProps {
  form: UseFormReturn<PreferencesData>;
}

/**
 * Budget section of the preferences form.
 * Manages currency and budget preferences.
 */
export function BudgetSection({ form }: BudgetSectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="budget.currency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Currency</FormLabel>
            <FormDescription>
              Your preferred currency for budgeting
            </FormDescription>
            <FormControl>
              <Input placeholder="USD" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="budget.daily_budget"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Daily Budget (optional)</FormLabel>
            <FormDescription>
              Target spending per day for activities, food, and transport
            </FormDescription>
            <FormControl>
              <Input
                type="number"
                min={0}
                placeholder="Leave blank for no limit"
                value={field.value ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === '' ? null : Number(value));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="budget.flight_budget_per_person"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Flight Budget Per Person (optional)</FormLabel>
            <FormDescription>
              Maximum amount to spend on flights per traveler
            </FormDescription>
            <FormControl>
              <Input
                type="number"
                min={0}
                placeholder="Leave blank for no limit"
                value={field.value ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === '' ? null : Number(value));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
