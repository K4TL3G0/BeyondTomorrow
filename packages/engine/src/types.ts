// Shared domain types. Keep these in sync with /db/01_schema_and_rls.sql.

export const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
] as const;
export type Province = (typeof PROVINCES)[number];

// Brackets break at the published NSFAS thresholds. Re-verify yearly.
export const INCOME_BRACKETS = [
  'up_to_350k', '350k_to_600k', 'above_600k', 'prefer_not_to_say',
] as const;
export type IncomeBracket = (typeof INCOME_BRACKETS)[number];

export interface Mark { subjectCode: string; percent: number }

export interface StudentProfile {
  province?: Province;
  incomeBracket?: IncomeBracket;
  interests: string[];
  marks: Mark[];
}

export interface ApsBand { minMark: number; maxMark: number; points: number }

export interface Institution {
  id: string;
  name: string;
  apsMethodCode: string;
  bands: ApsBand[];
  sourceUrl: string | null;
  lastVerified: string | null; // ISO date
}

export interface Requirement { subjectCode: string; minMark: number }

export interface Course {
  id: string;
  institutionId: string;
  name: string;
  fieldTags: string[];
  minAps: number;
  province: Province | null;
  applicationDeadline: string | null;
  applicationUrl: string | null;
  sourceUrl: string | null;
  lastVerified: string | null;
  requirements: Requirement[];
}

export interface FundingSource {
  id: string;
  name: string;
  type: 'bursary' | 'loan';
  incomeCeiling: number | null;
  disabilityIncomeCeiling: number | null;
  eligibleFields: string[];      // empty = any field
  eligibleProvinces: string[];   // empty = any province
  minAverage: number | null;
  deadline: string | null;
  sourceUrl: string | null;
  lastVerified: string | null;
}

export interface ReferenceData {
  institutions: Institution[];
  courses: Course[];
  funding: FundingSource[];
}

export interface ScoringConfig {
  closeApsMargin: number;
  closeSubjectMargin: number;
  wFit: number;
  wMargin: number;
  wFunding: number;
  staleAfterDays: number;
}

export type Verdict = 'qualifies' | 'close' | 'not_yet';

export interface SubjectGap {
  subjectCode: string;
  required: number;
  actual: number | null; // null = student has not entered this subject
}

export interface EligibilityResult {
  verdict: Verdict;
  studentAps: number;
  apsGap: number; // negative = short
  subjectGaps: SubjectGap[];
}

// NSFAS is an INDICATOR against the published income threshold, never a
// prediction of approval. Final decisions rest with NSFAS.
export interface FundingResult {
  nsfas: 'likely' | 'may_qualify' | 'no' | 'unknown';
  bursaryIds: string[];
}

export interface CourseResult {
  courseId: string;
  verdict: Verdict;
  studentAps: number;
  apsGap: number;
  subjectGaps: SubjectGap[];
  fit: number; // 0-100
  funding: FundingResult;
  verifiedOn: string | null; // OLDEST last_verified among rows used
  stale: boolean;
}

export interface WhatIfDiff {
  baseline: CourseResult[];
  modified: CourseResult[];
  unlocked: CourseResult[]; // verdict improved, e.g. close -> qualifies
}

export interface ChecklistProgress { done: number; total: number }
export type RiskLevel = 'on_track' | 'at_risk' | 'overdue';
