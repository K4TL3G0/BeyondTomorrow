export const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape',
] as const;

export type Province = (typeof PROVINCES)[number];

export const INSTITUTION_TYPES = ['University', 'TVET College'] as const;

export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

export type ApplicationStatusFilter = 'all' | 'open' | 'closing_soon' | 'opening_soon' | 'closed';

export type DeliveryModeFilter = 'all' | 'campus' | 'distance';

export const isProvince = (value: string): value is Province =>
  (PROVINCES as readonly string[]).includes(value);

export const isInstitutionType = (value: string): value is InstitutionType =>
  (INSTITUTION_TYPES as readonly string[]).includes(value);

export type ProgrammeRequirement =
  | {
      /** Exact faculty / programme name. */
      faculty: string;
      /** Verified APS rule, used by university admissions. */
      aps: string;
      requirement?: never;
      /** Subjects / selection conditions. */
      notes?: string;
    }
  | {
      /** Exact faculty / programme name. */
      faculty: string;
      aps?: never;
      /** Subject and level requirements, used by TVET admissions. */
      requirement: string;
      /** Subjects / selection conditions. */
      notes?: string;
    };

/**
 * Admissions fields. `null` always means "not verified", never "none required".
 * Only populate these after checking a current official source.
 */
export interface AdmissionsDetails {
  /** YYYY-MM-DD */
  openingDate: string | null;
  /** YYYY-MM-DD */
  closingDate: string | null;
  /** e.g. "2027 undergraduate" */
  intake: string | null;
  /** Official URL the dates came from. */
  dateSource: string | null;
  /** YYYY-MM-DD */
  dateVerifiedOn: string | null;
  requirements: readonly ProgrammeRequirement[];
  requiredDocuments: readonly string[] | null;
}

export interface Institution extends AdmissionsDetails {
  id: string;
  name: string;
  short: string;
  provinces: readonly Province[];
  type: InstitutionType;
  url: string;
  verified?: boolean;
  /** Distance-learning institution with national reach (e.g. Unisa). */
  distanceLearning?: boolean;
}

export type PreparationItemId =
  | 'identity'
  | 'results'
  | 'certificate'
  | 'address'
  | 'guardian'
  | 'payment'
  | 'additional'
  | 'international';

export interface PreparationItem {
  id: PreparationItemId;
  text: string;
}

export type ChecklistState = Record<PreparationItemId, boolean>;