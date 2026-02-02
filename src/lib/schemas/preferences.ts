import { z } from 'zod';

/**
 * Zod schemas for user travel preferences, matching backend PreferencesData structure.
 */

export const travelerProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
});

/**
 * Default seeded preferences for Zo & Sarah's adventure travel style.
 */
export const DEFAULT_TRAVELERS = [
  {
    name: 'Zo',
    description: 'Primary traveler. American, based in NYC. Technical/product engineer. Kitesurfer. Very comfortable with logistics and planning. Prefers to control routing and timing. Needs reliable Wi-Fi for work most of the time.',
  },
  {
    name: 'Sarah',
    description: 'Former adventure scout ranger and trekking guide. Highly competent outdoors (treks, ropes). Creative — interior designer. Small, skilled, adventurous duo who can handle self-reliant missions but prefer vetted local guides for technical lines.',
  },
];

export const DEFAULT_BUCKET_LIST = [
  'Siargao, Philippines',
  'El Nido, Palawan',
  'Coron, Philippines',
  'Pucón, Chile',
  'Cochamó Valley, Chile',
  'Mendoza, Argentina',
  'El Chaltén, Patagonia',
  'Futaleufú, Chile',
  'Santa Catalina, Panama',
  'Bocas del Toro, Panama',
  'Boquete, Panama',
  'Ha Giang, Vietnam',
  'Phan Rang, Vietnam',
];

export const DEFAULT_VISITED = [
  'Moalboal, Cebu',
  'Badian, Cebu',
  'Boracay, Philippines',
  'Siquijor, Philippines',
];

export const DEFAULT_NO_GO = [
  'Overly touristy, crowded resorts',
  'Generic hotel chains',
  'One-night hotel hops',
];

export const DEFAULT_ACTIVITIES = [
  'Kitesurfing',
  'Surfing',
  'Cliff jumping',
  'Canyoning / canyoneering',
  'Volcano treks',
  'Multi-day technical hikes',
  'Motorcycle / dirt-bike missions',
  'Skydiving',
  'Spearfishing',
  'Freediving',
  'Cooking classes',
  'Boxing / local gyms',
];

export const DEFAULT_ACCOMMODATION_REQUIREMENTS = [
  'Boutique, Balinese-style design',
  'Wood, water, fire elements',
  'Private outdoor space',
  'Reliable Wi-Fi / good desk',
  'Nature-integrated, barefoot luxe',
  'Small batch, sense of place',
];

export const DEFAULT_NOTES = `## Adventure & Date Style
- Small, skilled, adventurous duo who prefer vetted local guides for technical lines
- Prefer 2-3 night blocks per destination (avoid 1-night stands)
- Stack adventures on arrival/departure days when reasonable
- Allow 1 intentional off-grid weekend (no Wi-Fi) per trip when desired

## Operators & Guides
- Private or small group guides preferred (2-person bookings)
- Coyote-Adventures vibe: small, skilled, flexible, local knowledge, safety oriented
- For technical water/canyon routes: operators who run advanced routes

## Food & Culture
- One cooking class per trip
- Top-tier restaurants and local food experiences
- Interested in boxing gyms and local training options

## Trip Windows
- Typical trips around Christmas (arrive ~Dec 25), returning Jan 5-6
- Prefers morning/early flights to maximize same-day activity
- Cognizant of wind/monsoon/swell seasons for kitesurfing and surf`;

// Strict schemas for form validation (no top-level defaults, used with react-hook-form)
export const destinationPreferencesStrictSchema = z.object({
  bucket_list: z.array(z.string()),
  visited: z.array(z.string()),
  no_go: z.array(z.string()),
});

export const activityPreferencesStrictSchema = z.object({
  preferred: z.array(z.string()),
  intensity_level: z.enum(['low', 'medium', 'high']),
});

export const accommodationPreferencesStrictSchema = z.object({
  style: z.enum(['boutique', 'resort', 'airbnb', 'hostel']),
  max_nightly_rate: z.number().min(0).max(10000),
  requirements: z.array(z.string()),
});

export const budgetPreferencesStrictSchema = z.object({
  currency: z.string(),
  daily_budget: z.number().nullable(),
  flight_budget_per_person: z.number().nullable(),
});

// Form schema without top-level defaults (for react-hook-form validation)
export const preferencesFormSchema = z.object({
  travelers: z.array(travelerProfileSchema),
  destinations: destinationPreferencesStrictSchema,
  activities: activityPreferencesStrictSchema,
  accommodation: accommodationPreferencesStrictSchema,
  budget: budgetPreferencesStrictSchema,
  notes: z.string().nullable(),
});

// Schemas with defaults (for API response parsing)
export const destinationPreferencesSchema = z.object({
  bucket_list: z.array(z.string()).default(DEFAULT_BUCKET_LIST),
  visited: z.array(z.string()).default(DEFAULT_VISITED),
  no_go: z.array(z.string()).default(DEFAULT_NO_GO),
});

export const activityPreferencesSchema = z.object({
  preferred: z.array(z.string()).default(DEFAULT_ACTIVITIES),
  intensity_level: z.enum(['low', 'medium', 'high']).default('high'),
});

export const accommodationPreferencesSchema = z.object({
  style: z.enum(['boutique', 'resort', 'airbnb', 'hostel']).default('boutique'),
  max_nightly_rate: z.number().min(0).max(10000).default(500),
  requirements: z.array(z.string()).default(DEFAULT_ACCOMMODATION_REQUIREMENTS),
});

export const budgetPreferencesSchema = z.object({
  currency: z.string().default('USD'),
  daily_budget: z.number().nullable().default(300),
  flight_budget_per_person: z.number().nullable().default(1500),
});

// Schema with defaults for parsing API responses
export const preferencesDataSchema = z.object({
  travelers: z.array(travelerProfileSchema).default(DEFAULT_TRAVELERS),
  destinations: destinationPreferencesSchema.default(() => ({
    bucket_list: DEFAULT_BUCKET_LIST,
    visited: DEFAULT_VISITED,
    no_go: DEFAULT_NO_GO,
  })),
  activities: activityPreferencesSchema.default(() => ({
    preferred: DEFAULT_ACTIVITIES,
    intensity_level: 'high' as const,
  })),
  accommodation: accommodationPreferencesSchema.default(() => ({
    style: 'boutique' as const,
    max_nightly_rate: 500,
    requirements: DEFAULT_ACCOMMODATION_REQUIREMENTS,
  })),
  budget: budgetPreferencesSchema.default(() => ({
    currency: 'USD',
    daily_budget: 300,
    flight_budget_per_person: 1500,
  })),
  notes: z.string().nullable().default(DEFAULT_NOTES),
});

export type TravelerProfile = z.infer<typeof travelerProfileSchema>;
export type DestinationPreferences = z.output<typeof destinationPreferencesSchema>;
export type ActivityPreferences = z.output<typeof activityPreferencesSchema>;
export type AccommodationPreferences = z.output<typeof accommodationPreferencesSchema>;
export type BudgetPreferences = z.output<typeof budgetPreferencesSchema>;
// Use z.output to get the type after defaults are applied
export type PreferencesData = z.output<typeof preferencesDataSchema>;
