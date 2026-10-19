import type { Course, EligibilityResult, Institution, ScoringConfig, StudentProfile } from './types';
import { notImplemented } from './util';

/**
 * Hard gate. Suggested rules:
 *  - qualifies: APS and every subject requirement met
 *  - close: APS short by <= cfg.closeApsMargin AND at most one subject short
 *           by <= cfg.closeSubjectMargin
 *  - not_yet: everything else
 */
export function evaluateEligibility(
  _student: StudentProfile,
  _course: Course,
  _institution: Institution,
  _cfg: ScoringConfig,
): EligibilityResult {
  return notImplemented('evaluateEligibility');
}
