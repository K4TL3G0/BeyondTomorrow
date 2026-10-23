import type { ChecklistProgress, Course, CourseResult, StudentProfile } from './types';

/**
 * Deterministic templates only. Every sentence is filled from the result
 * object and skipped when its data is missing. Never invent facts. Always end
 * with the estimate/verify caveat and the last-verified date.
 */
export function buildStatement(
  result: CourseResult,
  course: Course,
  _student: StudentProfile,
  progress: ChecklistProgress,
): string {
  const verdictText =
    result.verdict === 'qualifies'
      ? 'You appear to qualify for this course.'
      : result.verdict === 'close'
        ? 'You are close to qualifying for this course.'
        : 'You are not yet eligible for this course.';

  const gapText = result.subjectGaps.some((gap) => gap.actual !== null && gap.actual < gap.required)
    ? `Your main shortfalls are in ${result.subjectGaps
        .filter((gap) => gap.actual !== null && gap.actual < gap.required)
        .map((gap) => `${gap.subjectCode} (${gap.actual} vs ${gap.required})`)
        .join(', ')}.`
    : 'You meet the stated subject requirements.';

  const fundingText =
    result.funding.bursaryIds.length > 0
      ? `Relevant bursaries found: ${result.funding.bursaryIds.length}.`
      : 'No matching bursaries were identified from the current data.';

  const checklistText = `Checklist progress: ${progress.done}/${progress.total} completed.`;
  const caveat = `This is an estimate; verify with the institution.`;
  const verification = course.lastVerified ? `Last verified: ${course.lastVerified}.` : 'Last verified: not provided.';

  return `${verdictText} ${gapText} ${fundingText} ${checklistText} ${caveat} ${verification}`;
}
