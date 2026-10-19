import type { Course, FundingResult, FundingSource, StudentProfile } from './types';
import { notImplemented } from './util';

/**
 * Indicator only. Compare the income bracket to published thresholds, match
 * bursaries by field, province and marks. Never present as an approval prediction.
 */
export function matchFunding(
  _student: StudentProfile,
  _course: Course,
  _sources: FundingSource[],
): FundingResult {
  return notImplemented('matchFunding');
}
