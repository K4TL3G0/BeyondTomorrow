import type { Course, StudentProfile } from './types';
import { notImplemented } from './util';

/** Soft score 0-100: interest/field overlap plus strength in relevant subjects. */
export function scoreFit(_student: StudentProfile, _course: Course): number {
  return notImplemented('scoreFit');
}
