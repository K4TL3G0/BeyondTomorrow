import type { IncomeBracket } from './types';

export type AgeBand = 'under18' | '18to34' | '35plus';
export type Supporter =
  | 'both_parents'
  | 'one_parent'
  | 'legal_guardian'
  | 'spouse'
  | 'myself'
  | 'other_relative';
export type ParentsOnRecord = 'both' | 'one' | 'none' | 'unsure';
export type YesNoUnsure = 'yes' | 'no' | 'unsure';
export type Acceptance = 'accepted' | 'applied' | 'not_yet';

export interface HouseholdAnswers {
  incomeBracket?: IncomeBracket;
  ageBand?: AgeBand;
  supporter?: Supporter;
  parentsOnRecord?: ParentsOnRecord;
  supporterIsParentOnRecord?: YesNoUnsure;
  acceptance?: Acceptance;
  vulnerableChild?: boolean;
  disabilityBasis?: boolean;
  receivesGrant?: boolean;
}

export type Cond =
  | { always: true }
  | { all: Cond[] }
  | { any: Cond[] }
  | { not: Cond }
  | {
      field: keyof HouseholdAnswers;
      op: 'eq' | 'neq' | 'in';
      value: string | boolean | string[];
    };

export type Tri = 'yes' | 'no' | 'unknown';
export type Verification = 'official' | 'reported' | 'secondary' | 'conflict';

export const ROUTE_CODES = [
  'nsfas_bursary',
  'nsfas_loan',
  'bursaries',
  'bank_loans',
  'private_loans',
] as const;

export interface ReadinessCheck {
  checkCode: string;
  label: string;
  whyItFails: string;
  sortOrder: number;
  showWhen: Cond | null;
  sourceUrl: string | null;
  lastVerified: string | null;
  verification: Verification;
}

export interface ReadinessDocument {
  code: string;
  name: string;
  summary: string;
  whoSigns: string | null;
  specialCategory: boolean;
  estDays: number;
  dependsOn: string[];
  officialUrl: string | null;
  sortOrder: number;
  sourceUrl: string | null;
  lastVerified: string | null;
  verification: Verification;
  checks: ReadinessCheck[];
}

export interface ReadinessRule {
  documentCode: string;
  routeCodes: string[];
  when: Cond;
  onUnknown: 'include' | 'exclude';
  reasonText: string;
  priority: number;
  sourceUrl: string | null;
  lastVerified: string | null;
  verification: Verification;
}

export interface RequiredDocument extends ReadinessDocument {
  reasons: string[];
  confirmNeeded: boolean;
  stale: boolean;
}

const UNKNOWN_VALUES = new Set(['unsure', 'prefer_not_to_say']);

export function evaluateCondition(
  condition: Cond,
  answers: HouseholdAnswers,
  depth = 0,
  budget = { remaining: 50 },
): Tri {
  budget.remaining -= 1;
  if (depth > 5 || budget.remaining < 0) return 'no';
  if ('always' in condition) return 'yes';
  if ('all' in condition) {
    const values = condition.all.map((item) => evaluateCondition(item, answers, depth + 1, budget));
    return values.includes('no') ? 'no' : values.includes('unknown') ? 'unknown' : 'yes';
  }
  if ('any' in condition) {
    const values = condition.any.map((item) => evaluateCondition(item, answers, depth + 1, budget));
    return values.includes('yes') ? 'yes' : values.includes('unknown') ? 'unknown' : 'no';
  }
  if ('not' in condition) {
    const value = evaluateCondition(condition.not, answers, depth + 1, budget);
    return value === 'yes' ? 'no' : value === 'no' ? 'yes' : 'unknown';
  }

  const actual = answers[condition.field];
  if (actual === undefined || (typeof actual === 'string' && UNKNOWN_VALUES.has(actual))) {
    return 'unknown';
  }
  const matches =
    condition.op === 'in'
      ? Array.isArray(condition.value) && condition.value.includes(String(actual))
      : condition.op === 'eq'
        ? actual === condition.value
        : actual !== condition.value;
  return matches ? 'yes' : 'no';
}

function isCurrentReference(
  sourceUrl: string | null,
  lastVerified: string | null,
): boolean {
  if (!sourceUrl || !lastVerified) return false;
  try {
    const url = new URL(sourceUrl);
    const date = new Date(`${lastVerified}T00:00:00Z`);
    return (
      url.protocol === 'https:' &&
      url.hostname !== 'example.com' &&
      !url.hostname.endsWith('.example.com') &&
      /^\d{4}-\d{2}-\d{2}$/.test(lastVerified) &&
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === lastVerified
    );
  } catch {
    return false;
  }
}

function isStale(lastVerified: string, now: Date, staleAfterDays: number): boolean {
  const verifiedAt = new Date(`${lastVerified}T00:00:00Z`);
  return (
    Number.isNaN(verifiedAt.getTime()) ||
    now.getTime() - verifiedAt.getTime() > staleAfterDays * 24 * 60 * 60 * 1000
  );
}

export function requiredDocuments(
  routeCodes: string[],
  documents: ReadinessDocument[],
  rules: ReadinessRule[],
  answers: HouseholdAnswers,
  now: Date,
  staleAfterDays = 90,
): RequiredDocument[] {
  const byCode = new Map(
    documents
      .filter((document) =>
        isCurrentReference(document.sourceUrl, document.lastVerified),
      )
      .map((document) => [document.code, document]),
  );
  const included = new Map<string, RequiredDocument>();

  for (const rule of [...rules].sort((left, right) => right.priority - left.priority)) {
    if (!routeCodes.some((routeCode) => rule.routeCodes.includes(routeCode))) continue;
    const document = byCode.get(rule.documentCode);
    if (!document) continue;
    if (!isCurrentReference(rule.sourceUrl, rule.lastVerified)) continue;

    const result = evaluateCondition(rule.when, answers);
    if (result === 'no' || (result === 'unknown' && rule.onUnknown === 'exclude')) continue;

    const existing = included.get(document.code);
    const checks = document.checks
      .filter((check) =>
        isCurrentReference(check.sourceUrl, check.lastVerified),
      )
      .filter((check) => !check.showWhen || evaluateCondition(check.showWhen, answers) !== 'no')
      .sort((left, right) => left.sortOrder - right.sortOrder);
    const verificationRank: Record<Verification, number> = {
      official: 0,
      reported: 1,
      secondary: 2,
      conflict: 3,
    };
    const verification = [document.verification, rule.verification, ...checks.map((check) => check.verification)]
      .reduce((leastCertain, current) =>
        verificationRank[current] > verificationRank[leastCertain] ? current : leastCertain,
      );

    included.set(document.code, {
      ...document,
      checks,
      verification,
      reasons: [...(existing?.reasons ?? []), rule.reasonText],
      confirmNeeded: Boolean(existing?.confirmNeeded || result === 'unknown'),
      stale:
        isStale(document.lastVerified!, now, staleAfterDays) ||
        isStale(rule.lastVerified!, now, staleAfterDays) ||
        checks.some((check) => isStale(check.lastVerified!, now, staleAfterDays)),
    });
  }

  return [...included.values()].sort((left, right) => left.sortOrder - right.sortOrder);
}

export interface PreflightResult {
  perDocument: { code: string; total: number; ticked: number; missing: ReadinessCheck[] }[];
  allReady: boolean;
}

export type DeadlineStatus = 'on_track' | 'at_risk' | 'overdue';

export interface RiskFactor {
  code: string;
  points: number;
  text: string;
}

export interface RiskForecast {
  level: 'low' | 'medium' | 'high';
  score: number;
  reasons: RiskFactor[];
  nextAction: string;
}

export function criticalPathDays(
  documents: ReadinessDocument[],
  completedCodes: ReadonlySet<string> = new Set(),
): number {
  const byCode = new Map(documents.map((document) => [document.code, document]));
  const visiting = new Set<string>();
  const memo = new Map<string, number>();

  function duration(code: string): number {
    if (completedCodes.has(code)) return 0;
    const cached = memo.get(code);
    if (cached !== undefined) return cached;
    const document = byCode.get(code);
    if (!document) throw new Error(`Unknown document dependency: ${code}`);
    if (visiting.has(code)) throw new Error(`Document dependency cycle at: ${code}`);
    visiting.add(code);
    const dependencies = document.dependsOn.map(duration);
    const result = document.estDays + Math.max(0, ...dependencies);
    visiting.delete(code);
    memo.set(code, result);
    return result;
  }

  return Math.max(0, ...documents.map((document) => duration(document.code)));
}

export function forecastIncompleteRisk(input: {
  answers: HouseholdAnswers;
  documents: RequiredDocument[];
  checkedKeys: ReadonlySet<string>;
  deadlineStatus: DeadlineStatus | null;
  daysLeft: number | null;
}): RiskForecast {
  const { answers, documents, checkedKeys, deadlineStatus, daysLeft } = input;
  const factors: RiskFactor[] = [];
  const add = (code: string, points: number, text: string) => factors.push({ code, points, text });
  const consent = documents.find((document) => document.code === 'consent_form');
  const visibleConsentChecks = consent?.checks ?? [];
  const totalChecked = documents.reduce(
    (count, document) =>
      count + document.checks.filter((check) =>
        checkedKeys.has(`${document.code}:${check.checkCode}`),
      ).length,
    0,
  );

  if (answers.parentsOnRecord === 'both') {
    add('two_signatures', 2, 'Check whether each parent on your records needs to sign.');
  }
  if (answers.supporterIsParentOnRecord === 'no') {
    add('supporter_not_parent', 3, 'Confirm whether a declaration and the supporter’s consent are needed.');
  }
  if (answers.parentsOnRecord === 'unsure' || answers.supporterIsParentOnRecord === 'unsure') {
    add('parent_status_unsure', 1, 'Confirm who appears on your records before choosing forms.');
  }
  if (
    visibleConsentChecks.some(
      (check) => !checkedKeys.has(`consent_form:${check.checkCode}`),
    )
  ) {
    add('consent_checks_open', 2, 'Review the consent-form checks before submitting.');
  }
  if (documents.some((document) => document.specialCategory)) {
    add('special_forms_needed', 1, 'Confirm any special-category guidance directly with NSFAS.');
  }
  if (answers.acceptance !== 'accepted') {
    add('not_yet_accepted', 1, 'Check what proof of acceptance will be needed for your application.');
  }
  if (deadlineStatus === 'at_risk') {
    add('deadline_tight', 3, 'Start the remaining document checks as soon as you can.');
  } else if (deadlineStatus === 'overdue') {
    add('deadline_passed', 5, 'Contact the funding provider immediately to confirm your options.');
  }
  if (totalChecked === 0 && daysLeft !== null && daysLeft < 7) {
    add('nothing_started', 1, 'Begin with the first sourced requirement and confirm the deadline.');
  }

  factors.sort((left, right) => right.points - left.points);
  const score = factors.reduce((sum, factor) => sum + factor.points, 0);
  const level = score >= 6 ? 'high' : score >= 3 ? 'medium' : 'low';
  return {
    level,
    score,
    reasons: factors.slice(0, 3),
    nextAction: factors[0]?.text ?? 'Continue checking your sourced requirements before submitting.',
  };
}

export function evaluatePreflight(
  documents: RequiredDocument[],
  checkedKeys: ReadonlySet<string>,
): PreflightResult {
  const perDocument = documents.map((document) => {
    const ticked = document.checks.filter((check) =>
      checkedKeys.has(`${document.code}:${check.checkCode}`),
    ).length;
    return {
      code: document.code,
      total: document.checks.length,
      ticked,
      missing: document.checks.filter(
        (check) => !checkedKeys.has(`${document.code}:${check.checkCode}`),
      ),
    };
  });
  return {
    perDocument,
    allReady: perDocument.every(({ total, ticked }) => total > 0 && total === ticked),
  };
}

export function readinessPersistencePayload(
  studentId: string,
  documents: RequiredDocument[],
  checkedKeys: ReadonlySet<string>,
): { student_id: string; document_code: string; check_code: string; checked: boolean }[] {
  return documents
    .filter((document) => !document.specialCategory)
    .flatMap((document) =>
      document.checks.map((check) => ({
        student_id: studentId,
        document_code: document.code,
        check_code: check.checkCode,
        checked: checkedKeys.has(`${document.code}:${check.checkCode}`),
      })),
    );
}
