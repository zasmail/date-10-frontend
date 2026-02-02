/**
 * Tests for chat type definitions
 */

import type {
  ItineraryActivity,
  ItineraryDay,
  ItineraryProposal,
  ItineraryData,
} from '../chat';

describe('Chat Types', () => {
  describe('ItineraryActivity', () => {
    it('should accept valid activity', () => {
      const activity: ItineraryActivity = {
        time: '14:00',
        name: 'City tour',
        description: 'Explore Santiago',
        duration: '3 hours',
      };

      expect(activity.time).toBe('14:00');
      expect(activity.name).toBe('City tour');
    });

    it('should accept activity with optional fields', () => {
      const activity: ItineraryActivity = {
        time: '14:00',
        name: 'City tour',
        description: 'Explore',
        duration: '3 hours',
        location: 'Downtown',
        cost_estimate: '$50',
        booking_required: true,
      };

      expect(activity.location).toBe('Downtown');
      expect(activity.booking_required).toBe(true);
    });
  });

  describe('ItineraryDay', () => {
    it('should accept valid day', () => {
      const day: ItineraryDay = {
        day_number: 1,
        date: '2026-02-11',
        title: 'Arrival',
        location: 'Santiago',
        activities: [
          {
            time: '14:00',
            name: 'Airport pickup',
            description: 'Transfer',
            duration: '1 hour',
          },
        ],
      };

      expect(day.day_number).toBe(1);
      expect(day.activities).toHaveLength(1);
    });

    it('should accept day with accommodation and notes', () => {
      const day: ItineraryDay = {
        day_number: 1,
        date: '2026-02-11',
        title: 'Arrival',
        location: 'Santiago',
        activities: [],
        accommodation: {
          name: 'Hotel',
          area: 'Downtown',
          style: 'Boutique',
          price_range: '$120/night',
        },
        notes: 'Early check-in available',
      };

      expect(day.accommodation?.name).toBe('Hotel');
      expect(day.notes).toBe('Early check-in available');
    });
  });

  describe('ItineraryProposal', () => {
    it('should accept valid proposal', () => {
      const proposal: ItineraryProposal = {
        id: 'prop-1',
        title: 'Adventure',
        summary: 'Exciting trip',
        days: [
          {
            day_number: 1,
            date: '2026-02-11',
            title: 'Day 1',
            location: 'Santiago',
            activities: [],
          },
        ],
        total_budget_estimate: '$2500',
        highlights: ['City exploration'],
        caveats: ['Weather dependent'],
      };

      expect(proposal.id).toBe('prop-1');
      expect(proposal.days).toHaveLength(1);
      expect(proposal.highlights).toHaveLength(1);
    });

    it('should accept proposal with empty arrays', () => {
      const proposal: ItineraryProposal = {
        id: 'prop-1',
        title: 'Minimal',
        summary: 'Basic',
        days: [],
        total_budget_estimate: '$2500',
        highlights: [],
        caveats: [],
      };

      expect(proposal.days).toHaveLength(0);
      expect(proposal.highlights).toHaveLength(0);
    });
  });

  describe('ItineraryData', () => {
    it('should accept itinerary with single proposal', () => {
      const itinerary: ItineraryData = {
        destination: 'Chile',
        start_date: '2026-02-11',
        end_date: '2026-02-23',
        num_travelers: 2,
        proposals: [
          {
            id: 'prop-1',
            title: 'Adventure',
            summary: 'Exciting',
            days: [],
            total_budget_estimate: '$2500',
            highlights: [],
            caveats: [],
          },
        ],
      };

      expect(itinerary.destination).toBe('Chile');
      expect(itinerary.proposals).toHaveLength(1);
      expect(itinerary.num_travelers).toBe(2);
    });

    it('should accept itinerary with multiple proposals', () => {
      const itinerary: ItineraryData = {
        destination: 'Chile',
        start_date: '2026-02-11',
        end_date: '2026-02-23',
        proposals: [
          {
            id: 'prop-1',
            title: 'Adventure',
            summary: 'Exciting',
            days: [],
            total_budget_estimate: '$2500',
            highlights: [],
            caveats: [],
          },
          {
            id: 'prop-2',
            title: 'Relaxed',
            summary: 'Chill',
            days: [],
            total_budget_estimate: '$2000',
            highlights: [],
            caveats: [],
          },
        ],
      };

      expect(itinerary.proposals).toHaveLength(2);
    });

    it('should accept itinerary without num_travelers', () => {
      const itinerary: ItineraryData = {
        destination: 'Chile',
        start_date: '2026-02-11',
        end_date: '2026-02-23',
        proposals: [
          {
            id: 'prop-1',
            title: 'Adventure',
            summary: 'Exciting',
            days: [],
            total_budget_estimate: '$2500',
            highlights: [],
            caveats: [],
          },
        ],
      };

      expect(itinerary.num_travelers).toBeUndefined();
    });

    it('should accept complete itinerary structure', () => {
      const itinerary: ItineraryData = {
        destination: 'Chile',
        start_date: '2026-02-11',
        end_date: '2026-02-23',
        num_travelers: 2,
        proposals: [
          {
            id: 'prop-1',
            title: 'Chilean Adventure',
            summary: 'Explore diverse landscapes',
            days: [
              {
                day_number: 1,
                date: '2026-02-11',
                title: 'Arrival in Santiago',
                location: 'Santiago',
                activities: [
                  {
                    time: '14:00',
                    name: 'Airport arrival',
                    description: 'Transfer to hotel',
                    duration: '1 hour',
                    location: 'SCL Airport',
                    cost_estimate: '$30',
                    booking_required: false,
                  },
                  {
                    time: '19:00',
                    name: 'Welcome dinner',
                    description: 'Local cuisine',
                    duration: '2 hours',
                    cost_estimate: '$50',
                    booking_required: false,
                  },
                ],
                accommodation: {
                  name: 'Boutique Hotel',
                  area: 'Providencia',
                  style: 'Modern boutique',
                  price_range: '$120-180/night',
                  notes: 'Includes breakfast',
                },
                notes: 'Rest day after flight',
              },
            ],
            total_budget_estimate: '$2500-3000',
            highlights: ['Santiago city tour', 'Local cuisine'],
            caveats: ['Weather dependent', 'Book accommodations early'],
          },
        ],
      };

      expect(itinerary.destination).toBe('Chile');
      expect(itinerary.proposals[0].days[0].activities).toHaveLength(2);
      expect(itinerary.proposals[0].days[0].accommodation?.name).toBe('Boutique Hotel');
      expect(itinerary.proposals[0].highlights).toHaveLength(2);
    });
  });
});
