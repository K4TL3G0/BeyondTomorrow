import type { CourseResult, ReferenceData, ScoringConfig, StudentProfile } from './types';
import { evaluateEligibility } from './eligibility';
import { matchFunding } from './funding';
import { scoreFit } from './fit';

function verdictRank(verdict: CourseResult['verdict']): number {
  return { qualifies: 3, close: 2, not_yet: 1 }[verdict];
}

function toIsoDateString(value: string | null): string | null {
  return value && value.length > 0 ? value : null;
}

/**
 * Pure function: same inputs, same outputs, no I/O. Runs in the browser
 * (what-if slider) and on the API (authoritative). Rank by verdict tier first,
 * then wFit*fit + wMargin*margin + wFunding*funding.
 */
export function recommend(
  student: StudentProfile,
  data: ReferenceData,
  cfg: ScoringConfig,
  now: Date = new Date(),
): CourseResult[] {
  const results = data.courses
    .map((course) => {
      const institution = data.institutions.find((entry) => entry.id === course.institutionId);
      if (!institution) return null;

      const eligibility = evaluateEligibility(student, course, institution, cfg);
      const fit = scoreFit(student, course);
      const funding = matchFunding(student, course, data.funding);

      const verifiedDates = [toIsoDateString(institution.lastVerified), toIsoDateString(course.lastVerified)]
        .filter((value): value is string => Boolean(value));
      const verifiedOn = verifiedDates.length ? verifiedDates.sort()[0] : null;
      const stale = verifiedOn
        ? (now.getTime() - new Date(verifiedOn).getTime()) > cfg.staleAfterDays * 24 * 60 * 60 * 1000
        : false;

      const fundingScore =
        funding.nsfas === 'likely' ? 100 : funding.nsfas === 'may_qualify' ? 60 : funding.nsfas === 'unknown' ? 40 : 0;
      const margin = eligibility.studentAps - course.minAps;
      const rankScore =
        verdictRank(eligibility.verdict) * 1000 +
        cfg.wFit * fit +
        cfg.wMargin * margin +
        cfg.wFunding * (fundingScore / 100) * 100;

      return {
        courseId: course.id,
        verdict: eligibility.verdict,
        studentAps: eligibility.studentAps,
        apsGap: eligibility.apsGap,
        subjectGaps: eligibility.subjectGaps,
        fit,
        funding,
        verifiedOn,
        stale,
        rankScore,
      };
    })
    .filter((result): result is CourseResult & { rankScore: number } => Boolean(result));

  return results
    .sort((left, right) => {
      if (right.verdict !== left.verdict) {
        return verdictRank(right.verdict) - verdictRank(left.verdict);
      }
      return right.rankScore - left.rankScore;
    })
    .map(({ rankScore: _rankScore, ...result }) => result);
}
