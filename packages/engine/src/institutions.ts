import type { ApsInstitution } from './aps';

export const INSTITUTIONS: ApsInstitution[] = [
  {
    id: 'wits',
    name: 'Wits',
    year: 2027,
    checked: '2026-10-20',
    source: 'https://www.wits.ac.za/',
    scheme: { type: 'wits' },
    notes: [
      'Wits uses its own weighted scale: English and Mathematics get +2 from 60%, and Life Orientation is counted on a smaller scale (max 4).',
      'Faculty-specific subjects must be part of your seven. Health Sciences uses a different index, not APS.',
    ],
    caveat:
      'These rules come from several secondary sources that agree with each other; a few sites say Wits counts the best six without Life Orientation. Confirm against the Wits prospectus.',
  },
  {
    id: 'uj',
    name: 'UJ',
    year: 2027,
    checked: '2026-10-20',
    source: 'https://www.uj.ac.za/wp-content/uploads/2021/09/lifeuj2027-online.pdf',
    scheme: { type: 'standard', bestN: 6, excludeLO: true },
    notes: ['Best six subjects, Life Orientation excluded. Your six must include the subjects your programme requires.'],
  },
  {
    id: 'up',
    name: 'UP',
    year: 2026,
    checked: '2026-10-20',
    source: 'https://www.up.ac.za/faculty-of-humanities/important-information-prospective-students',
    scheme: { type: 'standard', bestN: 6, excludeLO: true },
    notes: [
      'Six recognised 20-credit subjects on the 1-7 scale; Life Orientation is excluded.',
      'Some faculties (for example Health Sciences) add their own selection criteria.',
    ],
  },
  {
    id: 'uct',
    name: 'UCT (Commerce, Engineering, Humanities, Law)',
    year: 2027,
    checked: '2026-10-20',
    source:
      'https://uct.ac.za/sites/default/files/media/documents/2027-national-senior-certificate-nsc-guidelines-for-admissions.pdf',
    scheme: { type: 'uct', variant: 'general' },
    notes: [
      'UCT scores your actual percentages: English plus your best five other subjects, out of 600. Marks below 40% score nothing; Life Orientation is excluded.',
      'UCT also applies a disadvantage factor (WPS) for South African applicants and requires NBTs. Neither is calculated here.',
      'Health Sciences adds NBT scores to this score (out of 900), so it cannot be calculated here.',
    ],
  },
  {
    id: 'uct-science',
    name: 'UCT (Science)',
    year: 2027,
    checked: '2026-10-20',
    source:
      'https://uct.ac.za/sites/default/files/media/documents/2027-national-senior-certificate-nsc-guidelines-for-admissions.pdf',
    scheme: { type: 'uct', variant: 'science' },
    notes: [
      'English, Mathematics and Physical Sciences are counted, with Mathematics and Physical Sciences doubled, plus your best three other subjects, out of 800.',
      'The Weighted Points Score (disadvantage factor) is not calculated here.',
    ],
  },
  {
    id: 'ukzn',
    name: 'UKZN',
    year: 2026,
    checked: '2026-10-20',
    source: 'https://applications.ukzn.ac.za/selection-procedure/undergraduate-selection-procedure/',
    scheme: { type: 'standard', bestN: 6, excludeLO: true, scale: 'eight', required: ['english', 'maths'] },
    notes: [
      'Six subjects, Life Orientation and Maths Paper 3 excluded. English and Mathematics (or Mathematical Literacy) always count, then your best other subjects.',
      'No bonus points for extra subjects. Medicine (MBChB) is ranked by average percentage, not APS.',
    ],
    caveat:
      'UKZN’s page says performance levels run from 1 to 8 but does not show the table; the 8 points for 90-100% comes from secondary sources. Confirm in the UKZN prospectus.',
  },
  {
    id: 'nwu',
    name: 'NWU',
    year: 2027,
    checked: '2026-10-20',
    source: 'https://studies.nwu.ac.za/sites/studies.nwu.ac.za/files/files/undergrad/2027-Grade-12-prospectus.pdf',
    scheme: { type: 'standard', bestN: 6, excludeLO: true },
    notes: [
      'Your six best subjects on the 1-7 scale; Life Orientation is not counted.',
      'NWU has its own APS calculator on studies.nwu.ac.za, and most faculties recommend 60% in Life Orientation.',
    ],
  },
  {
    id: 'ufs',
    name: 'UFS',
    year: 2027,
    checked: '2026-10-20',
    source:
      'https://www.ufs.ac.za/docs/librariesprovider44/virtual-open-day-documents/exhibition-hall/student-academic-services/brochure/applications-and-admissions---student-academic-services.pdf',
    scheme: {
      type: 'standard',
      bestN: 6,
      excludeLO: true,
      scale: 'ufs',
      loBonus: { minPercent: 60, points: 1 },
    },
    notes: [
      'Six academic subjects on an 8-point scale (90-100% = 8). Marks below 30% score nothing.',
      'Life Orientation adds 1 point if you score 60% or more; it is otherwise not counted.',
    ],
    caveat:
      'The official UFS brochure I could open is from 2021. A 2027 prospectus summary shows the same table, but a few sites say the top score is 7, so confirm against the current UFS prospectus.',
  },
  {
    id: 'unisa',
    name: 'UNISA',
    year: 2027,
    checked: '2026-10-20',
    source: 'https://www.unisa.ac.za/',
    scheme: { type: 'standard', bestN: 6, excludeLO: true },
    notes: ['Best six subjects on the 1-7 scale, Life Orientation excluded (maximum 42).'],
    caveat:
      'I could not find an official UNISA page for this. Most sources agree on this method, but one says Life Orientation is added as a seventh subject. Confirm in the UNISA prospectus.',
  },
  {
    id: 'rhodes',
    name: 'Rhodes University',
    year: 2027,
    checked: '2026-10-21',
    source: 'https://www.ru.ac.za/',
    scheme: { type: 'standard', bestN: 6, excludeLO: true },
    notes: ['Standard NSC APS: best six subjects on the 1-7 scale, Life Orientation excluded.'],
    caveat: 'This is the standard NSC APS, not confirmed against Rhodes’ own rules. Check their prospectus.',
  },
  {
    id: 'univen',
    name: 'University of Venda',
    year: 2027,
    checked: '2026-10-21',
    source: 'https://www.univen.ac.za/',
    scheme: { type: 'standard', bestN: 6, excludeLO: true, scale: 'univen' },
    notes: ['Standard NSC APS: best six subjects on the 1-7 scale, Life Orientation excluded.'],
    caveat: 'This is a provisional estimate, not confirmed against the University of Venda’s own rules. Check their prospectus.',
  },
];
