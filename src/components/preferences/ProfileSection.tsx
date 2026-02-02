'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { PreferencesData } from '@/lib/schemas/preferences';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';

interface ProfileSectionProps {
  form: UseFormReturn<PreferencesData>;
}

/**
 * Profile section of the preferences form.
 * Manages the list of travelers and general notes.
 */
export function ProfileSection({ form }: ProfileSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'travelers',
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Travelers</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '', description: '' })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Traveler
          </Button>
        </div>

        {fields.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No travelers added yet. Add travelers to personalize recommendations.
          </p>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Traveler {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <FormField
              control={form.control}
              name={`travelers.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`travelers.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Travel preferences, dietary restrictions, accessibility needs..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>General Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any additional preferences or notes for trip planning..."
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
