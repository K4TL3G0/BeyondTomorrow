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
  TVET_COLLEGES,
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

  it('keeps TVET colleges out of the APS institution comparison list', () => {
    expect(TVET_COLLEGES).toHaveLength(50);
    expect(INSTITUTIONS.some(({ id }) => TVET_COLLEGES.some((college) => college.id === id))).toBe(false);
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
    const nmu = INSTITUTIONS.find((institution) => institution.id === 'neluni');
    const stellenbosch = INSTITUTIONS.find((institution) => institution.id === 'stellies');
    const rhodesMarks = [
      { name: 'English Home Language', percent: 72, counted: true },
      { name: 'Mathematics', percent: 65, counted: true },
      { name: 'Physical Sciences', percent: 58, counted: true },
      { name: 'Life Sciences', percent: 70, counted: true },
      { name: 'Geography', percent: 63, counted: true },
      { name: 'Accounting', percent: 55, counted: true },
      { name: 'History', percent: 90, counted: true },
      { name: 'Life Orientation', percent: 100, counted: true },
    ];
    expect(uj && calculateForInstitution(uj, entries).total).toBe(36);
    expect(uct && calculateForInstitution(uct, entries).total).toBe(440);
    expect(uctScience && calculateForInstitution(uctScience, entries).total).toBe(585);
    expect(wits && calculateForInstitution(wits, entries)).toMatchObject({ total: 45, maximum: 56 });
    expect(rhodes && calculateForInstitution(rhodes, rhodesMarks)).toMatchObject({
      total: 41.8,
      maximum: 60,
      breakdown: [
        { name: 'English Home Language', aps: 7.2, counted: true },
        { name: 'Mathematics', aps: 6.5, counted: true },
        { name: 'Physical Sciences', aps: 5.8, counted: true },
        { name: 'Life Sciences', aps: 7, counted: true },
        { name: 'Geography', aps: 6.3, counted: true },
        { name: 'Accounting', aps: 5.5, counted: false },
        { name: 'History', aps: 9, counted: true },
      ],
    });
    expect(nmu && calculateForInstitution(nmu, entries)).toMatchObject({ total: 440, maximum: 600 });
    expect(stellenbosch && calculateForInstitution(stellenbosch, entries)).toMatchObject({
      total: 440 / 6,
      maximum: 100,
    });
    expect(convertMark(29, 'univen')).toBe(1);
    expect(venda?.scheme).toMatchObject({ type: 'standard', excludeLO: true, scale: 'univen' });
    expect(INSTITUTIONS.some((institution) => institution.id === 'uni venda')).toBe(false);
  });

  it('excludes sub-30% subjects from TUT and uses NSC scoring for unverified rules', () => {
    const tut = INSTITUTIONS.find((institution) => institution.id === 'tut');
    const ufs = INSTITUTIONS.find((institution) => institution.id === 'ufs');
    const marks = [
      { name: 'English Home Language', percent: 90, counted: true },
      { name: 'Mathematics', percent: 80, counted: true },
      { name: 'Physical Sciences', percent: 70, counted: true },
      { name: 'Life Sciences', percent: 60, counted: true },
      { name: 'Geography', percent: 50, counted: true },
      { name: 'Accounting', percent: 29, counted: true },
      { name: 'Life Orientation', percent: 100, counted: true },
    ];

    expect(tut && calculateForInstitution(tut, marks)).toMatchObject({ total: 29, maximum: 42 });
    expect(ufs && calculateForInstitution(ufs, marks)).toMatchObject({ total: 30, maximum: 42 });
  });

  it('matches the supplied Wits example calculation', () => {
    const wits = INSTITUTIONS.find((institution) => institution.id === 'wits');
    const marks = [
      { name: 'English Home Language', percent: 72, counted: true },
      { name: 'Mathematics', percent: 65, counted: true },
      { name: 'Physical Sciences', percent: 58, counted: true },
      { name: 'Life Sciences', percent: 70, counted: true },
      { name: 'Geography', percent: 63, counted: true },
      { name: 'Accounting', percent: 55, counted: true },
      { name: 'Life Orientation', percent: 80, counted: true },
    ];

    expect(wits && calculateForInstitution(wits, marks)).toMatchObject({ total: 37, maximum: 56 });
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
