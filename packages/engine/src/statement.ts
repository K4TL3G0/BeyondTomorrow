import type { ChecklistProgress, Course, CourseResult, StudentProfile } from './types';
import { notImplemented } from './util';

/**
 * Deterministic templates only. Every sentence is filled from the result
 * object and skipped when its data is missing. Never invent facts. Always end
 * with the estimate/verify caveat and the last-verified date.
 */
export function buildStatement(
  _result: CourseResult,
  _course: Course,
  _student: StudentProfile,
  _progress: ChecklistProgress,
): string {
  return notImplemented('buildStatement');
}
