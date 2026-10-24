import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CONFIG,
  configFromRows,
  evaluateEligibility,
  pointsForMark,
  recommend,
  whatIf,
  calculateAps,
  calculateForInstitution,
  convertMark,
  INSTITUTIONS,
  isValidMark,
} from '../src';

describe('configFromRows', () => {
  it('reads known keys and falls back to defaults', () => {
    const cfg = configFromRows([{ key: 'close_aps_margin', value: '4' }]);
    expect(cfg.closeApsMargin).toBe(4);
    expect(cfg.wFit).toBe(DEFAULT_CONFIG.wFit);
  });
});

describe('pointsForMark', () => {
  const bands = [
    { minMark: 70, maxMark: 100, points: 6 },
    { minMark: 0, maxMark: 69, points: 1 },
  ];
  it('maps a percentage to points', () => {
    expect(pointsForMark(75, bands)).toBe(6);
    expect(pointsForMark(10, bands)).toBe(1);
  });
});

describe('APS calculator', () => {
  const entries = [
    { name: 'English Home Language', percent: 70, counted: true },
    { name: 'Mathematics', percent: 65, counted: true },
    { name: 'Physical Sciences', percent: 80, counted: true },
    { name: 'Life Sciences', percent: 75, counted: true },
    { name: 'Geography', percent: 90, counted: true },
    { name: 'History', percent: 60, counted: true },
    { name: 'Life Orientation', percent: 90, counted: true },
  ];

  it('validates percentages and converts standard and UFS bands', () => {
    expect(isValidMark(0)).toBe(true);
    expect(isValidMark(100)).toBe(true);
    expect(isValidMark(-1)).toBe(false);
    expect(isValidMark(100.1)).toBe(false);
    expect(convertMark(29)).toBe(1);
    expect(convertMark(30)).toBe(2);
    expect(convertMark(80)).toBe(7);
    expect(convertMark(29, 'ufs')).toBe(0);
    expect(convertMark(90, 'ufs')).toBe(8);
  });

  it('totals counted subjects while retaining excluded rows in the breakdown', () => {
    const result = calculateAps([
      { name: 'English', percent: 80, counted: true },
      { name: 'History', percent: 90, counted: false },
    ]);
    expect(result.total).toBe(7);
    expect(result.countedSubjects).toBe(1);
    expect(result.breakdown[1]?.aps).toBe(0);
  });

  it('applies institution-specific subject rules and exposes the corrected Venda id', () => {
    const uj = INSTITUTIONS.find((institution) => institution.id === 'uj');
    const uct = INSTITUTIONS.find((institution) => institution.id === 'uct');
    const uctScience = INSTITUTIONS.find((institution) => institution.id === 'uct-science');
    const wits = INSTITUTIONS.find((institution) => institution.id === 'wits');
    const rhodes = INSTITUTIONS.find((institution) => institution.id === 'rhodes');
    const venda = INSTITUTIONS.find((institution) => institution.id === 'univen');
    expect(uj && calculateForInstitution(uj, entries).total).toBe(36);
    expect(uct && calculateForInstitution(uct, entries).total).toBe(440);
    expect(uctScience && calculateForInstitution(uctScience, entries).total).toBe(585);
    expect(wits && calculateForInstitution(wits, entries).total).toBe(44);
    expect(rhodes && calculateForInstitution(rhodes, entries)).toMatchObject({
      total: 44,
      maximum: 60,
      breakdown: [
        { name: 'English Home Language', aps: 7, counted: true },
        { name: 'Mathematics', aps: 6.5, counted: true },
        { name: 'Physical Sciences', aps: 8, counted: true },
        { name: 'Life Sciences', aps: 7.5, counted: true },
        { name: 'Geography', aps: 9, counted: true },
        { name: 'History', aps: 6, counted: true },
      ],
    });
    expect(rhodes && calculateForInstitution(rhodes, [
      { name: 'English Home Language', percent: 39, counted: true },
    ]).breakdown[0]?.aps).toBe(0);
    expect(convertMark(29, 'univen')).toBe(1);
    expect(venda?.scheme).toMatchObject({ type: 'standard', excludeLO: true, scale: 'univen' });
    expect(INSTITUTIONS.some((institution) => institution.id === 'uni venda')).toBe(false);
  });
});

// Hand-compute five fictional students BEFORE writing the engine, then turn
// these todos into real tests. Include one exactly at a cut-off and one on an
// income-threshold boundary. They double as your demo personas.
describe('personas (write expected results by hand first)', () => {
  it('Persona 1: comfortably qualifies', () => {
    const student = {
      interests: ['technology', 'maths'],
      incomeBracket: 'up_to_350k' as const,
      marks: [
        { subjectCode: 'MATH', percent: 82 },
        { subjectCode: 'ENGHL', percent: 78 },
        { subjectCode: 'PHSC', percent: 74 },
        { subjectCode: 'CAT', percent: 88 },
        { subjectCode: 'LO', percent: 65 },
        { subjectCode: 'HIST', percent: 70 },
      ],
    };

    const institution = {
      id: 'inst-1',
      name: 'Demo University',
      apsMethodCode: 'DEMO_BEST_SIX',
      bands: [
        { minMark: 80, maxMark: 100, points: 7 },
        { minMark: 70, maxMark: 79, points: 6 },
        { minMark: 60, maxMark: 69, points: 5 },
        { minMark: 50, maxMark: 59, points: 4 },
        { minMark: 40, maxMark: 49, points: 3 },
        { minMark: 30, maxMark: 39, points: 2 },
        { minMark: 0, maxMark: 29, points: 1 },
      ],
      sourceUrl: 'https://example.com',
      lastVerified: '2026-10-18',
    };

    const course = {
      id: 'course-1',
      institutionId: 'inst-1',
      name: 'BSc Computer Science (DEMO)',
      fieldTags: ['technology', 'computing', 'maths'],
      minAps: 32,
      province: 'Gauteng' as const,
      applicationDeadline: '2026-11-30',
      applicationUrl: 'https://example.com/apply',
      sourceUrl: 'https://example.com/requirements',
      lastVerified: '2026-10-18',
      requirements: [{ subjectCode: 'MATH', minMark: 60 }],
    };

    const result = evaluateEligibility(student, course, institution, DEFAULT_CONFIG);
    expect(result.verdict).toBe('qualifies');
    expect(result.studentAps).toBeGreaterThanOrEqual(32);
  });

  it('Persona 4: not yet, Maths too low, what-if unlocks courses', () => {
    const student = {
      interests: ['technology'],
      incomeBracket: 'up_to_350k' as const,
      marks: [
        { subjectCode: 'MATH', percent: 55 },
        { subjectCode: 'ENGHL', percent: 60 },
        { subjectCode: 'PHSC', percent: 60 },
        { subjectCode: 'CAT', percent: 82 },
        { subjectCode: 'LO', percent: 70 },
        { subjectCode: 'HIST', percent: 68 },
        { subjectCode: 'ECON', percent: 55 },
      ],
    };

    const course = {
      id: 'course-1',
      institutionId: 'inst-1',
      name: 'BSc Computer Science (DEMO)',
      fieldTags: ['technology', 'computing', 'maths'],
      minAps: 32,
      province: 'Gauteng' as const,
      applicationDeadline: '2026-11-30',
      applicationUrl: 'https://example.com/apply',
      sourceUrl: 'https://example.com/requirements',
      lastVerified: '2026-10-18',
      requirements: [{ subjectCode: 'MATH', minMark: 60 }],
    };

    const institution = {
      id: 'inst-1',
      name: 'Demo University',
      apsMethodCode: 'DEMO_BEST_SIX',
      bands: [
        { minMark: 80, maxMark: 100, points: 7 },
        { minMark: 70, maxMark: 79, points: 6 },
        { minMark: 60, maxMark: 69, points: 5 },
        { minMark: 50, maxMark: 59, points: 4 },
        { minMark: 40, maxMark: 49, points: 3 },
        { minMark: 30, maxMark: 39, points: 2 },
        { minMark: 0, maxMark: 29, points: 1 },
      ],
      sourceUrl: 'https://example.com',
      lastVerified: '2026-10-18',
    };

    const data = {
      institutions: [institution],
      courses: [course],
      funding: [],
    };

    const baseline = recommend(student, data, DEFAULT_CONFIG);
    expect(baseline[0]?.verdict).toBe('close');

    const diff = whatIf(student, [{ subjectCode: 'MATH', percent: 82 }], data, DEFAULT_CONFIG);
    expect(diff.unlocked.some((item) => item.courseId === course.id)).toBe(true);
    expect(diff.modified[0]?.verdict).toBe('qualifies');
  });
});
