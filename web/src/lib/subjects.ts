export const OFFICIAL_LANGUAGES = [
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
  '\u0058itsonga',
  'South African Sign Language',
];

const officialLanguageSubjects = OFFICIAL_LANGUAGES.flatMap((language) =>
  language === 'English'
    ? [`${language} Home Language`, `${language} First Additional Language`]
    : [`${language} Home Language`, `${language} First Additional Language`, `${language} Second Additional Language`],
);

export const OTHER_LANGUAGES = [
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

export const HOME_LANGUAGE_OPTIONS = OFFICIAL_LANGUAGES.map((language) => `${language} Home Language`);

export const FIRST_ADDITIONAL_LANGUAGE_OPTIONS = OFFICIAL_LANGUAGES.map(
  (language) => `${language} First Additional Language`,
);

const SUBJECTS = [
  ...officialLanguageSubjects,
  'South African Sign Language Home Language',
  ...OTHER_LANGUAGES.map((language) => `${language} Second Additional Language`),
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
  'Life Orientation',
];

export const SUBJECT_SUGGESTIONS: readonly string[] = [...new Set(SUBJECTS)].sort((a, b) => a.localeCompare(b));

export function hasDuplicateSecondAdditionalLanguage(
  name: string,
  homeLanguage: string,
  firstAdditionalLanguage: string,
): boolean {
  const match = name.trim().match(/^(.+?)\s+Second Additional Language$/i);
  if (!match) return false;

  const language = match[1]?.toLocaleLowerCase();
  if (!language) return false;
  const home = homeLanguage.match(/^(.+?)\s+Home Language$/i)?.[1]?.toLocaleLowerCase();
  const firstAdditional = firstAdditionalLanguage
    .match(/^(.+?)\s+First Additional Language$/i)?.[1]?.toLocaleLowerCase();

  return language === 'english' || language === home || language === firstAdditional;
}
