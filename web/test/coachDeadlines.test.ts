import { describe, expect, it } from 'vitest';
import {
  buildCoachDeadlineReminders,
  type CourseDeadlineSource,
  type FundingDeadlineSource,
  type StudentApplicationDeadlineSource,
} from '../src/lib/coachDeadlines';

const now = new Date('2026-10-25T12:00:00+02:00');

describe('buildCoachDeadlineReminders', () => {
  it('includes only current official funding dates and gives NSFAS its confirmation instruction', () => {
    const funding: FundingDeadlineSource[] = [
      {
        id: 'nsfas',
        name: 'NSFAS Bursary',
        deadline: '2026-11-01',
        last_verified: '2026-10-20',
        source_url: 'https://www.nsfas.org.za/',
        verification: 'official',
      },
      {
        id: 'reported',
        name: 'Reported funding date',
        deadline: '2026-11-02',
        last_verified: '2026-10-20',
        source_url: 'https://funding.example.org/',
        verification: 'reported',
      },
      {
        id: 'stale',
        name: 'Stale funding date',
        deadline: '2026-11-03',
        last_verified: '2026-01-01',
        source_url: 'https://funding.example.org/',
        verification: 'official',
      },
    ];

    const reminders = buildCoachDeadlineReminders(funding, [], [], now);

    expect(reminders).toHaveLength(1);
    expect(reminders[0]).toMatchObject({
      title: 'NSFAS Bursary',
      deadline: '2026-11-01',
      daysLeft: 7,
      verifiedOn: '2026-10-20',
      confirmation: 'Confirm on nsfas.org.za.',
    });
  });

  it('uses verified course dates for the student’s matching application', () => {
    const courses: CourseDeadlineSource[] = [{
      id: 'course-1',
      institution_id: 'institution-1',
      name: 'BSc Computer Science',
      application_deadline: '2026-11-05',
      last_verified: '2026-10-20',
      source_url: 'https://institution.example.org/apply',
    }];
    const applications: StudentApplicationDeadlineSource[] = [{
      id: 'application-1',
      institution_id: 'institution-1',
      institution_key: 'sample-university',
      programme_name: 'BSc Computer Science',
      status: 'in_progress',
      deadline: null,
    }];

    const reminders = buildCoachDeadlineReminders([], courses, applications, now);

    expect(reminders).toHaveLength(1);
    expect(reminders[0]).toMatchObject({
      title: 'BSc Computer Science',
      deadline: '2026-11-05',
      verifiedOn: '2026-10-20',
      confirmation: 'Confirm with the institution.',
    });
  });

  it('labels saved application dates as unverified and ignores completed applications', () => {
    const applications: StudentApplicationDeadlineSource[] = [
      {
        id: 'planning',
        institution_id: null,
        institution_key: 'sample-university',
        programme_name: 'BCom',
        status: 'planning',
        deadline: '2026-11-10',
      },
      {
        id: 'submitted',
        institution_id: null,
        institution_key: 'sample-university',
        programme_name: 'BA',
        status: 'submitted',
        deadline: '2026-11-12',
      },
    ];

    const reminders = buildCoachDeadlineReminders([], [], applications, now);

    expect(reminders).toHaveLength(1);
    expect(reminders[0]).toMatchObject({
      title: 'BCom',
      deadline: '2026-11-10',
      verifiedOn: null,
      confirmation: 'Your saved date is not independently verified; confirm with the institution.',
    });
  });
});
