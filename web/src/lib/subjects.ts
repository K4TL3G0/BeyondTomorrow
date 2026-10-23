// Subject names offered as autocomplete suggestions in the APS calculator.
// These are the recognised 20-credit NSC subjects, plus Life Orientation (10 credits) because
// some institutions use it. Students can still type any name. Names are written so that
// classifySubject() in the engine recognises English, Mathematics, Mathematical Literacy,
// Physical Sciences and Life Orientation correctly. Re-check against the current NSC subject
// list (Department of Basic Education) when a new subject is added.

const OFFICIAL_LANGUAGES = [
  'Afrikaans',
  'English',
  'isiNdebele',
  'isiXhosa',
  'isiZulu',
  'Sepedi',
  'Sesotho',
  'Setswana',
  'siSwati',
  'Tshivenda',
  'Xitsonga',
  'South African Sign Language',
];

// English is only offered as Home Language or First Additional Language
const officialLanguageSubjects = OFFICIAL_LANGUAGES.flatMap((lang) =>
  lang === 'English'
    ? [`${lang} Home Language`, `${lang} First Additional Language`]
    : [`${lang} Home Language`, `${lang} First Additional Language`, `${lang} Second Additional Language`],
);

const OTHER_LANGUAGES = [
  'Arabic',
  'French',
  'German',
  'Gujarati',
  'Hebrew',
  'Hindi',
  'Italian',
  'Latin',
  'Mandarin',
  'Modern Greek',
  'Portuguese',
  'Serbian',
  'Spanish',
  'Tamil',
  'Telugu',
  'Urdu',
];

const languageSubjects = [
  ...officialLanguageSubjects,
  'South African Sign Language Home Language',
  ...OTHER_LANGUAGES.map((l) => `${l} Second Additional Language`),
];

const nonLanguageSubjects = [
  'Accounting',
  'Agricultural Sciences',
  'Business Studies',
  'Computer Applications Technology',
  'Consumer Studies',
  'Dance Studies',
  'Design',
  'Dramatic Arts',
  'Economics',
  'Engineering Graphics and Design',
  'Geography',
  'History',
  'Information Technology',
  'Life Sciences',
  'Marine Sciences',
  'Mathematical Literacy',
  'Mathematics',
  'Mechanical Technology',
  'Music',
  'Physical Sciences',
  'Religious Studies',
  'Technical Mathematics',
  'Technical Sciences',
  'Tourism',
  'Visual Arts',
];

export const SUBJECT_SUGGESTIONS: readonly string[] = [
  ...languageSubjects,
  ...nonLanguageSubjects,
  'Life Orientation', // 10 credits, not a 20-credit subject
].sort((a, b) => a.localeCompare(b));