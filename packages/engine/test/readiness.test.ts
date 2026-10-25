import { describe, expect, it } from 'vitest';
import {
  evaluateCondition,
  evaluatePreflight,
  criticalPathDays,
  forecastIncompleteRisk,
  readinessPersistencePayload,
  requiredDocuments,
  type ReadinessDocument,
  type ReadinessRule,
} from '../src/readiness';

const consent: ReadinessDocument = {
  code: 'consent_form',
  name: 'Consent form',
  summary: 'Consent for the person supporting your application.',
  whoSigns: 'Parent or guardian',
  specialCategory: false,
  estDays: 1,
  dependsOn: [],
  officialUrl: 'https://www.nsfas.org.za',
  sortOrder: 1,
  sourceUrl: 'https://www.nsfas.org.za',
  lastVerified: '2026-10-18',
  verification: 'reported',
  checks: [
    {
      checkCode: 'signed',
      label: 'Signed by the right person',
      whyItFails: 'Signature does not match the form.',
      sortOrder: 1,
      showWhen: null,
      sourceUrl: 'https://www.nsfas.org.za',
      lastVerified: '2026-10-18',
      verification: 'reported',
    },
  ],
};

const rule: ReadinessRule = {
  documentCode: 'consent_form',
  routeCodes: ['nsfas_bursary'],
  when: { field: 'parentsOnRecord', op: 'eq', value: 'both' },
  onUnknown: 'include',
  reasonText: 'Both parents appear on your records.',
  priority: 1,
  sourceUrl: 'https://www.nsfas.org.za',
  lastVerified: '2026-10-18',
  verification: 'reported',
};

describe('evaluateCondition', () => {
  it('uses three-valued logic for missing and unsure answers', () => {
    expect(evaluateCondition(rule.when, {})).toBe('unknown');
    expect(evaluateCondition(rule.when, { parentsOnRecord: 'unsure' })).toBe('unknown');
    expect(evaluateCondition(rule.when, { parentsOnRecord: 'one' })).toBe('no');
    expect(evaluateCondition(rule.when, { parentsOnRecord: 'both' })).toBe('yes');
  });

  it('combines and negates nested conditions', () => {
    expect(
      evaluateCondition(
        {
          all: [
            { always: true },
            { not: { field: 'acceptance', op: 'eq', value: 'accepted' } },
          ],
        },
        { acceptance: 'applied' },
      ),
    ).toBe('yes');
    expect(evaluateCondition({ any: [] }, {})).toBe('no');
  });
});

describe('requiredDocuments', () => {
  const now = new Date('2026-10-20T12:00:00Z');

  it('includes required documents and marks unknown-condition inclusions for confirmation', () => {
    expect(
      requiredDocuments(
        ['nsfas_bursary'],
        [consent],
        [rule],
        {},
        now,
      ),
    ).toMatchObject([{ code: 'consent_form', confirmNeeded: true, stale: false }]);
  });

  it('hides rows missing a source or verification date and flags conflicts', () => {
    const unverified = { ...consent, lastVerified: null };
    const conflictRule = { ...rule, verification: 'conflict' as const };
    expect(requiredDocuments(['nsfas_bursary'], [unverified], [rule], {}, now)).toEqual([]);
    expect(
      requiredDocuments(['nsfas_bursary'], [consent], [conflictRule], {}, now),
    ).toMatchObject([{ verification: 'conflict' }]);
  });
});

describe('preflight and persistence', () => {
  it('counts checked rows and never persists special-category documents', () => {
    const special = { ...consent, code: 'special_doc', specialCategory: true };
    const docs = [
      { ...consent, reasons: [], confirmNeeded: false, stale: false },
      { ...special, reasons: [], confirmNeeded: false, stale: false },
    ];
    const checked = new Set(['consent_form:signed']);
    expect(evaluatePreflight(docs, checked)).toMatchObject({
      perDocument: [
        { code: 'consent_form', total: 1, ticked: 1, missing: [] },
        { code: 'special_doc', total: 1, ticked: 0 },
      ],
      allReady: false,
    });
    expect(readinessPersistencePayload('student-1', docs, checked)).toEqual([
      {
        student_id: 'student-1',
        document_code: 'consent_form',
        check_code: 'signed',
        checked: true,
      },
    ]);
  });
});

describe('risk and deadline helpers', () => {
  it('calculates dependent work without adding parallel tasks and detects bad graphs', () => {
    const documents = [
      { ...consent, estDays: 3, dependsOn: [] },
      { ...consent, code: 'declaration', estDays: 2, dependsOn: ['consent_form'] },
      { ...consent, code: 'id_copy', estDays: 4, dependsOn: [] },
    ];
    expect(criticalPathDays(documents)).toBe(5);
    expect(criticalPathDays(documents, new Set(['consent_form']))).toBe(4);
    expect(() =>
      criticalPathDays([
        { ...documents[0]!, dependsOn: ['declaration'] },
        { ...documents[1]!, dependsOn: ['consent_form'] },
      ]),
    ).toThrow('Document dependency cycle');
  });

  it('returns transparent top reasons and a cautious non-decision level', () => {
    const document = {
      ...consent,
      reasons: [],
      confirmNeeded: false,
      stale: false,
    };
    const forecast = forecastIncompleteRisk({
      answers: { parentsOnRecord: 'both', acceptance: 'applied' },
      documents: [document],
      checkedKeys: new Set(),
      deadlineStatus: 'at_risk',
      daysLeft: 4,
    });
    expect(forecast).toMatchObject({
      level: 'high',
      reasons: [
        { code: 'deadline_tight', points: 3 },
        { code: 'two_signatures', points: 2 },
        { code: 'consent_checks_open', points: 2 },
      ],
    });
  });
});
