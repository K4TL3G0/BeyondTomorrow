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
  it('separates UCT Science faculty qualifications from the main UCT card', () => {
    const uctQualifications = QUALIFICATIONS.filter(({ institutionId }) => institutionId === 'uct');
    const uctScienceQualifications = QUALIFICATIONS.filter(({ institutionId }) =>
      institutionId === 'uct-science');

    expect(uctQualifications).toHaveLength(23);
    expect(uctScienceQualifications.map(({ name }) => name).sort()).toEqual([
      'BSc (all programmes)',
      'MBChB',
    ].sort());
    expect(uctScienceQualifications.every(({ needsChecking }) => needsChecking)).toBe(true);
  });

  it('matches UCT MBChB subject thresholds under the separate Science calculator', () => {
    const mbchb = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-uct-row-70');
    expect(mbchb?.institutionId).toBe('uct-science');

    const eligibleMarks = [
      { name: 'English Home Language', percent: 65, counted: true },
      { name: 'Mathematics', percent: 70, counted: true },
      { name: 'Physical Sciences', percent: 70, counted: true },
      { name: 'Life Sciences', percent: 70, counted: true },
      { name: 'Geography', percent: 70, counted: true },
      { name: 'History', percent: 70, counted: true },
    ];
    expect(qualificationMeetsRequirements(mbchb!, eligibleMarks, 500)).toBe(true);
    expect(qualificationMeetsRequirements(mbchb!, [
      ...eligibleMarks.slice(0, 5),
      { name: 'History', percent: 69, counted: true },
    ], 500)).toBe(false);
  });

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
    const witsEngineering = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-wits-row-13');
    const witsLlb = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-wits-row-10');
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

  it('matches supplied UP APS and subject requirements, including provisional rows', () => {
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
    ], 40)).toBe(true);
  });

  it('loads the UniZulu and SMU workbook sheets and applies their subject-level requirements', () => {
    const unizuluQualifications = QUALIFICATIONS.filter(({ institutionId }) => institutionId === 'unizulu');
    const smuQualifications = QUALIFICATIONS.filter(({ institutionId }) =>
      institutionId === 'sefako-makgatho');
    const unizuluCertificate = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-unizulu-row-2');
    const smuMedicine = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-smu-row-2');
    expect(unizuluQualifications).toHaveLength(42);
    expect(smuQualifications).toHaveLength(19);
    expect(unizuluCertificate).toBeDefined();
    expect(smuMedicine).toBeDefined();

    const unizuluMarks = [
      { name: 'English Home Language', percent: 40, counted: true },
      { name: 'Mathematics', percent: 40, counted: true },
      { name: 'Physical Sciences', percent: 80, counted: true },
      { name: 'Life Sciences', percent: 80, counted: true },
      { name: 'Geography', percent: 80, counted: true },
      { name: 'History', percent: 80, counted: true },
    ];
    expect(qualificationMeetsRequirements(unizuluCertificate!, unizuluMarks, 30)).toBe(true);

    const smuMarks = [
      { name: 'English Home Language', percent: 80, counted: true },
      { name: 'Mathematics', percent: 80, counted: true },
      { name: 'Physical Sciences', percent: 80, counted: true },
      { name: 'Life Sciences', percent: 80, counted: true },
      { name: 'Geography', percent: 80, counted: true },
      { name: 'History', percent: 80, counted: true },
      { name: 'Life Orientation', percent: 60, counted: true },
    ];
    expect(qualificationMeetsRequirements(smuMedicine!, smuMarks, 42)).toBe(true);
    expect(qualificationMeetsRequirements(smuMedicine!, [
      ...smuMarks.slice(0, 3),
      { name: 'Life Sciences', percent: 50, counted: true },
      ...smuMarks.slice(4),
    ], 42)).toBe(false);
  });

  it('matches Wits and UJ and uses supplied UCT requirements without assessing FPS/WPS', () => {
    const witsBAccSci = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-wits-row-3');
    const uctBCom = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-uct-row-60');
    const uctComputerScience = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-uct-row-61');
    const ujArchitecture = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-uj-row-85');
    expect(witsBAccSci).toBeDefined();
    expect(uctBCom).toBeDefined();
    expect(uctComputerScience).toBeDefined();
    expect(ujArchitecture).toBeDefined();

    const witsMarks = [
      { name: 'English Home Language', percent: 60, counted: true },
      { name: 'Mathematics', percent: 70, counted: true },
      ...sixSubjectMarks.slice(2),
    ];
    expect(qualificationMeetsRequirements(witsBAccSci!, witsMarks, 44)).toBe(true);
    expect(qualificationMeetsRequirements(witsBAccSci!, witsMarks, 43)).toBe(false);

    expect(uctBCom!.needsChecking).toBe(true);
    expect(qualificationMeetsRequirements(uctBCom!, sixSubjectMarks, 600)).toBe(true);
    expect(qualificationMeetsRequirements(uctBCom!, [
      { name: 'English First Additional Language', percent: 59, counted: true },
      { name: 'Mathematics', percent: 60, counted: true },
    ], null)).toBe(false);
    expect(qualificationMeetsRequirements(uctComputerScience!, [
      { name: 'English Home Language', percent: 50, counted: true },
      { name: 'Mathematics', percent: 69, counted: true },
    ], null)).toBe(false);
    expect(qualificationMeetsRequirements(uctComputerScience!, [
      { name: 'English Home Language', percent: 50, counted: true },
      { name: 'Mathematics', percent: 70, counted: true },
    ], null)).toBe(true);
    expect(qualificationMeetsRequirements(ujArchitecture!, [
      ...sixSubjectMarks,
    ], 30)).toBe(true);
  });

  it('applies UJ score alternatives and keeps unsupported compressed rules out of matches', () => {
    const fortHareQualifications = QUALIFICATIONS.filter(({ institutionId }) =>
      institutionId === 'forthare');
    const ujProgramme = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-uj-row-86');
    const ukznProgramme = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-ukzn-row-264');
    const wsuProgramme = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-waltuni-row-330');
    const fortHareProgramme = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-forthare-row-412');
    expect(ujProgramme).toBeDefined();
    expect(ukznProgramme).toBeDefined();
    expect(wsuProgramme).toBeDefined();
    expect(fortHareProgramme).toBeDefined();
    expect(fortHareQualifications).toHaveLength(52);

    const mathsLitMarks = [
      { name: 'English Home Language', percent: 60, counted: true },
      { name: 'Mathematical Literacy', percent: 50, counted: true },
      ...sixSubjectMarks.slice(2),
    ];
    expect(qualificationMeetsRequirements(ujProgramme!, mathsLitMarks, 25)).toBe(false);
    expect(qualificationMeetsRequirements(ujProgramme!, mathsLitMarks, 26)).toBe(true);

    expect(ukznProgramme!.needsChecking).toBe(true);
    expect(wsuProgramme!.needsChecking).toBe(true);
    expect(fortHareProgramme!.needsChecking).toBe(false);
    expect(qualificationMeetsRequirements(ukznProgramme!, sixSubjectMarks, 48)).toBe(false);
    expect(qualificationMeetsRequirements(wsuProgramme!, sixSubjectMarks, 42)).toBe(true);
    expect(qualificationMeetsRequirements(fortHareProgramme!, sixSubjectMarks, 30)).toBe(false);

    const fortHareLawMarks = [
      { name: 'English Home Language', percent: 60, counted: true },
      { name: 'Mathematical Literacy', percent: 50, counted: true },
      { name: 'Technical Mathematics', percent: 50, counted: true },
      { name: 'Physical Sciences', percent: 50, counted: true },
      { name: 'Life Sciences', percent: 50, counted: true },
      { name: 'Geography', percent: 50, counted: true },
      { name: 'History', percent: 50, counted: true },
      { name: 'Life Orientation', percent: 50, counted: true },
    ];
    expect(qualificationMeetsRequirements(
      fortHareProgramme!,
      fortHareLawMarks.slice(0, -1),
      30,
    )).toBe(false);
    expect(qualificationMeetsRequirements(fortHareProgramme!, fortHareLawMarks, 30)).toBe(true);
  });

  it('applies subject-specific APS alternatives for UFH and UJ programmes', () => {
    const fortHareEducation = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-forthare-row-395');
    const ujArchitecture = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-uj-row-92');
    expect(fortHareEducation).toBeDefined();
    expect(ujArchitecture).toBeDefined();

    const mathsLitMarks = [
      { name: 'English Home Language', percent: 60, counted: true },
      { name: 'Mathematical Literacy', percent: 60, counted: true },
      { name: 'Agricultural Science', percent: 50, counted: true },
      { name: 'Life Sciences', percent: 50, counted: true },
      { name: 'Physical Sciences', percent: 50, counted: true },
      { name: 'Geography', percent: 50, counted: true },
      { name: 'Life Orientation', percent: 50, counted: true },
    ];
    expect(qualificationMeetsRequirements(fortHareEducation!, mathsLitMarks, 28)).toBe(false);
    expect(qualificationMeetsRequirements(fortHareEducation!, mathsLitMarks, 29)).toBe(true);

    const technicalMathsMarks = [
      { name: 'English Home Language', percent: 60, counted: true },
      { name: 'Technical Mathematics', percent: 60, counted: true },
      { name: 'Physical Sciences', percent: 60, counted: true },
      { name: 'Life Sciences', percent: 60, counted: true },
      { name: 'Geography', percent: 60, counted: true },
      { name: 'History', percent: 60, counted: true },
    ];
    expect(qualificationMeetsRequirements(ujArchitecture!, technicalMathsMarks, 25)).toBe(false);
    expect(qualificationMeetsRequirements(ujArchitecture!, technicalMathsMarks, 26)).toBe(true);
  });

  it('honors explicit percentages and checks subject requirements for provisional rows', () => {
    const ukznEngineering = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-ukzn-row-264');
    const witsMedicine = QUALIFICATIONS.find(({ id }) => id === 'sa-aps-wits-row-27');
    expect(ukznEngineering).toBeDefined();
    expect(witsMedicine).toBeDefined();

    expect(ukznEngineering!.needsChecking).toBe(true);
    expect(qualificationMeetsRequirements(ukznEngineering!, sixSubjectMarks, 48)).toBe(false);
    expect(qualificationMeetsRequirements(witsMedicine!, [
      ...sixSubjectMarks,
    ], null)).toBe(true);
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

  it('checks Stellenbosch programme marks and percentage aggregate without an APS score', () => {
    const programme = QUALIFICATIONS.find(({ id }) => id === 'stellies-workbook-row-101');
    expect(programme).toBeDefined();
    const marks = [
      ...sixSubjectMarks,
      { name: 'Life Orientation', percent: 100, counted: true },
    ];
    const aggregate = calculateNsCAggregate(marks);
    expect(aggregate).toBe(60);
    expect(qualificationMeetsRequirements(programme!, marks, null, aggregate)).toBe(true);
    expect(qualificationMeetsRequirements(programme!, marks, null, 59.99)).toBe(false);
    expect(calculateNsCAggregate(marks.slice(0, 5))).toBeNull();
  });

  it('lists NBT AQL and MAT as required for Stellenbosch Faculty of Law degrees', () => {
    const lawProgrammeIds = [
      'stellies-workbook-row-137',
      'stellies-workbook-row-138',
      'stellies-workbook-row-149',
      'stellies-workbook-row-150',
      'stellies-workbook-row-151',
    ];

    lawProgrammeIds.forEach((id) => {
      const programme = QUALIFICATIONS.find((qualification) => qualification.id === id);
      expect(programme?.selectionNote).toContain('NBT AQL and MAT required');
    });
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
      null,
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
      null,
      calculateNsCAggregate(oneLanguage),
    )).toBe(false);
  });
});
