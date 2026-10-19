import type { ScoringConfig } from './types';

// Starting assumptions, mirrored in /db/02_seed.sql. Tune against test personas.
export const DEFAULT_CONFIG: ScoringConfig = {
  closeApsMargin: 3,
  closeSubjectMargin: 5,
  wFit: 0.5,
  wMargin: 0.3,
  wFunding: 0.2,
  staleAfterDays: 90,
};

/** Builds a config from rows of the scoring_weights table; missing keys fall back to defaults. */
export function configFromRows(rows: { key: string; value: number | string }[]): ScoringConfig {
  const m = new Map(rows.map((r) => [r.key, Number(r.value)] as const));
  const get = (key: string, fallback: number) => {
    const v = m.get(key);
    return v !== undefined && Number.isFinite(v) ? v : fallback;
  };
  return {
    closeApsMargin: get('close_aps_margin', DEFAULT_CONFIG.closeApsMargin),
    closeSubjectMargin: get('close_subject_margin', DEFAULT_CONFIG.closeSubjectMargin),
    wFit: get('w_fit', DEFAULT_CONFIG.wFit),
    wMargin: get('w_margin', DEFAULT_CONFIG.wMargin),
    wFunding: get('w_funding', DEFAULT_CONFIG.wFunding),
    staleAfterDays: get('stale_after_days', DEFAULT_CONFIG.staleAfterDays),
  };
}
