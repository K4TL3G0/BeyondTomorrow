import { describe, expect, it } from 'vitest';
import { QUALIFICATIONS, type Qualification } from '../src/data/qualifications';
import {
  calculateNsCAggregate,
  qualificationMeetsRequirements,
  qualifyingQualifications,
} from '../src/lib/qualificationMatches';

const sixSubjectMarks = [
  { name: 'English Home Language', percent: 60, counted: true },
  { name: 'Mathematics', percent: 60, counted: true },
  { name: 'Physical Sciences', percent: 60, counted: true },
  { name: 'Life Sciences', percent: 60, counted: true },
  { name: 'Geography', percent: 60, counted: true },
  { name: 'History', percent: 60, counted: true },
];

const witsCommerce: Qualification = {
  id: 'wits-bcom',
  institutionId: 'wits',
  name: 'Bachelor of Commerce',
  minimumScore: 38,
  requirements: [
    {
      label: 'English at 60%',
      anyOf: [
        { subject: 'english-home', minimumMark: 60 },
        { subject: 'english-first-additional', minimumMark: 60 },
      ],
    },
    { label: 'Mathematics at 60%', anyOf: [{ subject: 'mathematics', minimumMark: 60 }] },
  ],
  source: 'https://example.com',
  checked: '2026-10-24',
};

describe('qualification matching', () => {
  it('matches at the exact score and subject-mark thresholds', () => {
    expect(qualificationMeetsRequirements(witsCommerce, [
      ...sixSubjectMarks,
      { name: 'English First Additional Language', percent: 60, counted: true },
    ], 38)).toBe(true);
  });

  it('requires every subject group and the minimum score', () => {
    const marks = [
      { name: 'English Home Language', percent: 75, counted: true },
      { name: 'Mathematics', percent: 59, counted: true },
      ...sixSubjectMarks.slice(2),
    ];
    expect(qualificationMeetsRequirements(witsCommerce, marks, 38)).toBe(false);
    expect(qualificationMeetsRequirements(witsCommerce, [
      { ...marks[0]!, percent: 75 },
      { name: 'Mathematics', percent: 60, counted: true },
      ...sixSubjectMarks.slice(2),
    ], 37)).toBe(false);
  });

  it('returns matching qualifications for only the requested institution', () => {
    expect(qualifyingQualifications([witsCommerce], 'wits', [
      ...sixSubjectMarks,
    ], 38)).toEqual([witsCommerce]);
    expect(qualifyingQualifications([witsCommerce], 'uj', [], 50)).toEqual([]);
  });

  it('matches verified Wits engineering and LLB requirements, including the Maths Lit alternative', () => {
    const witsEngineering = QUALIFICATIONS.find(({ id }) => id === 'wits-beng-civil-engineering');
    const witsLlb = QUALIFICATIONS.find(({ id }) => id === 'wits-llb-four-year');
    expect(witsEngineering).toBeDefined();
    expect(witsLlb).toBeDefined();

    expect(qualificationMeetsRequirements(witsEngineering!, [
      { name: 'English Home Language', percent: 60, counted: true },
      { name: 'Mathematics', percent: 60, counted: true },
      { name: 'Physical Sciences', percent: 60, counted: true },
      ...sixSubjectMarks.slice(3),
    ], 42)).toBe(true);
    expect(qualificationMeetsRequirements(witsLlb!, [
      { name: 'English First Additional Language', percent: 70, counted: true },
      { name: 'Mathematical Literacy', percent: 70, counted: true },
      ...sixSubjectMarks.slice(2),
    ], 46)).toBe(true);
  });

  it('supports the NWU Technical Mathematics alternative for Biochemistry and Chemistry', () => {
    const nwuQualification = QUALIFICATIONS.find(({ id }) =>
      id === 'nwu-bsc-biochemistry-and-chemistry',
    );
    expect(nwuQualification).toBeDefined();
    expect(qualificationMeetsRequirements(nwuQualification!, [
      { name: 'Technical Mathematics', percent: 60, counted: true },
      { name: 'Physical Sciences', percent: 50, counted: true },
      ...sixSubjectMarks.slice(2),
    ], 26)).toBe(true);
  });

  it('matches supplied UP APS and subject requirements, and excludes rows flagged for checking', () => {
    const upProgramme = QUALIFICATIONS.find(({ id }) => id === 'up-workbook-row-2');
    const uncheckedProgramme = QUALIFICATIONS.find(({ id }) => id === 'up-workbook-row-17');
    expect(upProgramme).toBeDefined();
    expect(uncheckedProgramme).toBeDefined();

    expect(qualificationMeetsRequirements(upProgramme!, [
      { name: 'English Home Language', percent: 60, counted: true },
      { name: 'Mathematics', percent: 40, counted: true },
      ...sixSubjectMarks.slice(2),
    ], 28)).toBe(true);
    expect(qualificationMeetsRequirements(uncheckedProgramme!, [
      ...sixSubjectMarks,
    ], 40)).toBe(false);
  });

  it('supports alternative Maths Lit and science subjects while respecting explicit exclusions', () => {
    const mathsLitProgramme = QUALIFICATIONS.find(({ id }) => id === 'up-workbook-row-2');
    const scienceAlternative = QUALIFICATIONS.find(({ id }) => id === 'up-workbook-row-61');
    const lifeSciencesOnlyProgramme = QUALIFICATIONS.find(({ id }) => id === 'up-workbook-row-65');
    expect(mathsLitProgramme).toBeDefined();
    expect(scienceAlternative).toBeDefined();
    expect(lifeSciencesOnlyProgramme).toBeDefined();

    const alternativeMarks = [
      { name: 'English Home Language', percent: 60, counted: true },
      { name: 'Mathematical Literacy', percent: 50, counted: true },
      { name: 'Mathematics', percent: 50, counted: true },
      { name: 'Life Sciences', percent: 50, counted: true },
      { name: 'Geography', percent: 60, counted: true },
      { name: 'History', percent: 60, counted: true },
      { name: 'Accounting', percent: 60, counted: true },
    ];
    expect(qualificationMeetsRequirements(mathsLitProgramme!, alternativeMarks, 28)).toBe(true);
    expect(qualificationMeetsRequirements(scienceAlternative!, alternativeMarks, 28)).toBe(true);
    expect(qualificationMeetsRequirements(lifeSciencesOnlyProgramme!, [
      { name: 'English Home Language', percent: 60, counted: true },
      { name: 'Mathematics', percent: 50, counted: true },
      { name: 'Life Sciences', percent: 40, counted: true },
      { name: 'Physical Sciences', percent: 80, counted: true },
      { name: 'Geography', percent: 60, counted: true },
      { name: 'History', percent: 60, counted: true },
      { name: 'Accounting', percent: 60, counted: true },
    ], 28)).toBe(false);
  });

  it('checks Stellenbosch aggregate and required subjects using the best six marks excluding LO', () => {
    const programme = QUALIFICATIONS.find(({ id }) => id === 'stellies-workbook-row-101');
    expect(programme).toBeDefined();
    const marks = [
      ...sixSubjectMarks,
      { name: 'Life Orientation', percent: 100, counted: true },
    ];
    const aggregate = calculateNsCAggregate(marks);
    expect(aggregate).toBe(60);
    expect(qualificationMeetsRequirements(programme!, marks, 0, aggregate)).toBe(true);
    expect(qualificationMeetsRequirements(programme!, marks, 0, 59.99)).toBe(false);
    expect(calculateNsCAggregate(marks.slice(0, 5))).toBeNull();
  });

  it('requires two qualifying language marks where the workbook says at least two', () => {
    const programme = QUALIFICATIONS.find(({ id }) => id === 'stellies-workbook-row-157');
    expect(programme).toBeDefined();
    const twoLanguages = [
      { name: 'English Home Language', percent: 60, counted: true },
      { name: 'Afrikaans First Additional Language', percent: 60, counted: true },
      { name: 'Mathematics', percent: 50, counted: true },
      { name: 'Physical Sciences', percent: 50, counted: true },
      { name: 'History', percent: 100, counted: true },
      { name: 'Geography', percent: 100, counted: true },
    ];
    expect(qualificationMeetsRequirements(
      programme!,
      twoLanguages,
      0,
      calculateNsCAggregate(twoLanguages),
    )).toBe(true);

    const oneLanguage = twoLanguages.map((entry) =>
      entry.name === 'Afrikaans First Additional Language'
        ? { ...entry, percent: 59 }
        : entry,
    );
    expect(qualificationMeetsRequirements(
      programme!,
      oneLanguage,
      0,
      calculateNsCAggregate(oneLanguage),
    )).toBe(false);
  });
});
