import workbookRows from './qualificationWorkbook.json';

export type QualificationSubject =
  | 'english'
  | 'english-home'
  | 'english-first-additional'
  | 'english-or-afrikaans'
  | 'home-language'
  | 'first-additional-language'
  | 'afrikaans-home'
  | 'sesotho-home'
  | 'isizulu-home'
  | 'mathematics'
  | 'mathematical-literacy'
  | 'technical-mathematics'
  | 'technical-sciences'
  | 'physical-sciences'
  | 'life-orientation'
  | 'life-sciences'
  | 'agricultural-sciences'
  | 'accounting'
  | 'business-studies'
  | 'economics'
  | 'geography'
  | 'history'
  | 'engineering-graphics-and-design';

export interface QualificationRequirement {
  label: string;
  anyOf: { subject: QualificationSubject; minimumMark: number }[];
}

export interface Qualification {
  id: string;
  institutionId: string;
  name: string;
  intakeYear?: number;
  durationYears?: number;
  durationRange?: {
    minYears: number;
    maxYears: number;
  };
  minimumScore?: number;
  minimumScoreOptions?: {
    minimumScore: number;
    subjects: { subject: QualificationSubject; minimumMark: number }[];
  }[];
  minimumAggregate?: number;
  requirements: QualificationRequirement[];
  sourceRequirements?: {
    language: string;
    mathematics: string;
    physicalSciences: string;
    other: string;
  };
  source: string;
  sourceReference?: string;
  checked: string;
  needsChecking?: boolean;
  selectionNote?: string;
}

const nwuEngineeringSource =
  'https://studies.nwu.ac.za/undergraduate-studies/engineering-2027';
const nwuBusinessSource =
  'https://studies.nwu.ac.za/undergraduate-studies/economic-and-management-sciences-2027';
const nwuLawSource = 'https://studies.nwu.ac.za/undergraduate-studies/law-2027';
const nwuNaturalSciencesSource =
  'https://studies.nwu.ac.za/undergraduate-studies/natural-and-agricultural-sciences-2027';
const nwuTheologySource = 'https://studies.nwu.ac.za/undergraduate-studies/theology-2027';
const ufsProspectusSource =
  'https://www.ufs.ac.za/docs/librariesprovider44/undergraduate/ufs---ug-prospectus-2027---jan.pdf?sfvrsn=f3a0f820_1';
const checked = '2026-10-24';

const nwuEnglish60 = {
  label: 'English or Afrikaans at 60% or higher',
  anyOf: [{ subject: 'english-or-afrikaans' as const, minimumMark: 60 }],
};

const nwuMathematics50 = {
  label: 'Mathematics at 50% or higher',
  anyOf: [{ subject: 'mathematics' as const, minimumMark: 50 }],
};

const nwuBusinessProgrammes: {
  name: string;
  score: number;
  englishMark: number;
  maths: { subject: QualificationSubject; minimumMark: number }[];
}[] = [
  { name: 'BCom in Accounting', score: 24, englishMark: 50, maths: [{ subject: 'mathematics', minimumMark: 40 }] },
  { name: 'BCom in Chartered Accountancy', score: 32, englishMark: 50, maths: [{ subject: 'mathematics', minimumMark: 60 }] },
  { name: 'Extended BCom in Chartered Accountancy', score: 28, englishMark: 50, maths: [{ subject: 'mathematics', minimumMark: 40 }] },
  { name: 'BCom in Forensic Accountancy', score: 36, englishMark: 60, maths: [{ subject: 'mathematics', minimumMark: 60 }] },
  { name: 'BCom in Management Accountancy', score: 30, englishMark: 50, maths: [{ subject: 'mathematics', minimumMark: 60 }] },
  { name: 'BCom in Financial Accountancy', score: 28, englishMark: 50, maths: [{ subject: 'mathematics', minimumMark: 50 }] },
  {
    name: 'Extended BCom in Financial Accountancy',
    score: 24,
    englishMark: 50,
    maths: [
      { subject: 'mathematics', minimumMark: 40 },
      { subject: 'mathematical-literacy', minimumMark: 80 },
    ],
  },
  { name: 'BCom in Operations Research', score: 24, englishMark: 50, maths: [{ subject: 'mathematics', minimumMark: 50 }] },
  { name: 'BCom in Statistics', score: 24, englishMark: 50, maths: [{ subject: 'mathematics', minimumMark: 50 }] },
  {
    name: 'Extended BCom in Statistics',
    score: 20,
    englishMark: 40,
    maths: [
      { subject: 'mathematics', minimumMark: 40 },
      { subject: 'mathematical-literacy', minimumMark: 50 },
    ],
  },
  { name: 'BCom in Business Operations: Logistics Management', score: 24, englishMark: 50, maths: [{ subject: 'mathematics', minimumMark: 40 }] },
  {
    name: 'Extended BCom in Business Operations: Logistics Management',
    score: 20,
    englishMark: 40,
    maths: [
      { subject: 'mathematics', minimumMark: 40 },
      { subject: 'mathematical-literacy', minimumMark: 50 },
    ],
  },
  { name: 'BCom in Business Operations: Transport Economics', score: 24, englishMark: 50, maths: [{ subject: 'mathematics', minimumMark: 40 }] },
  {
    name: 'Extended BCom in Business Operations: Transport Economics',
    score: 20,
    englishMark: 40,
    maths: [
      { subject: 'mathematics', minimumMark: 40 },
      { subject: 'mathematical-literacy', minimumMark: 50 },
    ],
  },
];

export const QUALIFICATIONS: Qualification[] = [
  ...[
    'Chemical Engineering',
    'Electrical and Electronic Engineering',
    'Computer and Electronic Engineering',
    'Mechanical Engineering',
    'Industrial Engineering',
    'Mechatronic Engineering',
  ].map((field): Qualification => ({
    id: `nwu-beng-${field.toLowerCase().replaceAll(' ', '-')}`,
    institutionId: 'nwu',
    name: `BEng ${field}`,
    intakeYear: 2027,
    minimumScore: 34,
    requirements: [
      nwuEnglish60,
      { label: 'Mathematics at 70% or higher', anyOf: [{ subject: 'mathematics', minimumMark: 70 }] },
      { label: 'Physical Sciences at 70% or higher', anyOf: [{ subject: 'physical-sciences', minimumMark: 70 }] },
    ],
    source: nwuEngineeringSource,
    checked,
    selectionNote: 'Admission is subject to faculty selection.',
  })),
  ...nwuBusinessProgrammes.map((programme): Qualification => ({
    id: `nwu-${programme.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
    institutionId: 'nwu',
    name: programme.name,
    intakeYear: 2027,
    minimumScore: programme.score,
    requirements: [
      {
        label: `English or Afrikaans at ${programme.englishMark}% or higher`,
        anyOf: [{ subject: 'english-or-afrikaans', minimumMark: programme.englishMark }],
      },
      {
        label: 'Mathematics or Mathematical Literacy requirement',
        anyOf: programme.maths,
      },
    ],
    source: nwuBusinessSource,
    checked,
  })),
  {
    id: 'nwu-xcel-engineering',
    institutionId: 'nwu',
    name: 'Engineering Xcel bridging programme',
    intakeYear: 2027,
    requirements: [
      { label: 'English or Afrikaans at 60% or higher', anyOf: [{ subject: 'english-or-afrikaans', minimumMark: 60 }] },
      { label: 'Mathematics at 40% or higher', anyOf: [{ subject: 'mathematics', minimumMark: 40 }] },
      { label: 'Physical Sciences at 40% or higher', anyOf: [{ subject: 'physical-sciences', minimumMark: 40 }] },
    ],
    source: nwuEngineeringSource,
    checked,
  },
  {
    id: 'nwu-ba-law',
    institutionId: 'nwu',
    name: 'BA in Law',
    intakeYear: 2027,
    minimumScore: 28,
    requirements: [
      { label: 'Home Language at 60% or higher', anyOf: [{ subject: 'home-language', minimumMark: 60 }] },
      { label: 'First Additional Language at 60% or higher', anyOf: [{ subject: 'first-additional-language', minimumMark: 60 }] },
    ],
    source: nwuLawSource,
    checked,
    selectionNote: 'Placement and faculty selection apply.',
  },
  {
    id: 'nwu-bcom-law',
    institutionId: 'nwu',
    name: 'BCom in Law',
    intakeYear: 2027,
    minimumScore: 30,
    requirements: [
      { label: 'Home Language at 60% or higher', anyOf: [{ subject: 'home-language', minimumMark: 60 }] },
      { label: 'First Additional Language at 60% or higher', anyOf: [{ subject: 'first-additional-language', minimumMark: 60 }] },
      nwuMathematics50,
    ],
    source: nwuLawSource,
    checked,
    selectionNote: 'Placement and faculty selection apply.',
  },
  {
    id: 'nwu-llb',
    institutionId: 'nwu',
    name: 'Bachelor of Laws (LLB)',
    intakeYear: 2027,
    minimumScore: 30,
    requirements: [
      { label: 'Home Language at 60% or higher', anyOf: [{ subject: 'home-language', minimumMark: 60 }] },
      { label: 'First Additional Language at 60% or higher', anyOf: [{ subject: 'first-additional-language', minimumMark: 60 }] },
    ],
    source: nwuLawSource,
    checked,
    selectionNote: 'Placement and faculty selection apply.',
  },
  {
    id: 'nwu-extended-llb',
    institutionId: 'nwu',
    name: 'Extended Bachelor of Laws (LLB)',
    intakeYear: 2027,
    minimumScore: 28,
    requirements: [
      { label: 'Home Language at 50% or higher', anyOf: [{ subject: 'home-language', minimumMark: 50 }] },
      { label: 'First Additional Language at 50% or higher', anyOf: [{ subject: 'first-additional-language', minimumMark: 50 }] },
      {
        label: 'Mathematics at 40% or Mathematical Literacy at 60%',
        anyOf: [
          { subject: 'mathematics', minimumMark: 40 },
          { subject: 'mathematical-literacy', minimumMark: 60 },
        ],
      },
    ],
    source: nwuLawSource,
    checked,
    selectionNote: 'Placement and faculty selection apply.',
  },
  ...[
    {
      name: 'Diploma in Animal Health',
      score: 22,
      science: [
        { subject: 'physical-sciences' as const, minimumMark: 40 },
        { subject: 'life-sciences' as const, minimumMark: 40 },
      ],
      maths: [
        { subject: 'mathematics' as const, minimumMark: 40 },
        { subject: 'technical-mathematics' as const, minimumMark: 50 },
      ],
    },
    {
      name: 'Diploma in Animal Science',
      score: 22,
      science: [
        { subject: 'physical-sciences' as const, minimumMark: 40 },
        { subject: 'life-sciences' as const, minimumMark: 40 },
        { subject: 'agricultural-sciences' as const, minimumMark: 50 },
      ],
      maths: [
        { subject: 'mathematics' as const, minimumMark: 40 },
        { subject: 'technical-mathematics' as const, minimumMark: 50 },
        { subject: 'mathematical-literacy' as const, minimumMark: 60 },
      ],
    },
  ].map((item): Qualification => ({
    id: `nwu-${item.name.toLowerCase().replaceAll(' ', '-')}`,
    institutionId: 'nwu',
    name: item.name,
    intakeYear: 2027,
    minimumScore: item.score,
    requirements: [
      { label: 'English at 40% or higher', anyOf: [{ subject: 'english' as const, minimumMark: 40 }] },
      {
        label: 'A qualifying science subject',
        anyOf: item.science,
      },
      {
        label: 'A qualifying mathematics subject',
        anyOf: item.maths,
      },
    ],
    source: nwuNaturalSciencesSource,
    checked,
  })),
  ...[
    {
      name: 'BSc Chemistry and Physics',
      maths: [{ subject: 'mathematics' as const, minimumMark: 60 }],
      score: 26,
    },
    {
      name: 'BSc Computer Science and Mathematics',
      maths: [{ subject: 'mathematics' as const, minimumMark: 60 }],
      score: 26,
    },
    {
      name: 'BSc Biochemistry and Chemistry',
      maths: [
        { subject: 'mathematics' as const, minimumMark: 50 },
        { subject: 'technical-mathematics' as const, minimumMark: 60 },
      ],
      score: 26,
    },
    {
      name: 'BSc Geography and Applied Mathematics',
      maths: [{ subject: 'mathematics' as const, minimumMark: 60 }],
      score: 26,
    },
  ].map((item): Qualification => ({
    id: `nwu-${item.name.toLowerCase().replaceAll(' ', '-')}`,
    institutionId: 'nwu',
    name: item.name,
    intakeYear: 2027,
    minimumScore: item.score,
    requirements: [
      {
        label: item.maths.some((option) => option.subject === 'technical-mathematics')
          ? 'Mathematics at 50% or Technical Mathematics at 60%'
          : 'Mathematics at 60%',
        anyOf: item.maths,
      },
      { label: 'Physical Sciences at 50% or higher', anyOf: [{ subject: 'physical-sciences' as const, minimumMark: 50 }] },
    ],
    source: nwuNaturalSciencesSource,
    checked,
  })),
  ...[
    'BSc Biological Sciences',
    'BSc Chemical and Physical Sciences',
    'BSc Computer Science and Informatics',
    'BSc Geosciences',
    'BSc Mathematical Sciences',
  ].map((name): Qualification => ({
    id: `ufs-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
    institutionId: 'ufs',
    name,
    intakeYear: 2027,
    minimumScore: 32,
    requirements: [
      { label: 'Mathematics at 60% or higher', anyOf: [{ subject: 'mathematics', minimumMark: 60 }] },
      { label: 'Life Sciences at 60% or higher', anyOf: [{ subject: 'life-sciences', minimumMark: 60 }] },
      { label: 'Physical Sciences at 60% or higher', anyOf: [{ subject: 'physical-sciences', minimumMark: 60 }] },
    ],
    source: ufsProspectusSource,
    checked,
    selectionNote: 'The prospectus gives common BSc minimums; some BSc fields have additional or different requirements.',
  })),
  ...[
    { name: 'BA in Ancient Languages', score: 24 },
    { name: 'BA in Pastoral Psychology', score: 26 },
    { name: 'BTh in Pastoral Counselling and Psychology', score: 26 },
    { name: 'Bachelor of Divinity (BDiv)', score: 24 },
    { name: 'BTh in Bible Languages and Bible Translation', score: 24 },
    { name: 'BTh in Christian Ministry', score: 24 },
  ].map((item): Qualification => ({
    id: `nwu-${item.name.toLowerCase().replaceAll(' ', '-')}`,
    institutionId: 'nwu',
    name: item.name,
    intakeYear: 2027,
    minimumScore: item.score,
    requirements: [
      { label: 'English at 50% or higher', anyOf: [{ subject: 'english' as const, minimumMark: 50 }] },
    ],
    source: nwuTheologySource,
    checked,
    selectionNote: 'Some programmes require consultation with an affiliated professional or church body.',
  })),
  ...[
    { name: 'BCom', score: 28, maths: 50 },
    { name: 'BCom with specialisation in Economics', score: 28, maths: 50 },
    { name: 'BCom with specialisation in Finance', score: 28, maths: 50 },
    { name: 'BCom with specialisation in Business Analytics', score: 34, maths: 60 },
    { name: 'BCom with specialisation in Marketing', score: 28, maths: 40 },
    { name: 'BCom with specialisation in Business Management', score: 28, maths: 40 },
    { name: 'BCom with specialisation in Human Resource Management', score: 28, maths: 40 },
    { name: 'BCom (Law)', score: 33, maths: 50 },
    { name: 'BAcc', score: 34, maths: 60 },
    { name: 'BCom (Accounting)', score: 28, maths: 50 },
    { name: 'BAdmin', score: 28, maths: 30 },
  ].map((item): Qualification => ({
    id: `ufs-${item.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
    institutionId: 'ufs',
    name: item.name,
    intakeYear: 2027,
    minimumScore: item.score,
    requirements: [
      { label: 'English at 50% or higher', anyOf: [{ subject: 'english' as const, minimumMark: 50 }] },
      { label: `Mathematics at ${item.maths}% or higher`, anyOf: [{ subject: 'mathematics' as const, minimumMark: item.maths }] },
    ],
    source: ufsProspectusSource,
    checked,
    selectionNote: 'UFS uses competitive merit selection; meeting the minimum does not guarantee admission.',
  })),
  {
    id: 'ufs-llb',
    institutionId: 'ufs',
    name: 'Bachelor of Laws (LLB)',
    intakeYear: 2027,
    minimumScore: 33,
    requirements: [
      { label: 'English at 70% or higher', anyOf: [{ subject: 'english', minimumMark: 70 }] },
      {
        label: 'Mathematics at 50% or Mathematical Literacy at 70%',
        anyOf: [
          { subject: 'mathematics', minimumMark: 50 },
          { subject: 'mathematical-literacy', minimumMark: 70 },
        ],
      },
    ],
    source: ufsProspectusSource,
    checked,
    selectionNote: 'UFS uses competitive merit selection; meeting the minimum does not guarantee admission.',
  },
  ...[
    { name: 'BMedSc in Radiation Science', score: 30, english: 60, maths: 60, life: 60, physical: 60 },
    { name: 'Bachelor of Medicine and Bachelor of Surgery (MB ChB)', score: 36, english: 60, maths: 60, life: 60, physical: 60 },
    { name: 'Bachelor of Optometry (BOptom)', score: 33, english: 60, maths: 50, life: 60, physical: 60 },
    { name: 'BSc Physiotherapy', score: 33, english: 60, maths: 50, life: 60, physical: 50 },
    { name: 'BSc Dietetics', score: 33, english: 60, maths: 50, life: 60, physical: 50 },
    { name: 'Bachelor of Occupational Therapy', score: 33, english: 60, maths: 50, life: 60, physical: 50 },
    { name: 'Bachelor of Biokinetics', score: 30, english: 60, maths: 50, life: 50, physical: 50 },
  ].map((item): Qualification => ({
    id: `ufs-${item.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
    institutionId: 'ufs',
    name: item.name,
    intakeYear: 2027,
    minimumScore: item.score,
    requirements: [
      { label: `English at ${item.english}% or higher`, anyOf: [{ subject: 'english' as const, minimumMark: item.english }] },
      { label: `Mathematics at ${item.maths}% or higher`, anyOf: [{ subject: 'mathematics' as const, minimumMark: item.maths }] },
      { label: `Life Sciences at ${item.life}% or higher`, anyOf: [{ subject: 'life-sciences' as const, minimumMark: item.life }] },
      { label: `Physical Sciences at ${item.physical}% or higher`, anyOf: [{ subject: 'physical-sciences' as const, minimumMark: item.physical }] },
    ],
    source: ufsProspectusSource,
    checked,
    selectionNote: 'This programme is selection-based. Life Sciences and/or Physical Sciences are required; confirm the current selection rules.',
  })),
];

function workbookSource(institutionId: string): string {
  if (institutionId === 'wits') return 'https://www.wits.ac.za/';
  if (institutionId === 'uct') return 'https://uct.ac.za/';
  if (institutionId === 'uct-science') return 'https://uct.ac.za/';
  if (institutionId === 'uj') return 'https://www.uj.ac.za/';
  if (institutionId === 'ukzn') return 'https://ukzn.ac.za/';
  if (institutionId === 'forthare') return 'https://www.ufh.ac.za/';
  if (institutionId === 'waltuni') return 'https://www.wsu.ac.za/index.php/en/';
  if (institutionId === 'unizulu') return 'https://www.unizulu.ac.za/';
  if (institutionId === 'sefako-makgatho') return 'https://www.smu.ac.za/';
  if (institutionId === 'up') return 'https://www.up.ac.za/';
  if (institutionId === 'stellies') return 'https://www.su.ac.za/en';
  throw new Error(`Unsupported institution in qualification workbook: ${institutionId}`);
}

function workbookQualificationSubject(subject: string): QualificationSubject {
  switch (subject) {
    case 'mathematical-literacy':
    case 'technical-mathematics':
    case 'mathematics':
      return subject;
    default:
      throw new Error(`Unsupported subject in qualification workbook score option: ${subject}`);
  }
}

const workbookQualifications: Qualification[] = workbookRows.map((row) => ({
  id: row.id,
  institutionId: row.institutionId,
  name: row.name,
  intakeYear: row.intakeYear,
  durationYears: row.durationYears ?? undefined,
  durationRange: row.durationRange ?? undefined,
  minimumScore: row.minimumScore ?? undefined,
  minimumScoreOptions: row.minimumScoreOptions?.map((option) => ({
    minimumScore: option.minimumScore,
    subjects: option.subjects.map(({ subject, minimumMark }) => ({
      subject: workbookQualificationSubject(subject),
      minimumMark,
    })),
  })),
  minimumAggregate: row.minimumAggregate ?? undefined,
  requirements: [],
  sourceRequirements: {
    ...row.requirements,
    other: row.requirements.other || (/in each of four school subjects/i.test(row.notes) ? row.notes : ''),
  },
  source: workbookSource(row.institutionId),
  sourceReference: `${row.sourceFile}${row.sourcePage ? `, p. ${row.sourcePage}` : ''}`,
  checked: row.institutionId === 'waltuni' ? '2025-01-01' : '2026-10-25',
  needsChecking: row.needsChecking,
  selectionNote: [row.selectionRequirements, row.notes].filter(Boolean).join(' '),
}));

QUALIFICATIONS.push(...workbookQualifications);

export const QUALIFICATION_COVERAGE: Record<string, string> = {
  wits: '58 programmes are included from the supplied 2027 prospectus dataset. Health Sciences points and graduate-entry LLB routes that do not use matric APS are excluded from automatic matching.',
  nwu: 'Initial list includes programmes from the linked Economic and Management Sciences, Engineering, Law, Natural and Agricultural Sciences, and Theology pages; Education and Humanities are not yet included.',
  ufs: 'Initial list includes selected Economic and Management Sciences, Natural Sciences, Law, and Health Sciences programmes from the 2027 prospectus.',
  uct: '23 Commerce, Engineering and Built Environment, Humanities, and Law programmes are included from the supplied prospectus dataset. FPS/WPS bands and NBT results are not assessed; rows flagged for checking are provisional.',
  'uct-science': 'The Science faculty BSc and MBChB subject requirements are matched using the separate UCT Science score estimate. FPS/WPS bands and NBT results are not assessed; confirm medicine selection thresholds with UCT.',
  uj: '179 programmes are included from the supplied 2027 prospectus dataset. Campus codes and parser-extracted requirements should be confirmed with UJ; flagged rows are provisional but still used for estimate matching.',
  ukzn: '66 programmes are included from the supplied prospectus dataset. Subject requirements are compared where the supplied shorthand can be interpreted; APS ranges use the lower bound transcribed in the source workbook. Treat flagged rows as provisional.',
  rhodes: 'The supplied entry-requirements page states that its minimum entry table is for 2024; a current 2027 source is needed before matching.',
  up: '2027 entry requirements are included from the supplied University of Pretoria faculty brochures. Flagged rows are provisional but still used for estimate matching.',
  stellies: '2027 programme-specific subject-mark requirements are included from the supplied Stellenbosch University prospectus. Some programmes require NBT results, which this calculator does not assess. Flagged rows are provisional but still used for estimate matching.',
  forthare: '52 programmes are included from the supplied 2027 flyer. Confirm current requirements and Life Orientation scoring against the official prospectus.',
  waltuni: '65 programmes from the supplied 2025 Information Brochure are used for estimate matching. The source has not been checked against current requirements, so matches are provisional.',
  unizulu: '42 programmes are included from the supplied UniZulu sheet. Its notes identify the prospectus as the 2021-intake edition, so these matches are provisional and may not reflect current requirements.',
  'sefako-makgatho': '19 programmes are included from the supplied 2027 SMU prospectus sheet. Ambiguous or conflicting rows are marked provisional; matches are estimates and do not include programme selection.',
  unisa: 'No qualification-level source was supplied for UNISA.',
  univen: 'No qualification-level source was supplied for the University of Venda.',
};
