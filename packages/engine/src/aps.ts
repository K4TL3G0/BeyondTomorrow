import type { ApsBand, Mark } from './types';

/**
 * Strategy pattern: one class/object per institution APS method.
 * Add each method in its own file under src/strategies/ and register it.
 * VERIFY every method against the institution's published rules and record
 * the source in the institutions table (source_url, last_verified).
 */
export interface ApsStrategy {
  readonly code: string; // matches institutions.aps_method_code
  calculate(marks: Mark[], bands: ApsBand[]): number;
}

/** Converts one percentage to points using an institution's band table. */
export function pointsForMark(percent: number, bands: ApsBand[]): number {
  const band = bands.find((b) => percent >= b.minMark && percent <= b.maxMark);
  return band ? band.points : 0;
}

const registry = new Map<string, ApsStrategy>();

export function registerApsStrategy(strategy: ApsStrategy): void {
  registry.set(strategy.code, strategy);
}

export function getApsStrategy(code: string): ApsStrategy {
  const strategy = registry.get(code);
  if (!strategy) throw new Error(`No APS strategy registered for "${code}"`);
  return strategy;
}
