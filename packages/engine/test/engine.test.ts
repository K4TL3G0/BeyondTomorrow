import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CONFIG,
  configFromRows,
  evaluateEligibility,
  pointsForMark,
  recommend,
  whatIf,
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
