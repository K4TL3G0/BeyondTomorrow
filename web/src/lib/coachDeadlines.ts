type DatedReference = {
  id: string;
  name: string;
  deadline: string | null;
  source_url: string | null;
  last_verified: string | null;
};

export type FundingDeadlineSource = DatedReference & {
  verification: string | null;
};

export type CourseDeadlineSource = {
  id: string;
  institution_id: string;
  name: string;
  application_deadline: string | null;
  source_url: string | null;
  last_verified: string | null;
};

export type StudentApplicationDeadlineSource = {
  id: string;
  institution_id: string | null;
  institution_key: string;
  programme_name: string;
  status: string;
  deadline: string | null;
};

export interface CoachDeadlineReminder {
  id: string;
  title: string;
  deadline: string;
  daysLeft: number;
  verifiedOn: string | null;
  sourceUrl: string | null;
  confirmation: string;
  sourceLabel: string;
}

const DAY_MS = 86_400_000;
const REFERENCE_MAX_AGE_DAYS = 90;
const CLOSED_APPLICATION_STATUSES = new Set(['submitted', 'offer', 'accepted', 'declined', 'unsuccessful']);

function isIsoDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isRecentlyVerified(value: string | null, now: Date): value is string {
  if (!isIsoDate(value)) return false;
  const verifiedAt = new Date(`${value}T00:00:00+02:00`).getTime();
  const age = now.getTime() - verifiedAt;
  return age >= 0 && age <= REFERENCE_MAX_AGE_DAYS * DAY_MS;
}

function daysUntil(value: string, now: Date): number {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  const today = Date.UTC(Number(part('year')), Number(part('month')) - 1, Number(part('day')));
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  return Math.round((Date.UTC(year, month - 1, day) - today) / DAY_MS);
}

function normalizedName(value: string): string {
  return value.trim().toLocaleLowerCase('en-ZA').replace(/[^\p{L}\p{N}]+/gu, ' ');
}

function isHttpsUrl(value: string | null): value is string {
  if (!value) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function buildCoachDeadlineReminders(
  funding: readonly FundingDeadlineSource[],
  courses: readonly CourseDeadlineSource[],
  applications: readonly StudentApplicationDeadlineSource[],
  now: Date,
): CoachDeadlineReminder[] {
  const reminders: CoachDeadlineReminder[] = [];

  for (const source of funding) {
    if (
      source.verification !== 'official' ||
      !isRecentlyVerified(source.last_verified, now) ||
      !isIsoDate(source.deadline) ||
      !isHttpsUrl(source.source_url)
    ) {
      continue;
    }
    const daysLeft = daysUntil(source.deadline, now);
    if (daysLeft < 0) continue;
    const isNsfas = source.name.toLowerCase().includes('nsfas');
    reminders.push({
      id: `funding-${source.id}`,
      title: source.name,
      deadline: source.deadline,
      daysLeft,
      verifiedOn: source.last_verified,
      sourceUrl: source.source_url,
      confirmation: isNsfas ? 'Confirm on nsfas.org.za.' : 'Confirm with the funding provider.',
      sourceLabel: 'Official funding source',
    });
  }

  for (const application of applications) {
    if (CLOSED_APPLICATION_STATUSES.has(application.status)) continue;

    const matchingCourse = application.institution_id
      ? courses.find(
          (course) =>
            course.institution_id === application.institution_id &&
            normalizedName(course.name) === normalizedName(application.programme_name) &&
            isIsoDate(course.application_deadline) &&
            isRecentlyVerified(course.last_verified, now) &&
            isHttpsUrl(course.source_url),
        )
      : undefined;

    const courseDeadline = matchingCourse?.application_deadline;
    const applicationDeadline = isIsoDate(application.deadline) ? application.deadline : null;

    if (matchingCourse && courseDeadline) {
      const daysLeft = daysUntil(courseDeadline, now);
      if (daysLeft >= 0) {
        reminders.push({
          id: `course-${matchingCourse.id}`,
          title: application.programme_name,
          deadline: courseDeadline,
          daysLeft,
          verifiedOn: matchingCourse.last_verified,
          sourceUrl: matchingCourse.source_url,
          confirmation:
            applicationDeadline && applicationDeadline !== courseDeadline
              ? 'Your saved date differs; confirm this verified date with the institution.'
              : 'Confirm with the institution.',
          sourceLabel: 'Verified course deadline',
        });
      }
    }

    if (applicationDeadline && applicationDeadline !== courseDeadline) {
      const daysLeft = daysUntil(applicationDeadline, now);
      if (daysLeft >= 0) {
        reminders.push({
          id: `application-${application.id}`,
          title: application.programme_name,
          deadline: applicationDeadline,
          daysLeft,
          verifiedOn: null,
          sourceUrl: null,
          confirmation:
            courseDeadline && applicationDeadline !== courseDeadline
              ? 'This differs from the verified course date; confirm with the institution.'
              : 'Your saved date is not independently verified; confirm with the institution.',
          sourceLabel: 'Your saved application deadline',
        });
      }
    }
  }

  return reminders.sort(
    (left, right) =>
      left.daysLeft - right.daysLeft ||
      left.title.localeCompare(right.title, 'en-ZA'),
  );
}
