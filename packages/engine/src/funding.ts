import type { Course, FundingResult, FundingSource, StudentProfile } from './types';

/**
 * Indicator only. Compare the income bracket to published thresholds, match
 * bursaries by field, province and marks. Never present as an approval prediction.
 */
export function matchFunding(
  student: StudentProfile,
  course: Course,
  sources: FundingSource[],
): FundingResult {
  const nsfas: FundingResult['nsfas'] = (() => {
    switch (student.incomeBracket) {
      case 'up_to_350k':
        return 'likely';
      case '350k_to_600k':
        return 'may_qualify';
      case 'above_600k':
        return 'no';
      case 'prefer_not_to_say':
        return 'unknown';
      default:
        return 'unknown';
    }
  })();

  const marksBySubject = new Map(student.marks.map((mark) => [mark.subjectCode, mark.percent]));
  const courseTags = new Set(course.fieldTags.map((tag) => tag.toLowerCase()));
  const courseProvince = course.province;
  const relevantAverage = course.requirements.length
    ? course.requirements.reduce((sum, requirement) => {
        const actual = marksBySubject.get(requirement.subjectCode);
        return sum + (typeof actual === 'number' ? actual : 0);
      }, 0) / course.requirements.length
    : 0;

  const bursaryIds = sources
    .filter((source) => source.type === 'bursary')
    .filter((source) => {
      if (source.eligibleFields.length > 0) {
        const hasCommonField = source.eligibleFields.some((tag) => courseTags.has(tag.toLowerCase()));
        if (!hasCommonField) return false;
      }

      if (source.eligibleProvinces.length > 0 && courseProvince && !source.eligibleProvinces.includes(courseProvince)) {
        return false;
      }

      if (source.minAverage !== null && relevantAverage < source.minAverage) {
        return false;
      }

      if (student.incomeBracket === 'above_600k' || student.incomeBracket === 'prefer_not_to_say') {
        return false;
      }

      if (source.incomeCeiling !== null && student.incomeBracket === 'up_to_350k' && source.incomeCeiling < 350000) {
        return false;
      }

      if (source.incomeCeiling !== null && student.incomeBracket === '350k_to_600k' && source.incomeCeiling < 600000) {
        return false;
      }

      return true;
    })
    .map((source) => source.id);

  return { nsfas, bursaryIds };
}
