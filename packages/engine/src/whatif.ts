import type { Mark, ReferenceData, ScoringConfig, StudentProfile, WhatIfDiff } from './types';
import { notImplemented } from './util';

/** Re-runs recommend() with changed marks and diffs the verdicts. */
export function whatIf(
  _student: StudentProfile,
  _changes: Mark[],
  _data: ReferenceData,
  _cfg: ScoringConfig,
  _now: Date = new Date(),
): WhatIfDiff {
  return notImplemented('whatIf');
}
