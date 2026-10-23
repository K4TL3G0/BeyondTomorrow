import type { ApsBand, Mark } from './types';

export interface SubjectEntry {
  name: string;
  percent: number;
  counted: boolean;
}

export interface BreakdownRow extends SubjectEntry {
  aps: number;
  level: number;
}

export interface ApsResult {
  total: number;
  countedSubjects: number;
  breakdown: BreakdownRow[];
}

export type Scale = 'seven' | 'eight' | 'ufs' | 'univen';

export type InstitutionScheme =
  | {
      type: 'standard';
      bestN: number;
      excludeLO: boolean;
      scale?: Scale;
      required?: string[];
      loBonus?: { minPercent: number; points: number };
    }
  | { type: 'uct'; variant: 'general' | 'science' }
  | { type: 'wits' };

export interface ApsInstitution {
  id: string;
  name: string;
  year: number;
  checked: string;
  source: string;
  scheme: InstitutionScheme;
  notes: string[];
  caveat?: string;
}

export interface UsedSubject extends BreakdownRow {
  reason?: string;
}

export interface InstitutionResult {
  total: number;
  maximum: number;
  breakdown: UsedSubject[];
}

export interface Level {
  level: number;
  minMark: number;
  maxMark: number;
  points: number;
}

export type SubjectKind = 'english' | 'mathematics' | 'physical-sciences' | 'life-orientation' | 'other';

export const LEVELS: Level[] = [
  { level: 7, minMark: 80, maxMark: 100, points: 7 },
  { level: 6, minMark: 70, maxMark: 79.99, points: 6 },
  { level: 5, minMark: 60, maxMark: 69.99, points: 5 },
  { level: 4, minMark: 50, maxMark: 59.99, points: 4 },
  { level: 3, minMark: 40, maxMark: 49.99, points: 3 },
  { level: 2, minMark: 30, maxMark: 39.99, points: 2 },
  { level: 1, minMark: 0, maxMark: 29.99, points: 1 },
];

const isLifeOrientation = (name: string) => /life\s*orientation/i.test(name);

export function isValidMark(percent: number): boolean {
  return Number.isFinite(percent) && percent >= 0 && percent <= 100;
}

export function convertMark(percent: number, scale: Scale = 'seven'): number {
  if (!isValidMark(percent)) return 0;
  if (scale === 'ufs') {
    if (percent < 30) return 0;
    if (percent >= 90) return 8;
    if (percent >= 80) return 7;
    return Math.floor(percent / 10) - 1;
  }
  if (scale === 'eight') {
    if (percent >= 90) return 8;
    if (percent < 30) return 1;
    return Math.floor(percent / 10) - 1;
  }
  if (scale === 'univen') {
    if (percent < 30) return 1;
    if (percent >= 80) return 7;
    return Math.floor(percent / 10) - 1;
  }
  if (percent < 30) return 1;
  if (percent >= 80) return 7;
  return Math.floor(percent / 10) - 1;
}

export function classifySubject(name: string): SubjectKind {
  const normalized = name.toLowerCase();
  if (isLifeOrientation(name)) return 'life-orientation';
  if (/english|home language|first additional language/.test(normalized)) return 'english';
  if (/mathematics|maths/.test(normalized)) return 'mathematics';
  if (/physical sciences/.test(normalized)) return 'physical-sciences';
  return 'other';
}

export function calculateAps(entries: SubjectEntry[]): ApsResult {
  const breakdown = entries.map((entry) => ({
    ...entry,
    aps: entry.counted ? convertMark(entry.percent) : 0,
    level: getLevel(entry.percent),
  }));
  return {
    total: breakdown.reduce((sum, row) => sum + row.aps, 0),
    countedSubjects: breakdown.filter((row) => row.counted).length,
    breakdown,
  };
}

export function calculateForInstitution(
  institution: ApsInstitution,
  entries: SubjectEntry[],
): InstitutionResult {
  const { scheme } = institution;
  const candidates = entries.filter((entry) =>
    scheme.type === 'standard'
      ? !(scheme.excludeLO && isLifeOrientation(entry.name))
      : scheme.type === 'uct'
        ? !isLifeOrientation(entry.name)
        : true,
  );

  if (scheme.type === 'uct') {
    const resultRows = candidates.map((entry) => ({
      ...entry,
      aps: entry.percent >= 40 ? entry.percent : 0,
      level: getLevel(entry.percent),
      reason: '',
    }));
    let selected: typeof resultRows;
    if (scheme.variant === 'science') {
      const english = pickFirst(resultRows, 'english');
      const mathematics = pickFirst(resultRows, 'mathematics');
      const sciences = pickFirst(resultRows, 'physical-sciences');
      const required = [english, mathematics, sciences].filter((row): row is (typeof resultRows)[number] => !!row);
      const requiredIds = new Set(required);
      const others = resultRows
        .filter((row) => !requiredIds.has(row))
        .sort((a, b) => b.aps - a.aps)
        .slice(0, 3);
      selected = [...required, ...others];
      return {
        total:
          (english?.aps ?? 0) +
          (mathematics?.aps ?? 0) * 2 +
          (sciences?.aps ?? 0) * 2 +
          others.reduce((sum, row) => sum + row.aps, 0),
        maximum: 800,
        breakdown: resultRows.map((row) => ({
          ...row,
          aps: row.aps * (row === mathematics || row === sciences ? 2 : 1),
          counted: selected.includes(row),
          reason: selected.includes(row) ? 'Included in the UCT Science score' : 'Not among the selected subjects',
        })),
      };
    }
    const english = pickFirst(resultRows, 'english');
    const others = resultRows
      .filter((row) => row !== english)
      .sort((a, b) => b.aps - a.aps)
      .slice(0, 5);
    selected = [...(english ? [english] : []), ...others];
    return {
      total: selected.reduce((sum, row) => sum + row.aps, 0),
      maximum: 600,
      breakdown: resultRows.map((row) => ({
        ...row,
        counted: selected.includes(row),
        reason: selected.includes(row) ? 'Included in the UCT score' : 'Not among the selected subjects',
      })),
    };
  }

  if (scheme.type === 'wits') {
    const rows = candidates.map((entry) => {
      const kind = classifySubject(entry.name);
      const base = kind === 'life-orientation' ? loPoints(entry.percent) : convertMark(entry.percent);
      const bonus = (kind === 'english' || kind === 'mathematics') && entry.percent >= 60 ? 2 : 0;
      return { ...entry, aps: base + bonus, level: getLevel(entry.percent), reason: '' };
    });
    const selected = rows
      .sort((a, b) => b.aps - a.aps)
      .slice(0, 7);
    return {
      total: selected.reduce((sum, row) => sum + row.aps, 0),
      maximum: 53,
      breakdown: rows.map((row) => ({
        ...row,
        counted: selected.includes(row),
        reason: selected.includes(row) ? 'Included in the Wits score' : 'Not among the selected seven subjects',
      })),
    };
  }

  const rows = candidates.map((entry) => ({
    ...entry,
    aps: convertMark(entry.percent, scheme.scale ?? 'seven'),
    level: getLevel(entry.percent),
    reason: '',
  }));
  const selected = selectBestSubjects(rows, scheme.bestN, scheme.required ?? []);
  const loBonus = scheme.loBonus && entries.find((entry) => isLifeOrientation(entry.name));
  const bonus = loBonus && loBonus.percent >= scheme.loBonus!.minPercent ? scheme.loBonus!.points : 0;

  return {
    total: selected.reduce((sum, row) => sum + row.aps, 0) + bonus,
    maximum: scheme.bestN * (scheme.scale === 'eight' || scheme.scale === 'ufs' ? 8 : 7) + (scheme.loBonus?.points ?? 0),
    breakdown: rows.map((row) => ({
      ...row,
      counted: selected.includes(row),
      reason: selected.includes(row) ? 'Included in the institution’s score' : 'Not among the selected subjects',
    })),
  };
}

function getLevel(percent: number): number {
  if (!isValidMark(percent)) return 0;
  return Math.min(7, Math.max(1, Math.floor(percent / 10) - 1));
}

function loPoints(percent: number): number {
  if (percent >= 80) return 4;
  if (percent >= 70) return 3;
  if (percent >= 60) return 2;
  if (percent >= 50) return 1;
  return 0;
}

function pickFirst<T extends { name: string }>(rows: T[], kind: SubjectKind): T | undefined {
  return rows.find((row) => classifySubject(row.name) === kind);
}

function selectBestSubjects<T extends { name: string; aps: number }>(
  rows: T[],
  bestN: number,
  requiredNames: string[],
): T[] {
  const required = requiredNames
    .map((name) => rows.find((row) => {
      const normalized = name.toLowerCase();
      if (normalized === 'english') return classifySubject(row.name) === 'english';
      if (normalized === 'maths' || normalized === 'mathematics') {
        return classifySubject(row.name) === 'mathematics' || /mathematical literacy/i.test(row.name);
      }
      return row.name.toLowerCase().includes(normalized);
    }))
    .filter((row): row is T => !!row);
  const requiredSet = new Set(required);
  const others = rows.filter((row) => !requiredSet.has(row)).sort((a, b) => b.aps - a.aps);
  return [...required, ...others.slice(0, Math.max(0, bestN - required.length))];
}

/** Converts one percentage to points using an institution's band table. */
export function pointsForMark(percent: number, bands: { minMark: number; maxMark: number; points: number }[]): number {
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

export interface ApsStrategy {
  readonly code: string;
  calculate(marks: Mark[], bands: ApsBand[]): number;
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
