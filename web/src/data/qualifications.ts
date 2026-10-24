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
  | 'physical-sciences'
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
  minimumScore?: number;
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
const witsBcomSource = 'https://www.wits.ac.za/course-finder/undergraduate/clm/bcom/';
const witsBcomAccountingSource = 'https://www.wits.ac.za/course-finder/undergraduate/clm/accounting/';
const witsBcomLawSource = 'https://www.wits.ac.za/course-finder/undergraduate/clm/law/';
const witsLlbSource = 'https://www.wits.ac.za/course-finder/undergraduate/clm/llb-law/';
const witsCivilEngineeringSource = 'https://www.wits.ac.za/course-finder/undergraduate/ebe/civil-engineering/';
const witsChemicalEngineeringSource = 'https://www.wits.ac.za/course-finder/undergraduate/ebe/chemical-engineering/';
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
  {
    id: 'wits-bcom-general',
    institutionId: 'wits',
    name: 'Bachelor of Commerce (General)',
    minimumScore: 38,
    requirements: [
      { label: 'English Home Language or First Additional Language at 60% or higher', anyOf: [
        { subject: 'english-home', minimumMark: 60 },
        { subject: 'english-first-additional', minimumMark: 60 },
      ] },
      { label: 'Mathematics at 60% or higher', anyOf: [{ subject: 'mathematics', minimumMark: 60 }] },
    ],
    source: witsBcomSource,
    checked,
    selectionNote: 'Wait-listing and capacity-based selection may apply.',
  },
  {
    id: 'wits-bcom-accounting',
    institutionId: 'wits',
    name: 'Bachelor of Commerce (Accounting)',
    minimumScore: 38,
    requirements: [
      { label: 'English Home Language or First Additional Language at 60% or higher', anyOf: [
        { subject: 'english-home', minimumMark: 60 },
        { subject: 'english-first-additional', minimumMark: 60 },
      ] },
      { label: 'Mathematics at 60% or higher', anyOf: [{ subject: 'mathematics', minimumMark: 60 }] },
    ],
    source: witsBcomAccountingSource,
    checked,
    selectionNote: 'Wait-listing and capacity-based selection may apply.',
  },
  {
    id: 'wits-bcom-law',
    institutionId: 'wits',
    name: 'Bachelor of Commerce with Law',
    minimumScore: 43,
    requirements: [
      { label: 'English Home Language or First Additional Language at 60% or higher', anyOf: [
        { subject: 'english-home', minimumMark: 60 },
        { subject: 'english-first-additional', minimumMark: 60 },
      ] },
      { label: 'Mathematics at 60% or higher', anyOf: [{ subject: 'mathematics', minimumMark: 60 }] },
    ],
    source: witsBcomLawSource,
    checked,
    selectionNote: 'Wait-listing and capacity-based selection may apply.',
  },
  ...[
    { id: 'economics', name: 'Economics', source: 'https://www.wits.ac.za/course-finder/undergraduate/clm/economics/' },
    { id: 'finance', name: 'Finance', source: 'https://www.wits.ac.za/course-finder/undergraduate/clm/finance/' },
    { id: 'human-resources', name: 'Human Resource Management', source: 'https://www.wits.ac.za/course-finder/undergraduate/clm/human-resource-management/' },
    { id: 'information-systems', name: 'Information Systems', source: 'https://www.wits.ac.za/course-finder/undergraduate/clm/information-systems/' },
  ].map((specialisation): Qualification => ({
    id: `wits-bcom-${specialisation.id}`,
    institutionId: 'wits',
    name: `Bachelor of Commerce (${specialisation.name})`,
    minimumScore: 38,
    requirements: [
      { label: 'English Home Language or First Additional Language at 60% or higher', anyOf: [
        { subject: 'english-home', minimumMark: 60 },
        { subject: 'english-first-additional', minimumMark: 60 },
      ] },
      { label: 'Mathematics at 60% or higher', anyOf: [{ subject: 'mathematics', minimumMark: 60 }] },
    ],
    source: specialisation.source,
    checked,
    selectionNote: 'Wait-listing and capacity-based selection may apply.',
  })),
  ...[
    { name: 'BEng Civil Engineering', source: witsCivilEngineeringSource },
    { name: 'BEng Chemical Engineering', source: witsChemicalEngineeringSource },
  ].map((programme): Qualification => ({
    id: `wits-${programme.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
    institutionId: 'wits',
    name: programme.name,
    minimumScore: 42,
    requirements: [
      { label: 'English Home Language or First Additional Language at 60% or higher', anyOf: [
        { subject: 'english-home', minimumMark: 60 },
        { subject: 'english-first-additional', minimumMark: 60 },
      ] },
      { label: 'Mathematics at 60% or higher', anyOf: [{ subject: 'mathematics', minimumMark: 60 }] },
      { label: 'Physical Sciences at 60% or higher', anyOf: [{ subject: 'physical-sciences', minimumMark: 60 }] },
    ],
    source: programme.source,
    checked,
    selectionNote: 'Wait-listing and capacity-based selection may apply.',
  })),
  {
    id: 'wits-llb-four-year',
    institutionId: 'wits',
    name: 'LLB (four-year stream)',
    minimumScore: 46,
    requirements: [
      { label: 'English Home Language or First Additional Language at 70% or higher', anyOf: [
        { subject: 'english-home', minimumMark: 70 },
        { subject: 'english-first-additional', minimumMark: 70 },
      ] },
      {
        label: 'Mathematics at 60% or Mathematical Literacy at 70%',
        anyOf: [
          { subject: 'mathematics', minimumMark: 60 },
          { subject: 'mathematical-literacy', minimumMark: 70 },
        ],
      },
    ],
    source: witsLlbSource,
    checked,
    selectionNote: 'Wait-listing and capacity-based selection may apply. Graduate-entry streams use separate assessment rules.',
  },
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
  if (institutionId === 'up') return 'https://www.up.ac.za/';
  if (institutionId === 'stellies') return 'https://www.su.ac.za/en';
  throw new Error(`Unsupported institution in qualification workbook: ${institutionId}`);
}

const workbookQualifications: Qualification[] = workbookRows.map((row) => ({
  id: row.id,
  institutionId: row.institutionId,
  name: row.name,
  intakeYear: row.intakeYear,
  minimumScore: row.minimumScore ?? undefined,
  minimumAggregate: row.minimumAggregate ?? undefined,
  requirements: [],
  sourceRequirements: {
    ...row.requirements,
    other: row.requirements.other || (/in each of four school subjects/i.test(row.notes) ? row.notes : ''),
  },
  source: workbookSource(row.institutionId),
  sourceReference: `${row.sourceFile}${row.sourcePage ? `, p. ${row.sourcePage}` : ''}`,
  checked: '2026-10-24',
  needsChecking: row.needsChecking,
  selectionNote: [row.selectionRequirements, row.notes].filter(Boolean).join(' '),
}));

QUALIFICATIONS.push(...workbookQualifications);

export const QUALIFICATION_COVERAGE: Record<string, string> = {
  wits: 'Initial list includes verified Commerce specialisations, two Engineering degrees, and the four-year LLB. Other Wits degrees and selection-based routes are not yet included.',
  nwu: 'Initial list includes programmes from the linked Economic and Management Sciences, Engineering, Law, Natural and Agricultural Sciences, and Theology pages; Education and Humanities are not yet included.',
  ufs: 'Initial list includes selected Economic and Management Sciences, Natural Sciences, Law, and Health Sciences programmes from the 2027 prospectus.',
  uct: 'UCT selection also depends on NBT results, applicant category, and FPS/WPS rules that this calculator does not collect.',
  uj: 'Qualification-level requirements have not yet been structured from the linked prospectus.',
  ukzn: 'The supplied UKZN document is a postgraduate prospectus, so undergraduate qualifications are not included.',
  rhodes: 'The supplied entry-requirements page states that its minimum entry table is for 2024; a current 2027 source is needed before matching.',
  up: '2027 entry requirements are included from the supplied University of Pretoria faculty brochures. Rows flagged for checking are excluded from automatic matches.',
  stellies: '2027 entry requirements are included from the supplied Stellenbosch University prospectus. Rows flagged for checking are excluded from automatic matches.',
  unisa: 'No qualification-level source was supplied for UNISA.',
  univen: 'No qualification-level source was supplied for the University of Venda.',
};
