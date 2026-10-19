import type { CourseResult, ReferenceData, ScoringConfig, StudentProfile } from './types';
import { notImplemented } from './util';

/**
 * Pure function: same inputs, same outputs, no I/O. Runs in the browser
 * (what-if slider) and on the API (authoritative). Rank by verdict tier first,
 * then wFit*fit + wMargin*margin + wFunding*funding.
 */
export function recommend(
  _student: StudentProfile,
  _data: ReferenceData,
  _cfg: ScoringConfig,
  _now: Date = new Date(),
): CourseResult[] {
  return notImplemented('recommend');
}
