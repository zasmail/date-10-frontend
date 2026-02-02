'use client';

import { useState, useEffect } from 'react';

// Breakpoint constants matching Tailwind defaults
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Hook to detect if a media query matches
 * @param query - CSS media query string
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

/**
 * Hook to detect current breakpoint
 * @returns Object with boolean flags for each breakpoint
 */
export function useBreakpoint() {
  // Call all hooks unconditionally to satisfy Rules of Hooks
  const isAtLeastMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
  const isAtLeastLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const isAtLeastXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);

  // Derive breakpoint values from the hook results
  const isMobile = !isAtLeastMd;
  const isTablet = isAtLeastMd && !isAtLeastLg;
  const isDesktop = isAtLeastLg;
  const isLargeDesktop = isAtLeastXl;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    // Convenience helpers
    isMobileOrTablet: isMobile || isTablet,
    isTabletOrDesktop: isTablet || isDesktop,
  };
}

/**
 * Hook to check if screen is at least a certain breakpoint
 * @param breakpoint - The minimum breakpoint to check
 * @returns boolean indicating if screen is at least that breakpoint
 */
export function useMinBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
}

/**
 * Hook to check if screen is below a certain breakpoint
 * @param breakpoint - The maximum breakpoint to check
 * @returns boolean indicating if screen is below that breakpoint
 */
export function useMaxBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`);
}
