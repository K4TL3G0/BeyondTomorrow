import type { SubjectEntry } from '@beyond-tomorrow/engine';
import type { Qualification, QualificationSubject } from '../data/qualifications';

const LANGUAGE_NAMES = [
  'afrikaans',
  'english',
  'isindebele',
  'isixhosa',
  'isizulu',
  'sepedi',
  'sesotho',
  'setswana',
  'siswati',
  'tshivenda',
  'itsonga',
  'south african sign language',
];

const SUBJECT_PATTERNS: { subject: QualificationSubject; pattern: RegExp }[] = [
  { subject: 'mathematical-literacy', pattern: /\bmathematical literacy\b/i },
  { subject: 'technical-mathematics', pattern: /\btechnical mathematics\b/i },
  { subject: 'mathematics', pattern: /\bmathematics\b/i },
  { subject: 'physical-sciences', pattern: /\bphysical sciences\b/i },
  { subject: 'life-sciences', pattern: /\blife sciences\b/i },
  { subject: 'agricultural-sciences', pattern: /\bagricultural sciences\b/i },
  { subject: 'engineering-graphics-and-design', pattern: /\bengineering graphics and design\b/i },
  { subject: 'business-studies', pattern: /\bbusiness studies\b/i },
  { subject: 'accounting', pattern: /\baccounting\b/i },
  { subject: 'economics', pattern: /\beconomics\b/i },
  { subject: 'geography', pattern: /\bgeography\b/i },
  { subject: 'history', pattern: /\bhistory\b/i },
];

function isLanguageSubject(name: string): boolean {
  return /\b(home language|first additional language|second additional language)\b/i.test(name);
}

function matchingSubject(name: string, subject: QualificationSubject): boolean {
  const normalized = name.trim().toLocaleLowerCase();
  switch (subject) {
    case 'english':
      return /\benglish\b/.test(normalized);
    case 'english-home':
      return /\benglish\b/.test(normalized) && /home language/.test(normalized);
    case 'english-first-additional':
      return /\benglish\b/.test(normalized) && /first additional language/.test(normalized);
    case 'english-or-afrikaans':
      return /\b(english|afrikaans)\b/.test(normalized) &&
        /(home language|first additional language)/.test(normalized);
    case 'home-language':
      return /home language/.test(normalized);
    case 'first-additional-language':
      return /first additional language/.test(normalized);
    case 'afrikaans-home':
      return /\bafrikaans\b/.test(normalized) && /home language/.test(normalized);
    case 'sesotho-home':
      return /\bsesotho\b/.test(normalized) && /home language/.test(normalized);
    case 'isizulu-home':
      return /\bisizulu\b/.test(normalized) && /home language/.test(normalized);
    default: {
      const definition = SUBJECT_PATTERNS.find((candidate) => candidate.subject === subject);
      return definition?.pattern.test(normalized) ?? false;
    }
  }
}

function splitTopLevel(value: string, separator: 'AND' | 'OR' | ';'): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  const upper = value.toLocaleUpperCase();

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '(') depth += 1;
    else if (value[index] === ')') depth = Math.max(0, depth - 1);
    if (depth !== 0) continue;

    const isSeparator = separator === ';'
      ? value[index] === ';'
      : upper.slice(index, index + separator.length) === separator &&
        !/[A-Z]/.test(upper[index - 1] ?? '') &&
        !/[A-Z]/.test(upper[index + separator.length] ?? '');
    if (!isSeparator) continue;

    parts.push(value.slice(start, index).trim());
    index += separator.length - 1;
    start = index + 1;
  }

  if (parts.length === 0) return [value.trim()];
  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
}

function stripOuterParentheses(value: string): string {
  let result = value.trim();
  while (result.startsWith('(') && result.endsWith(')')) {
    let depth = 0;
    let closesAtEnd = false;
    for (let index = 0; index < result.length; index += 1) {
      if (result[index] === '(') depth += 1;
      else if (result[index] === ')') depth -= 1;
      if (depth === 0) {
        closesAtEnd = index === result.length - 1;
        break;
      }
    }
    if (!closesAtEnd) break;
    result = result.slice(1, -1).trim();
  }
  return result;
}

function normalizeRequirement(value: string): string {
  return value
    .replace(/English\s+Home Language\s+or\s+First Additional Language/gi, 'EnglishHomeOrFAL')
    .replace(/English\s+or\s+Afrikaans/gi, 'EnglishOrAfrikaans')
    .replace(/Afrikaans\s+or\s+English/gi, 'AfrikaansOrEnglish')
    .replace(/(\d+(?:\.\d+)?\s*%)\s+or\s+\d+(?:\.\d+)?\s*%\s*\(depends on[^)]*\)/gi, '$1')
    .replace(/\s+with\s+/gi, ' AND ')
    .replace(/\s+and\s+/gi, ' AND ');
}

function minimumPercent(value: string): number | null {
  const level = value.match(/\blevel\s+([1-7])\b/i);
  if (level?.[1]) return [0, 0, 30, 40, 50, 60, 70, 80][Number(level[1])] ?? null;

  const percent = value.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percent?.[1]) return Number(percent[1]);
  return null;
}

function languageNamesIn(value: string): string[] {
  const normalized = value.toLocaleLowerCase();
  const names = LANGUAGE_NAMES.filter((language) =>
    new RegExp(`\\b${language.replaceAll(' ', '\\s+')}\\b`).test(normalized),
  );
  if (/englishorafrikaans|afrikaansorenglish|englishhomeorfal/i.test(value)) {
    names.push('english', 'afrikaans');
  }
  return [...new Set(names)];
}

function countDistinctLanguageSubjects(entries: SubjectEntry[], threshold: number): number {
  return new Set(entries
    .filter((entry) => isLanguageSubject(entry.name) && entry.percent >= threshold)
    .map((entry) => entry.name.trim().toLocaleLowerCase()),
  ).size;
}

function atomicRequirementMatches(value: string, entries: SubjectEntry[]): boolean {
  const clause = stripOuterParentheses(value).trim();
  if (!clause || /^(n\/a|not applicable|see mathematics column)$/i.test(clause)) return true;
  if (/prior bachelor's degree|requires? a diploma|senate-approved/i.test(clause)) return false;

  const fourSubjectMinimum = clause.match(
    /at least\s+(\d+(?:\.\d+)?)\s*%(?:\s*\(level\s+\d+\))?\s+in each of four school subjects/i,
  );
  if (fourSubjectMinimum?.[1]) {
    const threshold = Number(fourSubjectMinimum[1]);
    return entries.filter((entry) =>
      !/life\s*orientation/i.test(entry.name) &&
      entry.percent >= threshold,
    ).length >= 4;
  }

  const requirement = clause
    .replace(/\([^)]*not accepted[^)]*\)/i, '')
    .replace(/\s+if\s+[^.;]*university subject[^.;]*/i, '')
    .trim();
  if (!requirement) return true;
  const threshold = minimumPercent(requirement);
  if (threshold === null) return false;

  if (/englishhomeorfal/i.test(requirement)) {
    return entries.some((entry) =>
      (matchingSubject(entry.name, 'english-home') || matchingSubject(entry.name, 'english-first-additional')) &&
      entry.percent >= threshold,
    );
  }

  const hasLanguageType = /home language|\bhl\b|first additional language|\bfal\b|second additional language/i.test(requirement);
  const isLanguageRequirement = hasLanguageType || languageNamesIn(requirement).length > 0 ||
    /third south african language/i.test(requirement);
  if (isLanguageRequirement) {
    const names = languageNamesIn(requirement);
    const home = /home language|\bhl\b/i.test(requirement);
    const firstAdditional = /first additional language|\bfal\b/i.test(requirement);
    const includesAnyLanguageType = /hl\s*\/\s*fal|hl\s+or\s+fal|home language or first additional language/i.test(requirement);
    const candidates = entries.filter((entry) => {
      if (!isLanguageSubject(entry.name)) return false;
      const normalizedName = entry.name.toLocaleLowerCase();
      const matchesName = names.length === 0 ||
        (/third south african language/i.test(requirement) &&
          !/\b(english|afrikaans)\b/.test(normalizedName)) ||
        names.some((language) =>
        new RegExp(`\\b${language.replaceAll(' ', '\\s+')}\\b`).test(normalizedName),
      );
      const matchesType = includesAnyLanguageType ||
        (!home && !firstAdditional) ||
        (home && /home language/.test(normalizedName)) ||
        (firstAdditional && /first additional language/.test(normalizedName)) ||
        (/second additional language/i.test(requirement) && /second additional language/.test(normalizedName));
      return matchesName && matchesType;
    });
    if (/at least two/i.test(requirement)) {
      return new Set(candidates
        .filter((entry) => entry.percent >= threshold)
        .map((entry) => entry.name.trim().toLocaleLowerCase()),
      ).size >= 2;
    }
    return candidates.some((entry) => entry.percent >= threshold);
  }

  const subjects = SUBJECT_PATTERNS.filter((subject) => subject.pattern.test(requirement));
  if (subjects.length === 0) {
    const plainEnglishRequirement = /\benglish\b/i.test(requirement);
    if (plainEnglishRequirement) {
      return entries.some((entry) => matchingSubject(entry.name, 'english') && entry.percent >= threshold);
    }
    return false;
  }

  return subjects.some(({ subject }) =>
    entries.some((entry) => matchingSubject(entry.name, subject) && entry.percent >= threshold),
  );
}

function requirementTextMatches(value: string, entries: SubjectEntry[]): boolean {
  const normalized = normalizeRequirement(value)
    .replace(/If taught in [^:]+:\s*/gi, '')
    .replace(/\.\s*(?=[A-Z])/g, ' OR ')
    .replace(/\s+If taught in [^:]+:\s*/gi, ' OR ');
  if (!normalized.trim()) return true;
  if (/^If .+ university subject:/i.test(normalized.trim())) return true;
  if (/at least two of english.*afrikaans.*third south african language/i.test(normalized)) {
    const threshold = minimumPercent(normalized);
    return threshold !== null && countDistinctLanguageSubjects(entries, threshold) >= 2;
  }

  const alternatives = splitTopLevel(normalized, 'OR');
  if (alternatives.length > 1) {
    return alternatives.some((alternative) => requirementTextMatches(alternative, entries));
  }

  const conditions = splitTopLevel(normalized, 'AND');
  if (conditions.length > 1) {
    return conditions.every((condition) => requirementTextMatches(condition, entries));
  }

  const semicolonConditions = splitTopLevel(normalized, ';');
  if (semicolonConditions.length > 1) {
    return semicolonConditions.every((condition) => requirementTextMatches(condition, entries));
  }
  return atomicRequirementMatches(normalized, entries);
}

function workbookRequirementsMatch(qualification: Qualification, entries: SubjectEntry[]): boolean {
  const requirements = qualification.sourceRequirements;
  if (!requirements) return true;
  return Object.entries(requirements).every(([key, value]) =>
    key === 'other' && /^(teaching modules|mathematics elective):/i.test(value.trim())
      ? true
      : requirementTextMatches(value, entries),
  );
}

export function calculateNsCAggregate(entries: SubjectEntry[]): number | null {
  const marks = entries
    .filter((entry) => !/life\s*orientation/i.test(entry.name))
    .map((entry) => entry.percent)
    .sort((left, right) => right - left)
    .slice(0, 6);
  if (marks.length < 6) return null;
  return marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
}

export function qualificationMeetsRequirements(
  qualification: Qualification,
  entries: SubjectEntry[],
  score: number,
  aggregate?: number | null,
): boolean {
  if (qualification.needsChecking) return false;
  const hasRequirements = qualification.requirements.length > 0 ||
    Object.values(qualification.sourceRequirements ?? {}).some(Boolean);
  if (qualification.minimumScore === undefined &&
    qualification.minimumAggregate === undefined &&
    !hasRequirements) return false;
  if (qualification.minimumScore !== undefined) {
    const academicSubjects = entries.filter((entry) => !/life\s*orientation/i.test(entry.name));
    if (academicSubjects.length < 6 || score < qualification.minimumScore) return false;
  }
  if (qualification.minimumAggregate !== undefined &&
    (aggregate === undefined || aggregate === null || aggregate < qualification.minimumAggregate)) return false;

  const structuredRequirementsMatch = qualification.requirements.every((requirement) =>
    requirement.anyOf.some((option) =>
      entries.some((entry) =>
        matchingSubject(entry.name, option.subject) && entry.percent >= option.minimumMark,
      ),
    ),
  );
  return structuredRequirementsMatch && workbookRequirementsMatch(qualification, entries);
}

export function qualifyingQualifications(
  qualifications: Qualification[],
  institutionId: string,
  entries: SubjectEntry[],
  score: number,
  aggregate?: number | null,
): Qualification[] {
  return qualifications.filter((qualification) =>
    qualification.institutionId === institutionId &&
    qualificationMeetsRequirements(qualification, entries, score, aggregate),
  );
}
