import type { Mark, ReferenceData, ScoringConfig, StudentProfile, WhatIfDiff } from './types';
import { recommend } from './recommend';

function verdictOrder(verdict: 'qualifies' | 'close' | 'not_yet'): number {
  return { qualifies: 3, close: 2, not_yet: 1 }[verdict];
}

/** Re-runs recommend() with changed marks and diffs the verdicts. */
export function whatIf(
  student: StudentProfile,
  changes: Mark[],
  data: ReferenceData,
  cfg: ScoringConfig,
  now: Date = new Date(),
): WhatIfDiff {
  const baseline = recommend(student, data, cfg, now);
  const updatedMarks = student.marks.map((mark) => {
    const replacement = changes.find((change) => change.subjectCode === mark.subjectCode);
    return replacement ? { ...mark, percent: replacement.percent } : mark;
  });

  for (const change of changes) {
    if (!updatedMarks.some((mark) => mark.subjectCode === change.subjectCode)) {
      updatedMarks.push({ subjectCode: change.subjectCode, percent: change.percent });
    }
  }

  const modified = recommend({ ...student, marks: updatedMarks }, data, cfg, now);
  const unlocked = modified.filter((course) => {
    const baselineCourse = baseline.find((candidate) => candidate.courseId === course.courseId);
    if (!baselineCourse) return course.verdict !== 'not_yet';
    return verdictOrder(course.verdict) > verdictOrder(baselineCourse.verdict);
  });

  return {
    baseline,
    modified,
    unlocked,
  };
}
