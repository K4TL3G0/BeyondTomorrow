import type { ApsBand } from '@beyond-tomorrow/engine';

export const APS_LEVELS = [
  { level: 7, minMark: 80, maxMark: 100, points: 7 },
  { level: 6, minMark: 70, maxMark: 79, points: 6 },
  { level: 5, minMark: 60, maxMark: 69, points: 5 },
  { level: 4, minMark: 50, maxMark: 59, points: 4 },
  { level: 3, minMark: 40, maxMark: 49, points: 3 },
  { level: 2, minMark: 30, maxMark: 39, points: 2 },
  { level: 1, minMark: 0, maxMark: 29, points: 1 },
] as const;

export const APS_BANDS: ApsBand[] = APS_LEVELS.map(({ minMark, maxMark, points }) => ({
  minMark,
  maxMark,
  points,
}));
