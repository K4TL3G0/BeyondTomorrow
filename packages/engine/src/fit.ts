import type { Course, StudentProfile } from './types';

/** Soft score 0-100: interest/field overlap plus strength in relevant subjects. */
export function scoreFit(student: StudentProfile, course: Course): number {
  const studentInterests = new Set(student.interests.map((interest) => interest.trim().toLowerCase()));
  const courseFields = course.fieldTags.map((tag) => tag.trim().toLowerCase());
  const overlap = courseFields.filter((tag) => studentInterests.has(tag)).length;
  const interestScore = courseFields.length > 0 ? (overlap / courseFields.length) * 100 : 50;

  const marksBySubject = new Map(student.marks.map((mark) => [mark.subjectCode, mark.percent]));
  const requirementMarks = course.requirements.length
    ? course.requirements.map((requirement) => marksBySubject.get(requirement.subjectCode) ?? 0)
    : [];

  const subjectScore = requirementMarks.length
    ? requirementMarks.reduce((sum, value) => sum + value, 0) / requirementMarks.length
    : 0;

  return Math.max(0, Math.min(100, Math.round((interestScore * 0.6) + (subjectScore * 0.4))));
}
