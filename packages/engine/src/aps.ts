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

function bestSixExcludingLo(marks: Mark[], bands: ApsBand[]): number {
  const scored = marks
    .filter((mark) => mark.subjectCode !== 'LO')
    .map((mark) => ({ mark: mark.percent, points: pointsForMark(mark.percent, bands) }))
    .sort((a, b) => b.mark - a.mark)
    .slice(0, 6);

  return scored.reduce((sum, item) => sum + item.points, 0);
}

function bestSevenCappedLo(marks: Mark[], bands: ApsBand[]): number {
  const scored = marks
    .map((mark) => ({ mark: mark.percent, points: pointsForMark(mark.percent, bands) }))
    .sort((a, b) => b.mark - a.mark)
    .slice(0, 7);

  const loMark = marks.find((mark) => mark.subjectCode === 'LO');
  if (loMark && scored.some((item) => item.mark === loMark.percent)) {
    const capped = scored.map((item) =>
      item.mark === loMark.percent ? { ...item, points: Math.min(item.points, 2) } : item,
    );
    return capped.reduce((sum, item) => sum + item.points, 0);
  }

  return scored.reduce((sum, item) => sum + item.points, 0);
}

const registry = new Map<string, ApsStrategy>();

registerApsStrategy({
  code: 'DEMO_BEST_SIX',
  calculate: bestSixExcludingLo,
});

registerApsStrategy({
  code: 'BEST_SIX_EXCLUDING_LO',
  calculate: bestSixExcludingLo,
});

registerApsStrategy({
  code: 'BEST_SEVEN_CAPPED_LO',
  calculate: bestSevenCappedLo,
});

registerApsStrategy({
  code: 'BEST_SIX',
  calculate: bestSixExcludingLo,
});

export function registerApsStrategy(strategy: ApsStrategy): void {
  registry.set(strategy.code, strategy);
}

export function getApsStrategy(code: string): ApsStrategy {
  const strategy = registry.get(code);
  if (!strategy) throw new Error(`No APS strategy registered for "${code}"`);
  return strategy;
}
