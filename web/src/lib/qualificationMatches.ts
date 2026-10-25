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
  { subject: 'mathematical-literacy', pattern: /\bmathematic(?:s|al)? literacy\b|\bmaths? lit(?:eracy)?\b|\bml\b/i },
  { subject: 'technical-mathematics', pattern: /\btechnical mathematics\b|\btech(?:nical)?\s+maths\b|\btm\b/i },
  { subject: 'technical-sciences', pattern: /\btechnical science\b|\btech(?:nical)?\s+science\b/i },
  { subject: 'mathematics', pattern: /(?<!technical )(?<!tech )\bmathematics\b(?!\s*(?:lit|literacy))|(?<!technical )(?<!tech )\bmaths\b(?!\s*(?:lit|literacy))/i },
  { subject: 'physical-sciences', pattern: /\bphysical sciences?\b|\bphys(?:ical)?\s+sci(?:ences?)?\b/i },
  { subject: 'life-orientation', pattern: /\blife\s*orientation\b|\blo\b/i },
  { subject: 'life-sciences', pattern: /\blife sciences?\b|\blife sci(?:ences?)?\b/i },
  { subject: 'agricultural-sciences', pattern: /\bagricultural sciences?\b|\bagricultural sci(?:ences?)?\b|\bagric sci\b/i },
  { subject: 'engineering-graphics-and-design', pattern: /\bengineering graphics and design\b|\begd\b/i },
  { subject: 'business-studies', pattern: /\bbusiness studies\b|\bbus(?:iness)? stud(?:ies)?\b/i },
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
    .replace(/\bNSC\s+(?:or\s+equivalent\s+)?with\s+(?:(?:degree|diploma|higher certificate)\s+endorsement(?:\s+and\s+)?\d*\s*points?|\d+\s+points?);?/gi, '')
    .replace(/\bNSC\s+pass\s+with\b/gi, '')
    .replace(/\(or\s+SG\s+[A-F](?:\s*\/\s*HG\s+[A-F])?\)/gi, '')
    .replace(/\band\/or\b/gi, ' OR ')
    .replace(
      /\b(English(?:\s+Language)?|Mathematics|Maths|Mathematical Literacy|Physical Sciences?|Life Sciences?|Agricultural Sciences?|Life Orientation|Geography|History|Accounting|Economics|Business Studies)\s*:\s*([1-7])\b/gi,
      '$1 Level $2',
    )
    .replace(
      /\bEnglish\s+HL\s+(\d+(?:\.\d+)?\s*%)\s+or\s+FAL\s+(\d+(?:\.\d+)?\s*%)/gi,
      'English Home Language $1 OR English First Additional Language $2',
    )
    .replace(/\bEnglish\s+as\s+above\b/gi, 'English Home Language 50% OR English First Additional Language 60%')
    .replace(/English\s+Home Language\s+or\s+First Additional Language/gi, 'EnglishHomeOrFAL')
    .replace(/English\s+or\s+Afrikaans/gi, 'EnglishOrAfrikaans')
    .replace(/Afrikaans\s+or\s+English/gi, 'AfrikaansOrEnglish')
    .replace(/\bNSC[- ]Deg\b/gi, '')
    .replace(/\bEngl\b/gi, 'English')
    .replace(/\bPhys(?:ical)?\s+Sci(?:ence)?\b/gi, 'Physical Sciences')
    .replace(/\bLife\s+Sci(?:ence)?\b/gi, 'Life Sciences')
    .replace(/\bAgric(?:ultural)?\s+Sci(?:ence)?\b/gi, 'Agricultural Sciences')
    .replace(/\bBus(?:iness)?\s+Stud(?:ies)?\b/gi, 'Business Studies')
    .replace(/&/g, ' AND ')
    .replace(/(\d+(?:\.\d+)?\s*%)\s+or\s+\d+(?:\.\d+)?\s*%\s*\(depends on[^)]*\)/gi, '$1')
    .replace(/\s+with\s+/gi, ' AND ')
    .replace(/\s+and\s+/gi, ' AND ');
}

function minimumPercent(value: string): number | null {
  const range = value.match(/(\d+(?:\.\d+)?)\s*%?\s*[-–—]\s*\d+(?:\.\d+)?\s*%/);
  if (range?.[1]) return Number(range[1]);

  const percent = value.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percent?.[1]) return Number(percent[1]);

  const level = value.match(/\blevel\s+([1-7])\b/i);
  if (level?.[1]) return [0, 0, 30, 40, 50, 60, 70, 80][Number(level[1])] ?? null;

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
  if (/\bnot accepted\b|\bnot considered\b|:\s*no\s*$/i.test(clause)) return false;
  if (/prior bachelor's degree|requires? a diploma|senate-approved/i.test(clause)) return false;

  const anyCount = clause.match(/\bany\s+(\d+)\s+of\b/i) ??
    clause.match(/\bother subjects?\s*\((\d+)\)/i);
  if (anyCount?.[1]) {
    const threshold = minimumPercent(clause);
    if (threshold === null) return false;
    const requiredCount = Number(anyCount[1]);
    const subjects = SUBJECT_PATTERNS.filter(({ pattern }) => pattern.test(clause));
    if (/other subjects?/i.test(clause) || /any\s+\d+\s+subjects?\b/i.test(clause)) {
      return entries.filter((entry) =>
        !/life\s*orientation/i.test(entry.name) && entry.percent >= threshold,
      ).length >= requiredCount;
    }
    const qualifyingEntries = entries.filter((entry) =>
      entry.percent >= threshold && (
        subjects.some(({ subject }) => matchingSubject(entry.name, subject)) ||
        (isLanguageSubject(entry.name) && languageNamesIn(clause).some((language) =>
          new RegExp(`\\b${language.replaceAll(' ', '\\s+')}\\b`).test(entry.name.toLocaleLowerCase()),
        ))
      ),
    );
    return new Set(qualifyingEntries.map((entry) => entry.name.trim().toLocaleLowerCase())).size >= requiredCount;
  }

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

  const hasLanguageType = /home language|\bhl\b|first additional language|\bfal\b|second additional language|additional language/i.test(requirement);
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
    const applicableConditions = semicolonConditions.filter((condition) =>
      !/\bnot accepted\b|\bnot considered\b|:\s*no\s*$/i.test(condition.trim()),
    );
    const mathematicsConditions = applicableConditions.filter((condition) =>
      /\b(mathematics|maths|mathematical literacy|maths lit|technical mathematics|tech maths)\b/i.test(condition),
    );
    const otherConditions = applicableConditions.filter((condition) =>
      !mathematicsConditions.includes(condition),
    );
    return otherConditions.every((condition) => requirementTextMatches(condition, entries)) &&
      (mathematicsConditions.length === 0 ||
        mathematicsConditions.some((condition) => requirementTextMatches(condition, entries)));
  }
  return atomicRequirementMatches(normalized, entries);
}

function workbookRequirementsMatch(qualification: Qualification, entries: SubjectEntry[]): boolean {
  const requirements = qualification.sourceRequirements;
  if (!requirements) return true;
  const requirementValues = Object.values(requirements).filter(Boolean);
  const clauses = requirementValues.flatMap((value) =>
    splitTopLevel(normalizeRequirement(value), ';'),
  );
  const isAdditionalSubjectClause = (clause: string) =>
    /\b(?:other|additional)\s+subjects?\b/i.test(clause) ||
    /\badditional\s+subject\s+\d+\b/i.test(clause) ||
    /\bnext\s+(?:\d+|one|two|three|four|five|six)\s+subjects?\b/i.test(clause) ||
    /\bany\s+\d+\s+other\s+(?:NSC\s+)?subjects?\b/i.test(clause) ||
    /\b\d+\s+(?:recognised\s+)?(?:20-credit\s+)?subjects?\b/i.test(clause);
  const otherSubjectClauses = clauses.filter(isAdditionalSubjectClause);
  const explicitClauses = clauses.filter((clause) => !isAdditionalSubjectClause(clause));
  const explicitSubjects = SUBJECT_PATTERNS
    .filter(({ pattern }) => explicitClauses.some((clause) => pattern.test(clause)))
    .map(({ subject }) => subject);
  const requiresLanguage = explicitClauses.some((clause) =>
    /\b(language|english|afrikaans|isixhosa|isizulu|sesotho|sepedi|setswana|tshivenda|itsonga|siswati)\b/i.test(clause),
  );
  const otherSubjectEntries = entries.filter((entry) =>
    !/life\s*orientation/i.test(entry.name) &&
    !(requiresLanguage && isLanguageSubject(entry.name)) &&
    !explicitSubjects.some((subject) => matchingSubject(entry.name, subject)),
  );
  const otherSubjectsMatch = otherSubjectClauses.every((clause) => {
    const groups = [...clause.matchAll(/(\d+)\s*[xX]\s*(\d)\s*\((\d+(?:\.\d+)?)\s*%?\s*[-–—]\s*\d+/g)]
      .map((match) => ({ count: Number(match[1]), mark: Number(match[3]) }))
      .sort((left, right) => right.mark - left.mark);
    if (groups.length > 0) {
      let cumulativeCount = 0;
      return groups.every((group) => {
        cumulativeCount += group.count;
        return otherSubjectEntries.filter((entry) => entry.percent >= group.mark).length >= cumulativeCount;
      });
    }
    const individualAdditionalSubject = clause.match(/\badditional\s+subject\s+(\d+)\s*:\s*(?:level\s+)?([1-7])\b/i);
    if (individualAdditionalSubject?.[1] && individualAdditionalSubject[2]) {
      const count = Number(individualAdditionalSubject[1]);
      const threshold = [0, 0, 30, 40, 50, 60, 70, 80][Number(individualAdditionalSubject[2])];
      return threshold !== undefined &&
        otherSubjectEntries.filter((entry) => entry.percent >= threshold).length >= count;
    }
    const nextSubjects = clause.match(/\bnext\s+(\d+|one|two|three|four|five|six)\s+subjects?\s+(\d+(?:\.\d+)?)\s*%/i);
    if (nextSubjects?.[1] && nextSubjects[2]) {
      const count = Number(nextSubjects[1]) || ({
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
      }[nextSubjects[1].toLocaleLowerCase()] ?? 0);
      const threshold = Number(nextSubjects[2]);
      return count > 0 &&
        otherSubjectEntries.filter((entry) => entry.percent >= threshold).length >= count;
    }
    const additionalGroup = clause.match(
      /\b(?:additional|any)\s+(\d+|one|two|three|four|five|six)\s+(?:other\s+)?(?:NSC\s+)?subjects?\s*:\s*(?:level\s+)?([1-7])\s*(?:each)?\b/i,
    );
    if (additionalGroup?.[1] && additionalGroup[2]) {
      const count = Number(additionalGroup[1]) || ({
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
      }[additionalGroup[1].toLocaleLowerCase()] ?? 0);
      const threshold = [0, 0, 30, 40, 50, 60, 70, 80][Number(additionalGroup[2])];
      return count > 0 && threshold !== undefined &&
        otherSubjectEntries.filter((entry) => entry.percent >= threshold).length >= count;
    }
    const fourSubjects = clause.match(/\b(\d+)\s+(?:recognised\s+)?(?:20-credit\s+)?subjects?\b/i);
    const fourSubjectsThreshold = minimumPercent(clause);
    if (fourSubjects?.[1] && fourSubjectsThreshold !== null) {
      return entries.filter((entry) =>
        !/life\s*orientation/i.test(entry.name) && entry.percent >= fourSubjectsThreshold,
      ).length >= Number(fourSubjects[1]);
    }
    const count = clause.match(/\bother subjects?\s*\((\d+)\)/i);
    const threshold = minimumPercent(clause);
    if (count?.[1] && threshold !== null) {
      return otherSubjectEntries.filter((entry) => entry.percent >= threshold).length >= Number(count[1]);
    }
    const anyOtherSubject = clause.match(/\bany\s+other\s+(?:NSC\s+)?subjects?\s*:\s*(?:level\s+)?([1-7])\b/i);
    if (anyOtherSubject?.[1]) {
      const anyThreshold = [0, 0, 30, 40, 50, 60, 70, 80][Number(anyOtherSubject[1])];
      return anyThreshold !== undefined &&
        otherSubjectEntries.some((entry) => entry.percent >= anyThreshold);
    }
    return false;
  });
  if (!otherSubjectsMatch) return false;

  return requirementValues.every((value) => {
    const withoutOtherSubjects = splitTopLevel(normalizeRequirement(value), ';')
      .filter((clause) => !isAdditionalSubjectClause(clause))
      .join(';');
    return !withoutOtherSubjects.trim() || requirementTextMatches(withoutOtherSubjects, entries);
  });
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
  score: number | null,
  aggregate?: number | null,
): boolean {
  const hasRequirements = qualification.requirements.length > 0 ||
    Object.values(qualification.sourceRequirements ?? {}).some(Boolean);
  if (qualification.minimumScore === undefined &&
    qualification.minimumAggregate === undefined &&
    !hasRequirements) return false;
  if (qualification.minimumScore !== undefined) {
    const academicSubjects = entries.filter((entry) => !/life\s*orientation/i.test(entry.name));
    if (academicSubjects.length < 6 || score === null) return false;
    if (qualification.minimumScoreOptions?.length) {
      const meetsScoreOption = qualification.minimumScoreOptions.some((option) =>
        score >= option.minimumScore &&
        (option.subjects.length === 0 || option.subjects.some(({ subject, minimumMark }) =>
          entries.some((entry) =>
            matchingSubject(entry.name, subject) && entry.percent >= minimumMark,
          ),
        )),
      );
      if (!meetsScoreOption) return false;
    } else if (score < qualification.minimumScore) {
      return false;
    }
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
  score: number | null,
  aggregate?: number | null,
): Qualification[] {
  return qualifications.filter((qualification) =>
    qualification.institutionId === institutionId &&
    qualificationMeetsRequirements(qualification, entries, score, aggregate),
  );
}
