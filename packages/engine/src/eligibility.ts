import type { Course, EligibilityResult, Institution, ScoringConfig, StudentProfile, Verdict } from './types';
import { getApsStrategy } from './aps';

/**
 * Hard gate. Suggested rules:
 *  - qualifies: APS and every subject requirement met
 *  - close: APS short by <= cfg.closeApsMargin AND at most one subject short
 *           by <= cfg.closeSubjectMargin
 *  - not_yet: everything else
 */
export function evaluateEligibility(
  student: StudentProfile,
  course: Course,
  institution: Institution,
  cfg: ScoringConfig,
): EligibilityResult {
  const strategy = getApsStrategy(institution.apsMethodCode);
  const marksBySubject = new Map(student.marks.map((mark) => [mark.subjectCode, mark.percent]));

  const subjectGaps = course.requirements.map((requirement) => ({
    subjectCode: requirement.subjectCode,
    required: requirement.minMark,
    actual: marksBySubject.get(requirement.subjectCode) ?? null,
  }));

  const unmetSubjects = subjectGaps.filter((gap) => gap.actual === null || gap.actual < gap.required);
  const shortBy = subjectGaps
    .filter((gap): gap is { subjectCode: string; required: number; actual: number } => gap.actual !== null && gap.actual < gap.required)
    .map((gap) => gap.required - gap.actual);

  const studentAps = strategy.calculate(student.marks, institution.bands);
  const apsGap = studentAps - course.minAps;

  let verdict: Verdict = 'not_yet';

  if (studentAps >= course.minAps && unmetSubjects.length === 0) {
    verdict = 'qualifies';
  } else if (
    apsGap >= -cfg.closeApsMargin &&
    shortBy.length <= 1 &&
    shortBy.every((gap) => gap <= cfg.closeSubjectMargin)
  ) {
    verdict = 'close';
  }

  return {
    verdict,
    studentAps,
    apsGap,
    subjectGaps,
  };
}
