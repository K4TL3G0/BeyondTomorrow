export type FundingCategory = 'school' | 'international' | 'postgraduate' | 'south-africa';
export type FundingFilter = 'all' | FundingCategory;

export interface Opportunity {
  id: string;
  categories: FundingCategory[];
  logo: string;
  tag: string;
  title: string;
  description: string;
  actionLabel: string;
  url: string; // https:// links open in a new tab; mailto: links open the mail app
  ariaLabel?: string;
}

export const FILTERS: { value: FundingFilter; label: string }[] = [
  { value: 'all', label: 'All opportunities' },
  { value: 'school', label: 'Grades 8–12' },
  { value: 'international', label: 'International' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'south-africa', label: 'South African funding' },
];

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'juniortukkie',
    categories: ['school'],
    logo: 'JuniorTukkie_Logo.png',
    tag: 'Grades 8–12',
    title: 'Grade 8–12 Study Platforms',
    description:
      'JuniorTukkie helps school learners explore career and higher-education pathways and prepare for their future studies. Visit the website to see the resources and opportunities currently available.',
    actionLabel: 'Visit JuniorTukkie',
    url: 'https://juniortukkie.online/',
    ariaLabel: 'Visit JuniorTukkie website',
  },
  {
    id: 'erasmus-mundus',
    categories: ['international', 'postgraduate'],
    logo: 'erasmus-plus.svg',
    tag: 'International · Master’s',
    title: 'Erasmus Mundus Joint Masters',
    description:
      'Explore joint master’s programmes offered by international university partnerships. Scholarships are available for selected programmes, subject to each programme’s eligibility requirements and application deadlines.',
    actionLabel: 'Explore Erasmus Mundus',
    url: 'https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters',
    ariaLabel: 'Visit Erasmus Mundus Joint Masters website',
  },
  {
    id: 'fulbright',
    categories: ['international', 'postgraduate'],
    logo: 'fulbright-scholars.svg',
    tag: 'International exchange',
    title: 'Fulbright Scholars Program',
    description:
      'Discover academic exchange opportunities for eligible scholars, researchers, educators and professionals. The opportunities and requirements depend on the specific Fulbright programme.',
    actionLabel: 'Explore Fulbright',
    url: 'https://fulbrightscholars.org/',
    ariaLabel: 'Visit Fulbright Scholars website',
  },
  {
    id: 'rhodes',
    categories: ['international', 'postgraduate'],
    logo: 'rhodes-scholarship.svg',
    tag: 'Postgraduate · Oxford',
    title: 'Rhodes Scholarship',
    description:
      'Learn about the Rhodes Scholarship for eligible applicants seeking postgraduate study at the University of Oxford. Selection includes academic achievement and other constituency-specific criteria.',
    actionLabel: 'View Rhodes Scholarship',
    url: 'https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/',
    ariaLabel: 'Visit Rhodes Scholarship website',
  },
  {
    id: 'dhet-international',
    categories: ['international', 'south-africa'],
    logo: 'dhet_Logo.jpg',
    tag: 'Government · International',
    title: 'DHET International Scholarships',
    description:
      'Check international scholarship opportunities advertised through South Africa’s Department of Higher Education and Training. Review each opportunity for eligibility, required documents and deadlines.',
    actionLabel: 'Find scholarships',
    url: 'https://internationalscholarships.dhet.gov.za/',
    ariaLabel: 'Visit DHET International Scholarships website',
  },
  {
    id: 'nrf-connect',
    categories: ['postgraduate', 'south-africa'],
    logo: 'NRF_Logo.png',
    tag: 'Research funding',
    title: 'NRF Connect',
    description:
      'The National Research Foundation’s online platform for relevant research funding calls and applications. Check current calls for eligible study levels, funding conditions and application dates.',
    actionLabel: 'Visit NRF Connect',
    url: 'https://nrfconnect.nrf.ac.za/',
    ariaLabel: 'Visit NRF Connect website',
  },
  {
    id: 'unisa-postgrad',
    categories: ['postgraduate', 'south-africa'],
    logo: 'unisa-postgraduate-bursaries.png',
    tag: 'Postgraduate',
    title: 'UNISA Postgraduate Bursaries',
    description:
      'Review UNISA’s information about postgraduate bursary funding. Check the current rules to confirm which qualifications and students are eligible and what costs may be covered.',
    actionLabel: 'View UNISA bursaries',
    url: 'https://www.unisa.ac.za/sites/myunisa/default/Student-Affairs-&-SRC/Student-funding:-bursaries-&-loans/Postgraduate-Bursaries',
    ariaLabel: 'Visit UNISA Postgraduate Bursaries website',
  },
  {
    id: 'firstrand',
    categories: ['south-africa'],
    logo: 'firstrand-empowerment-foundation.svg',
    tag: 'Undergraduate',
    title: 'FirstRand Empowerment Foundation Bursary',
    description:
      'Read this third-party bursary listing for information about an undergraduate funding opportunity. Confirm the latest eligibility criteria, supported study fields and deadlines with the bursary provider.',
    actionLabel: 'Read bursary listing',
    url: 'https://bursaries-southafrica.co.za/firstrand-empowerment-foundation-undergraduate-bursary-programme-2027-2/',
    ariaLabel: 'Read FirstRand Empowerment Foundation bursary listing',
  },
  {
    id: 'ephraim-mogale',
    categories: ['south-africa'],
    logo: 'zabursaries_logo.png',
    tag: 'Municipal bursary',
    title: 'Ephraim Mogale Local Municipality Bursary',
    description:
      'Explore this listing for a municipal bursary opportunity. Check the municipality’s current notice for residency conditions, eligible fields of study, documents and application status.',
    actionLabel: 'Read bursary listing',
    url: 'https://www.zabursaries.co.za/government-bursaries-south-africa/ephraim-mogale-local-municipality-bursary/',
    ariaLabel: 'Read Ephraim Mogale Municipality bursary listing',
  },
  {
    id: 'nsfas',
    categories: ['south-africa'],
    logo: 'nsfas_Logo.png',
    tag: 'Government funding',
    title: 'NSFAS Student Funding',
    description:
      'Visit the official National Student Financial Aid Scheme portal for student account access, application information and funding updates for eligible students at public universities and TVET colleges.',
    actionLabel: 'Visit NSFAS',
    url: 'https://my.nsfas.org.za/',
    ariaLabel: 'Visit NSFAS student portal',
  },
];