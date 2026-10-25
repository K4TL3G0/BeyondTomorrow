import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileCheck2,
  LockKeyhole,
  Printer,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  criticalPathDays,
  evaluatePreflight,
  forecastIncompleteRisk,
  readinessPersistencePayload,
  requiredDocuments,
  ROUTE_CODES,
  type Cond,
  type HouseholdAnswers,
  type ReadinessCheck,
  type ReadinessDocument,
  type ReadinessRule,
  type Verification,
} from '@beyond-tomorrow/engine';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { Hero } from '../components/Hero';
import './coach.css';

type Stage = 'route' | 'questions' | 'documents';
type IncomeBracket = NonNullable<HouseholdAnswers['incomeBracket']>;
type FundingRow = {
  id: string;
  name: string;
  type: 'bursary' | 'loan';
  provider_type: 'government' | 'bank' | 'private_lender' | null;
  description: string;
  income_floor: number | null;
  income_ceiling: number | null;
  disability_income_ceiling: number | null;
  deadline: string | null;
  source_url: string | null;
  last_verified: string | null;
  verification: Verification | null;
};
type CoachDocument = ReadinessDocument;
type ProgressRow = { document_code: string; check_code: string; checked: boolean };
type FixClockRow = {
  funding_name: string;
  kind: 'documents' | 'appeal';
  notified_on: string;
  window_days: number;
  outstanding_docs: string[];
};

const INCOME_OPTIONS: { value: IncomeBracket; label: string; hint: string }[] = [
  { value: 'up_to_350k', label: 'R350,000 or less', hint: 'The lower-income bracket' },
  { value: '350k_to_600k', label: 'R350,001 to R600,000', hint: 'The missing-middle range' },
  { value: 'above_600k', label: 'More than R600,000', hint: 'Explore other bursaries and options' },
  { value: 'prefer_not_to_say', label: 'I’m not sure / prefer not to say', hint: 'We’ll show options without assuming' },
];

const QUESTIONS: {
  key: keyof HouseholdAnswers;
  title: string;
  help: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: 'ageBand',
    title: 'Which age group are you in?',
    help: 'A broad age range only. We do not ask for your date of birth.',
    options: [
      { value: 'under18', label: 'Under 18' },
      { value: '18to34', label: '18 to 34' },
      { value: '35plus', label: '35 or older' },
    ],
  },
  {
    key: 'supporter',
    title: 'Who mainly supports you financially?',
    help: 'Choose the closest answer; this stays in this page session.',
    options: [
      { value: 'both_parents', label: 'Both parents' },
      { value: 'one_parent', label: 'One parent' },
      { value: 'legal_guardian', label: 'A legal guardian' },
      { value: 'spouse', label: 'A spouse or partner' },
      { value: 'myself', label: 'Myself' },
      { value: 'other_relative', label: 'Another relative' },
    ],
  },
  {
    key: 'parentsOnRecord',
    title: 'How many parents appear on your Home Affairs records?',
    help: 'If you do not know, choose “Not sure.”',
    options: [
      { value: 'both', label: 'Both parents' },
      { value: 'one', label: 'One parent' },
      { value: 'none', label: 'Neither / not applicable' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  {
    key: 'supporterIsParentOnRecord',
    title: 'Is the person supporting you a parent on those records?',
    help: 'This helps identify when a declaration may need checking.',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  {
    key: 'acceptance',
    title: 'What is your institution application status?',
    help: 'Choose the status that best describes where you are now.',
    options: [
      { value: 'accepted', label: 'I have an offer / acceptance' },
      { value: 'applied', label: 'I applied and am waiting' },
      { value: 'not_yet', label: 'I have not applied yet' },
    ],
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function errorMessage(value: unknown, fallback: string): string {
  if (value instanceof Error) return value.message;
  if (isRecord(value) && typeof value.message === 'string') return value.message;
  return fallback;
}

function isVerification(value: unknown): value is Verification {
  return value === 'official' || value === 'reported' || value === 'secondary' || value === 'conflict';
}

function isCond(value: unknown, depth = 0, budget = { remaining: 50 }): value is Cond {
  budget.remaining -= 1;
  if (!isRecord(value) || depth > 5 || budget.remaining < 0) return false;
  if (value.always === true && Object.keys(value).length === 1) return true;
  if (Array.isArray(value.all)) return value.all.every((item) => isCond(item, depth + 1, budget));
  if (Array.isArray(value.any)) return value.any.every((item) => isCond(item, depth + 1, budget));
  if (isRecord(value.not)) return isCond(value.not, depth + 1, budget);
  const fields = [
    'incomeBracket',
    'ageBand',
    'supporter',
    'parentsOnRecord',
    'supporterIsParentOnRecord',
    'acceptance',
    'vulnerableChild',
    'disabilityBasis',
    'receivesGrant',
  ];
  if (typeof value.field !== 'string' || !fields.includes(value.field)) return false;
  if (value.op === 'in') {
    return Array.isArray(value.value) && value.value.every((item) => typeof item === 'string');
  }
  return (
    (value.op === 'eq' || value.op === 'neq') &&
    (typeof value.value === 'string' || typeof value.value === 'boolean')
  );
}

function parseCheck(value: unknown): ReadinessCheck | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.check_code !== 'string' ||
    typeof value.label !== 'string' ||
    typeof value.why_it_fails !== 'string' ||
    typeof value.sort_order !== 'number' ||
    !isVerification(value.verification)
  ) {
    return null;
  }
  const showWhen = value.show_when === null ? null : isCond(value.show_when) ? value.show_when : undefined;
  if (showWhen === undefined) return null;
  return {
    checkCode: value.check_code,
    label: value.label,
    whyItFails: value.why_it_fails,
    sortOrder: value.sort_order,
    showWhen,
    sourceUrl: typeof value.source_url === 'string' ? value.source_url : null,
    lastVerified: typeof value.last_verified === 'string' ? value.last_verified : null,
    verification: value.verification,
  };
}

function parseDocuments(value: unknown): CoachDocument[] {
  if (!Array.isArray(value)) throw new Error('The document reference response was not a list.');
  return value.map((row) => {
    if (
      !isRecord(row) ||
      typeof row.code !== 'string' ||
      typeof row.name !== 'string' ||
      typeof row.summary !== 'string' ||
      typeof row.special_category !== 'boolean' ||
      typeof row.est_days !== 'number' ||
      !Array.isArray(row.depends_on) ||
      !row.depends_on.every((item) => typeof item === 'string') ||
      typeof row.sort_order !== 'number' ||
      !isVerification(row.verification) ||
      !Array.isArray(row.document_checks)
    ) {
      throw new Error('A document reference row is invalid; ask an admin to review the coach data.');
    }
    const checks = row.document_checks.map(parseCheck);
    if (checks.some((check) => check === null)) {
      throw new Error(`A pre-submission check for “${row.name}” is invalid; ask an admin to review the coach data.`);
    }
    return {
      code: row.code,
      name: row.name,
      summary: row.summary,
      whoSigns: typeof row.who_signs === 'string' ? row.who_signs : null,
      specialCategory: row.special_category,
      estDays: row.est_days,
      dependsOn: row.depends_on,
      officialUrl: typeof row.official_url === 'string' ? row.official_url : null,
      sortOrder: row.sort_order,
      sourceUrl: typeof row.source_url === 'string' ? row.source_url : null,
      lastVerified: typeof row.last_verified === 'string' ? row.last_verified : null,
      verification: row.verification,
      checks: checks.filter((check): check is ReadinessCheck => check !== null),
    };
  });
}

function parseRules(value: unknown): ReadinessRule[] {
  if (!Array.isArray(value)) throw new Error('The document rule response was not a list.');
  return value.map((row) => {
    if (
      !isRecord(row) ||
      typeof row.document_code !== 'string' ||
      !Array.isArray(row.route_codes) ||
      !row.route_codes.every((item) => ROUTE_CODES.some((code) => code === item)) ||
      !isCond(row.when_cond) ||
      (row.on_unknown !== 'include' && row.on_unknown !== 'exclude') ||
      typeof row.reason_text !== 'string' ||
      typeof row.priority !== 'number' ||
      !isVerification(row.verification)
    ) {
      throw new Error('A document rule is invalid; ask an admin to review the coach data.');
    }
    return {
      documentCode: row.document_code,
      routeCodes: row.route_codes,
      when: row.when_cond,
      onUnknown: row.on_unknown,
      reasonText: row.reason_text,
      priority: row.priority,
      sourceUrl: typeof row.source_url === 'string' ? row.source_url : null,
      lastVerified: typeof row.last_verified === 'string' ? row.last_verified : null,
      verification: row.verification,
    };
  });
}

function externalHttpsUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname === 'example.com' || url.hostname.endsWith('.example.com')) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isStaleReferenceDate(value: string, now: Date): boolean {
  if (!isIsoDate(value)) return true;
  const verifiedAt = new Date(`${value}T00:00:00+02:00`).getTime();
  return now.getTime() - verifiedAt > 90 * 86_400_000;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Johannesburg',
  }).format(new Date(`${value}T12:00:00+02:00`));
}

function daysUntil(value: string, now: Date): number {
  const deadline = new Date(`${value}T23:59:59+02:00`).getTime();
  return Math.ceil((deadline - now.getTime()) / 86_400_000);
}

function getRouteCode(row: FundingRow): string {
  const name = row.name.toLowerCase();
  if (name.includes('nsfas') && row.type === 'loan') return 'nsfas_loan';
  if (name.includes('nsfas') && row.type === 'bursary') return 'nsfas_bursary';
  if (row.type === 'loan') return row.provider_type === 'bank' ? 'bank_loans' : 'private_loans';
  return 'bursaries';
}

function fundingFit(row: FundingRow, bracket: IncomeBracket): { label: string; tone: string } {
  if (bracket === 'prefer_not_to_say') return { label: 'Check the provider’s current criteria', tone: 'neutral' };
  if (row.name.toLowerCase().includes('nsfas')) {
    if (row.type === 'loan' && bracket === '350k_to_600k') {
      return { label: 'Missing-middle loan route to review', tone: 'possible' };
    }
    if (row.type === 'bursary' && bracket === 'up_to_350k') {
      return { label: 'NSFAS bursary route to review', tone: 'possible' };
    }
    return { label: 'Check the current NSFAS income rules', tone: 'neutral' };
  }
  return { label: 'Review the provider’s current criteria', tone: 'neutral' };
}

function verificationLabel(value: Verification): string {
  if (value === 'official') return 'Official source';
  if (value === 'reported') return 'Reported rule';
  if (value === 'secondary') return 'Secondary source — confirm with NSFAS';
  return 'Conflicting information — confirm with NSFAS';
}

function verificationTone(value: Verification): string {
  return value === 'official' ? 'official' : 'caution';
}

export default function Coach() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [stage, setStage] = useState<Stage>('route');
  const [incomeBracket, setIncomeBracket] = useState<IncomeBracket | ''>('');
  const [selectedFundingId, setSelectedFundingId] = useState('');
  const [answers, setAnswers] = useState<HouseholdAnswers>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [documents, setDocuments] = useState<CoachDocument[]>([]);
  const [rules, setRules] = useState<ReadinessRule[]>([]);
  const [funding, setFunding] = useState<FundingRow[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());
  const [fixClocks, setFixClocks] = useState<FixClockRow[]>([]);
  const [notificationDate, setNotificationDate] = useState('');
  const [showFixClockForm, setShowFixClockForm] = useState(false);
  const [outstandingCodes, setOutstandingCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [referenceError, setReferenceError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [savingKey, setSavingKey] = useState('');
  const [savingIncome, setSavingIncome] = useState(false);
  const [savingFixClock, setSavingFixClock] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [now, setNow] = useState(() => new Date());

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setReferenceError('');
    try {
      const [profileResult, fundingResult, documentResult, rulesResult, progressResult, applicationResult] =
        await Promise.all([
          supabase.from('student_profiles').select('income_bracket').eq('id', userId).maybeSingle(),
          supabase
            .from('funding_sources')
            .select('id,name,type,provider_type,description,income_floor,income_ceiling,disability_income_ceiling,deadline,source_url,last_verified,verification'),
          supabase
            .from('document_types')
            .select('code,name,summary,who_signs,special_category,est_days,depends_on,official_url,sort_order,source_url,last_verified,verification,document_checks(check_code,label,why_it_fails,sort_order,show_when,source_url,last_verified,verification)'),
          supabase
            .from('document_rules')
            .select('document_code,route_codes,when_cond,on_unknown,reason_text,priority,source_url,last_verified,verification'),
          supabase
            .from('readiness_progress')
            .select('document_code,check_code,checked')
            .eq('student_id', userId),
          supabase
            .from('fix_clocks')
            .select('funding_name,kind,notified_on,window_days,outstanding_docs')
            .eq('student_id', userId),
        ]);

      if (profileResult.error) throw profileResult.error;
      if (fundingResult.error) throw fundingResult.error;
      if (progressResult.error) throw progressResult.error;
      const profile = profileResult.data as { income_bracket: IncomeBracket | null } | null;
      setIncomeBracket(profile?.income_bracket ?? '');
      setFunding((fundingResult.data ?? []) as FundingRow[]);
      setFixClocks((applicationResult.data ?? []) as FixClockRow[]);
      setCheckedKeys(
        new Set(
          ((progressResult.data ?? []) as ProgressRow[])
            .filter((row) => row.checked)
            .map((row) => `${row.document_code}:${row.check_code}`),
        ),
      );

      if (documentResult.error || rulesResult.error || applicationResult.error) {
        setDocuments([]);
        setRules([]);
        setFixClocks([]);
        setReferenceError(
          'Coach reference data and reminders are not available yet. Apply db/09_coach_reference_data.sql in Supabase, then add sourced and verified document rules before using a personalized checklist.',
        );
      } else {
        setDocuments(parseDocuments(documentResult.data));
        setRules(parseRules(rulesResult.data));
      }
    } catch (error) {
      const message = errorMessage(error, 'Coach data could not be loaded. Please retry.');
      const mentionsMissingSchema = /does not exist|could not find|schema cache/i.test(message);
      setReferenceError(
        mentionsMissingSchema
          ? `${message} Apply db/09_coach_reference_data.sql in Supabase.`
          : message,
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.title = 'Paperwork Readiness Coach | Beyond Tomorrow';
  }, []);

  const householdAnswers = useMemo(
    () => ({ ...answers, incomeBracket: incomeBracket || undefined }),
    [answers, incomeBracket],
  );
  const fundingRows = useMemo(
    () =>
      funding.filter(
        (row) =>
          !/\b(sample data|demo)\b/i.test(row.name) &&
          externalHttpsUrl(row.source_url) &&
          row.last_verified && isIsoDate(row.last_verified),
      ),
    [funding],
  );
  const selectedFunding = fundingRows.find((row) => row.id === selectedFundingId);
  const fixClock = fixClocks.find(
    (row) => row.funding_name === (selectedFunding?.name ?? 'NSFAS Bursary') && row.kind === 'documents',
  );
  useEffect(() => {
    setNotificationDate(fixClock?.notified_on ?? '');
    setOutstandingCodes(fixClock?.outstanding_docs ?? []);
  }, [selectedFundingId, fixClock?.notified_on, fixClock?.outstanding_docs]);

  const routeCodes = useMemo(
    () => (selectedFunding ? [getRouteCode(selectedFunding)] : []),
    [selectedFunding],
  );
  const required = useMemo(
    () => requiredDocuments(routeCodes, documents, rules, householdAnswers, now),
    [routeCodes, documents, rules, householdAnswers, now],
  );
  const preflight = useMemo(() => evaluatePreflight(required, checkedKeys), [required, checkedKeys]);
  const nsfasDeadline = fundingRows.find(
    (row) =>
      row.name.toLowerCase().includes('nsfas') &&
      row.deadline &&
      row.verification === 'official' &&
      row.last_verified &&
      !isStaleReferenceDate(row.last_verified, now),
  );
  const deadlineDays = nsfasDeadline?.deadline ? daysUntil(nsfasDeadline.deadline, now) : null;
  const fixDays = fixClock?.notified_on
    ? daysUntil(addDays(fixClock.notified_on, fixClock.window_days), now)
    : null;
  const fixWindowDays = fixClock?.window_days ?? 30;
  const riskAnalysis = useMemo(() => {
    if (!required.length) return null;
    try {
      const completedCodes = new Set(
        preflight.perDocument
          .filter((document) => document.total > 0 && document.total === document.ticked)
          .map((document) => document.code),
      );
      const workDays = criticalPathDays(required, completedCodes);
      const deadlineStatus =
        deadlineDays === null
          ? null
          : deadlineDays < 0
            ? 'overdue'
            : workDays > deadlineDays
              ? 'at_risk'
              : 'on_track';
      return {
        forecast: forecastIncompleteRisk({
          answers: householdAnswers,
          documents: required,
          checkedKeys,
          deadlineStatus,
          daysLeft: deadlineDays,
        }),
        error: '',
      };
    } catch (error) {
      return {
        forecast: null,
        error: error instanceof Error ? error.message : 'Readiness risk could not be calculated.',
      };
    }
  }, [required, preflight, deadlineDays, householdAnswers, checkedKeys]);

  async function chooseIncome(bracket: IncomeBracket) {
    if (!userId) return;
    setIncomeBracket(bracket);
    setSelectedFundingId('');
    setAnswers((current) => ({ ...current, incomeBracket: bracket }));
    setSavingIncome(true);
    setSaveError('');
    try {
      const { error } = await supabase
        .from('student_profiles')
        .upsert({ id: userId, income_bracket: bracket }, { onConflict: 'id' });
      if (error) throw error;
    } catch (error) {
      setSaveError(errorMessage(error, 'Your bracket could not be saved.'));
    } finally {
      setSavingIncome(false);
    }
  }

  async function toggleCheck(documentCode: string, checkCode: string, checked: boolean) {
    if (!userId) return;
    const key = `${documentCode}:${checkCode}`;
    setCheckedKeys((current) => {
      const updated = new Set(current);
      if (checked) updated.add(key);
      else updated.delete(key);
      return updated;
    });
    const target = required.find((item) => item.code === documentCode);
    if (!target || target.specialCategory) return;
    setSavingKey(key);
    setSaveError('');
    try {
      const payload = readinessPersistencePayload(userId, [target], new Set(checked ? [key] : []));
      const row = payload[0];
      if (!row) return;
      const { error } = await supabase
        .from('readiness_progress')
        .upsert(row, { onConflict: 'student_id,document_code,check_code' });
      if (error) throw error;
    } catch (error) {
      setCheckedKeys((current) => {
        const restored = new Set(current);
        if (checked) restored.delete(key);
        else restored.add(key);
        return restored;
      });
      setSaveError(errorMessage(error, 'Your checklist update could not be saved.'));
    } finally {
      setSavingKey('');
    }
  }

  function updateAnswer(key: keyof HouseholdAnswers, value: string | boolean) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  async function saveFixClock() {
    if (!userId || !notificationDate) return;
    setSavingFixClock(true);
    setSaveError('');
    try {
      const fundingName = selectedFunding?.name ?? 'NSFAS Bursary';
      const { error } = await supabase.from('fix_clocks').upsert(
        {
          student_id: userId,
          funding_name: fundingName,
          kind: 'documents',
          notified_on: notificationDate,
          window_days: fixClock?.window_days ?? 30,
          outstanding_docs: outstandingCodes.filter((code) =>
            required.some((item) => item.code === code && !item.specialCategory),
          ),
        },
        { onConflict: 'student_id,funding_name,kind' },
      );
      if (error) throw error;
      setFixClocks((current) => [
        ...current.filter((item) => !(item.funding_name === fundingName && item.kind === 'documents')),
        {
          funding_name: fundingName,
          kind: 'documents',
          notified_on: notificationDate,
          window_days: fixClock?.window_days ?? 30,
          outstanding_docs: outstandingCodes.filter((code) =>
            required.some((item) => item.code === code && !item.specialCategory),
          ),
        },
      ]);
      setShowFixClockForm(false);
    } catch (error) {
      setSaveError(errorMessage(error, 'The 30-day clock could not be saved.'));
    } finally {
      setSavingFixClock(false);
    }
  }

  async function copySafeChecklist() {
    const shareable = required.filter((item) => !item.specialCategory);
    const lines = [
      'Beyond Tomorrow — paperwork checklist',
      '',
      ...shareable.flatMap((item) => [
        item.name,
        ...item.checks.map((check) => `- ${checkedKeys.has(`${item.code}:${check.checkCode}`) ? '[x]' : '[ ]'} ${check.label}`),
        '',
      ]),
      'Guidance only. Confirm current requirements with the funding provider.',
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setShareStatus('A checklist without household answers or special-category items was copied.');
    } catch (error) {
      setShareStatus(`Could not copy the checklist: ${errorMessage(error, 'Clipboard access is unavailable.')}`);
    }
  }

  function resetWizard() {
    setStage('route');
    setQuestionIndex(0);
    setAnswers({});
  }

  function goToNextQuestion() {
    if (questionIndex < QUESTIONS.length - 1) setQuestionIndex((index) => index + 1);
    else setStage('documents');
  }

  const currentQuestion = QUESTIONS[questionIndex];
  const currentAnswer = currentQuestion ? householdAnswers[currentQuestion.key] : undefined;
  const allFunding = incomeBracket
    ? fundingRows.filter((row) => {
        if (row.name.toLowerCase().includes('nsfas')) return true;
        if (row.type === 'loan') return row.provider_type === 'bank' || row.provider_type === 'private_lender';
        return true;
      })
    : [];

  return (
    <div className="coach-page">
      <Hero
        eyebrow="Paperwork readiness coach"
        title={
          <h1>
            Prepare your application <span>with confidence.</span>
          </h1>
        }
        description="Find your funding route, answer a few broad questions and prepare with a checklist based only on sourced, dated guidance."
        feature={{
          symbol: <FileCheck2 size={28} strokeWidth={1.8} />,
          title: 'Prepare. Check. Succeed.',
          description: 'Household answers stay in your private page session.',
        }}
      />

      <main className="coach-content">
        <ol className="coach-steps" aria-label="Coach steps">
          {(['route', 'questions', 'documents'] as const).map((item, index) => (
            <li key={item} className={stage === item ? 'is-current' : index < ['route', 'questions', 'documents'].indexOf(stage) ? 'is-complete' : ''}>
              <span>{index < ['route', 'questions', 'documents'].indexOf(stage) ? <Check size={15} /> : index + 1}</span>
              {item === 'route' ? 'Funding route' : item === 'questions' ? 'Your situation' : 'Document checklist'}
            </li>
          ))}
        </ol>

        {referenceError && (
          <div className="coach-alert" role="alert">
            <ShieldAlert size={20} />
            <div>
              <strong>Some coach data is unavailable.</strong>
              <p>{referenceError}</p>
              <button type="button" className="coach-text-button" onClick={() => void loadData()}>
                <RotateCcw size={15} /> Retry loading
              </button>
            </div>
          </div>
        )}
        {saveError && <p className="coach-save-error" role="alert">{saveError}</p>}

        {loading ? (
          <div className="coach-panel coach-loading" role="status">Loading your saved route and current references…</div>
        ) : (
          <>
            {stage === 'route' && (
              <section className="coach-panel" aria-labelledby="route-title">
                <div className="coach-panel-heading">
                  <div>
                    <p className="coach-kicker">Step 1 of 3</p>
                    <h2 id="route-title">Which income range best describes your household?</h2>
                    <p>Choose a range, not an exact amount. You can change it later in your profile.</p>
                  </div>
                  <span className="coach-step-icon"><ChevronRight size={21} /></span>
                </div>
                <div className="coach-income-options">
                  {INCOME_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={`coach-income-option ${incomeBracket === option.value ? 'is-selected' : ''}`}
                      aria-pressed={incomeBracket === option.value}
                      disabled={savingIncome}
                      onClick={() => void chooseIncome(option.value)}
                    >
                      <span className="coach-radio" aria-hidden="true">{incomeBracket === option.value ? <Check size={14} /> : null}</span>
                      <span><strong>{option.label}</strong><small>{option.hint}</small></span>
                    </button>
                  ))}
                </div>
                <p className="coach-inline-status" aria-live="polite">
                  {savingIncome ? 'Saving your bracket…' : incomeBracket ? 'Your bracket is saved to your private study profile.' : 'Your income bracket is not saved until you choose one.'}
                </p>

                {incomeBracket && (
                  <div className="coach-route-results">
                    <h3>Routes and options to review</h3>
                    {allFunding.length ? (
                      <div className="coach-route-grid">
                        {allFunding.map((row) => {
                          const fit = fundingFit(row, incomeBracket);
                          const sourceUrl = externalHttpsUrl(row.source_url);
                          return (
                            <article className="coach-route-card" key={row.id}>
                              <div className="coach-route-card-top">
                                <span className={`coach-fit-pill ${fit.tone}`}>{fit.label}</span>
                                {row.type === 'loan' && <span className="coach-debt-label">Repayable debt</span>}
                              </div>
                              <h4>{row.name}</h4>
                              {row.description && <p>{row.description}</p>}
                              {row.income_floor !== null && (
                                <p className="coach-threshold">Listed income floor: R{Number(row.income_floor).toLocaleString('en-ZA')}</p>
                              )}
                              {row.income_ceiling !== null && (
                                <p className="coach-threshold">Listed income ceiling: R{Number(row.income_ceiling).toLocaleString('en-ZA')}</p>
                              )}
                              {row.deadline && row.verification === 'official' && row.last_verified && !isStaleReferenceDate(row.last_verified, now) && (
                                <p className="coach-threshold">
                                  Listed closing date: {formatDate(row.deadline)}
                                  {row.name.toLowerCase().includes('nsfas') && deadlineDays !== null && (
                                    <strong>{deadlineDays < 0 ? ' · Date has passed' : ` · ${deadlineDays} days left`}</strong>
                                  )}
                                </p>
                              )}
                              {row.deadline && row.verification === 'official' && row.last_verified && isStaleReferenceDate(row.last_verified, now) && (
                                <p className="coach-stale-warning">A countdown is hidden because this date’s verification is older than 90 days.</p>
                              )}
                              <span className={`coach-verification ${verificationTone(row.verification ?? 'conflict')}`}>
                                {row.verification ? verificationLabel(row.verification) : 'Verification not set — confirm with provider'}
                              </span>
                              <div className="coach-source-row">
                                <span>{row.last_verified ? `Source checked ${formatDate(row.last_verified)}` : 'Source date unavailable'}</span>
                                {sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer">Review source <ExternalLink size={14} /></a>}
                              </div>
                              {row.type === 'loan' && <p className="coach-debt-note">This is a loan you must repay. Compare terms carefully.</p>}
                              <button
                                type="button"
                                className={`coach-select-route ${selectedFundingId === row.id ? 'is-selected' : ''}`}
                                aria-pressed={selectedFundingId === row.id}
                                onClick={() => setSelectedFundingId(row.id)}
                              >
                                {selectedFundingId === row.id ? <><Check size={15} /> Selected route</> : <>Use this route <ArrowRight size={15} /></>}
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="coach-empty-note">No dated funding references are available yet. Check the provider’s official site before making a decision.</p>
                    )}
                    {!allFunding.length && (
                      <button type="button" className="coach-text-button" onClick={() => setStage('questions')}>
                        Continue without a listed route <ArrowRight size={15} />
                      </button>
                    )}
                    <p className="coach-disclaimer">Thresholds are indicators, not approval decisions. Final eligibility and dates must be confirmed with the provider.</p>
                  </div>
                )}
                <div className="coach-actions">
                  <button type="button" className="coach-primary-button" disabled={!incomeBracket || (!selectedFundingId && Boolean(allFunding.length)) || savingIncome} onClick={() => setStage('questions')}>
                    Continue to a few questions <ArrowRight size={17} />
                  </button>
                  <Link className="coach-secondary-link" to="/profile">Review privacy settings</Link>
                </div>
              </section>
            )}

            {stage === 'questions' && currentQuestion && (
              <section className="coach-panel" aria-labelledby="question-title">
                <div className="coach-panel-heading">
                  <div>
                    <p className="coach-kicker">Step 2 of 3 · Question {questionIndex + 1} of {QUESTIONS.length}</p>
                    <h2 id="question-title">{currentQuestion.title}</h2>
                    <p>{currentQuestion.help}</p>
                  </div>
                  <span className="coach-step-icon"><span>{questionIndex + 1}</span></span>
                </div>
                <div className="coach-question-progress" aria-label={`Question ${questionIndex + 1} of ${QUESTIONS.length}`}>
                  {QUESTIONS.map((question, index) => <span key={question.key} className={index <= questionIndex ? 'is-filled' : ''} />)}
                </div>
                <div className="coach-answer-options" role="group" aria-labelledby="question-title">
                  {currentQuestion.options.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={`coach-answer-option ${currentAnswer === option.value ? 'is-selected' : ''}`}
                      aria-pressed={currentAnswer === option.value}
                      onClick={() => updateAnswer(currentQuestion.key, option.value)}
                    >
                      <span className="coach-radio" aria-hidden="true">{currentAnswer === option.value ? <Check size={14} /> : null}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
                {questionIndex === QUESTIONS.length - 1 && (
                  <details className="coach-special-details">
                    <summary>Optional situation details <span>Never saved or sent</span></summary>
                    <p>Only answer if you want to. These answers stay on this device and are never included in your saved checklist.</p>
                    <label><input type="checkbox" checked={answers.vulnerableChild === true} onChange={(event) => updateAnswer('vulnerableChild', event.target.checked)} /> I may need guidance for an orphan or vulnerable child situation</label>
                    <label><input type="checkbox" checked={answers.disabilityBasis === true} onChange={(event) => updateAnswer('disabilityBasis', event.target.checked)} /> I may apply under a disability-related provision</label>
                    <label><input type="checkbox" checked={answers.receivesGrant === true} onChange={(event) => updateAnswer('receivesGrant', event.target.checked)} /> I or my household receives a social grant</label>
                  </details>
                )}
                <div className="coach-actions coach-actions-between">
                  <button
                    type="button"
                    className="coach-quiet-button"
                    onClick={() => questionIndex > 0 ? setQuestionIndex((index) => index - 1) : setStage('route')}
                  >
                    <ArrowLeft size={17} /> Back
                  </button>
                  <button
                    type="button"
                    className="coach-primary-button"
                    disabled={currentAnswer === undefined}
                    onClick={goToNextQuestion}
                  >
                    {questionIndex === QUESTIONS.length - 1 ? 'Build my checklist' : 'Next question'} <ArrowRight size={17} />
                  </button>
                </div>
              </section>
            )}

            {stage === 'documents' && (
              <section className="coach-panel" aria-labelledby="documents-title">
                <div className="coach-panel-heading">
                  <div>
                    <p className="coach-kicker">Step 3 of 3</p>
                    <h2 id="documents-title">Your paperwork checklist</h2>
                    <p>Review the guidance, then check each item before you submit.</p>
                  </div>
                  <span className="coach-step-icon"><FileCheck2 size={21} /></span>
                </div>
                {required.length ? (
                  <>
                    <div className="coach-progress-summary" aria-live="polite">
                      <strong>{preflight.perDocument.reduce((sum, item) => sum + item.ticked, 0)} of {preflight.perDocument.reduce((sum, item) => sum + item.total, 0)} checks complete</strong>
                      <span>{preflight.allReady ? 'Checklist complete — review official instructions before submitting.' : 'A reminder: ticking boxes does not upload or submit documents.'}</span>
                    </div>
                    {riskAnalysis?.forecast && (
                      <aside className={`coach-risk-banner coach-risk-${riskAnalysis.forecast.level}`} aria-label="Rule-based paperwork readiness estimate">
                        <div className="coach-risk-title">
                          <ShieldAlert size={19} />
                          <div>
                            <strong>Potential paperwork risk: {riskAnalysis.forecast.level}</strong>
                            <span>Rule-based guidance, not an approval or rejection prediction.</span>
                          </div>
                        </div>
                        <p><strong>Next action:</strong> {riskAnalysis.forecast.nextAction}</p>
                        <ul>
                          {riskAnalysis.forecast.reasons.map((reason) => <li key={reason.code}>{reason.text}</li>)}
                        </ul>
                      </aside>
                    )}
                    {riskAnalysis?.error && <p className="coach-save-error" role="alert">{riskAnalysis.error}</p>}
                    {required.map((item) => (
                      <article className="coach-document-card" key={item.code}>
                        <div className="coach-document-heading">
                          <div>
                            <span className={`coach-verification ${verificationTone(item.verification)}`}>{verificationLabel(item.verification)}</span>
                            <h3>{item.name}</h3>
                          </div>
                          <span className="coach-days"><Clock3 size={15} /> Planning estimate: ~{item.estDays} {item.estDays === 1 ? 'day' : 'days'}</span>
                        </div>
                        <p>{item.summary}</p>
                        {item.whoSigns && <p className="coach-signer"><strong>Who signs / provides it:</strong> {item.whoSigns}</p>}
                        {item.reasons.map((reason) => <p className="coach-reason" key={reason}>{reason}{item.confirmNeeded ? ' Please confirm this applies to your situation.' : ''}</p>)}
                        {item.stale && <p className="coach-stale-warning">This reference is older than 90 days. Confirm it with NSFAS before relying on it.</p>}
                        {item.specialCategory && <p className="coach-private-note"><LockKeyhole size={14} /> Special-category detail stays on this device; its checklist is not saved.</p>}
                        {item.checks.length > 0 && (
                          <fieldset className="coach-checks">
                            <legend>Before you submit</legend>
                            {item.checks.map((check) => {
                              const key = `${item.code}:${check.checkCode}`;
                              return (
                                <label key={check.checkCode} className="coach-check-row">
                                  <input
                                    type="checkbox"
                                    checked={checkedKeys.has(key)}
                                    disabled={savingKey === key}
                                    onChange={(event) => void toggleCheck(item.code, check.checkCode, event.target.checked)}
                                  />
                                  <span><strong>{check.label}</strong>{check.whyItFails && <small>{check.whyItFails}</small>}</span>
                                </label>
                              );
                            })}
                          </fieldset>
                        )}
                        <div className="coach-document-source">
                          <span>Last checked: {item.lastVerified ? formatDate(item.lastVerified) : 'date unavailable'}</span>
                          {externalHttpsUrl(item.sourceUrl) && (
                            <a href={externalHttpsUrl(item.officialUrl) ?? externalHttpsUrl(item.sourceUrl)!} target="_blank" rel="noreferrer">
                              Confirm the official instructions <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </>
                ) : (
                  <div className="coach-no-checklist">
                    <ShieldAlert size={22} />
                    <div>
                      <h3>No personalized document rules are available yet.</h3>
                      <p>We won’t guess which documents you need. Your income route is shown above; check current document requirements directly with NSFAS until verified rules are added.</p>
                      <a href="https://www.nsfas.org.za" target="_blank" rel="noreferrer">Visit NSFAS <ExternalLink size={14} /></a>
                    </div>
                  </div>
                )}

                <section className="coach-fix-clock">
                  <div>
                    <p className="coach-kicker">Already notified your application is incomplete?</p>
                    {fixDays !== null ? (
                      <>
                        <h3>{fixDays < 0 ? `Your ${fixWindowDays}-day response window may have passed.` : `${fixDays} days remain in your ${fixWindowDays}-day window.`}</h3>
                        <p>Notification date recorded: {fixClock?.notified_on ? formatDate(fixClock.notified_on) : ''}. Confirm the deadline and outstanding documents with the funding provider.</p>
                        {fixClock?.outstanding_docs.length ? (
                          <p>Items you marked for follow-up: {fixClock.outstanding_docs.map((code) => required.find((item) => item.code === code)?.name ?? 'Previously listed document').join(', ')}.</p>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <h3>Start a private 30-day reminder</h3>
                        <p>Only the notification date is stored in your account. Confirm the exact deadline with the funding provider.</p>
                      </>
                    )}
                  </div>
                  {!showFixClockForm && (
                    <button type="button" className="coach-quiet-button" onClick={() => setShowFixClockForm(true)}>
                      {fixDays !== null ? 'Update notification date' : 'I was notified'} <ArrowRight size={16} />
                    </button>
                  )}
                  {showFixClockForm && (
                    <div className="coach-fix-form">
                      <label htmlFor="incomplete-date">Date you were notified</label>
                      <input id="incomplete-date" type="date" max={new Date().toISOString().slice(0, 10)} value={notificationDate} onChange={(event) => setNotificationDate(event.target.value)} />
                      <div className="coach-outstanding-options">
                        <strong>Documents to follow up (optional)</strong>
                        {required.filter((item) => !item.specialCategory).length ? required
                          .filter((item) => !item.specialCategory)
                          .map((item) => (
                            <label key={item.code}>
                              <input
                                type="checkbox"
                                checked={outstandingCodes.includes(item.code)}
                                onChange={(event) => setOutstandingCodes((current) =>
                                  event.target.checked
                                    ? [...new Set([...current, item.code])]
                                    : current.filter((code) => code !== item.code),
                                )}
                              />
                              {item.name}
                            </label>
                          )) : <small>No verified document list is available; you can still save the reminder date.</small>}
                      </div>
                      <button type="button" className="coach-primary-button" disabled={!notificationDate || savingFixClock} onClick={() => void saveFixClock()}>
                        {savingFixClock ? 'Saving…' : 'Save reminder'}
                      </button>
                    </div>
                  )}
                </section>

                <div className="coach-scam-note">
                  <ShieldAlert size={18} />
                  <p><strong>Scam reminder:</strong> NSFAS applications and updates should be handled through official NSFAS channels. Never pay someone to “guarantee” funding.</p>
                </div>
                <div className="coach-actions coach-actions-between coach-print-actions">
                  <button type="button" className="coach-quiet-button" onClick={() => setStage('questions')}><ArrowLeft size={17} /> Back to answers</button>
                  <div>
                    <button type="button" className="coach-quiet-button" onClick={() => void copySafeChecklist()}><FileCheck2 size={16} /> Copy safe checklist</button>
                    <button type="button" className="coach-quiet-button" onClick={() => window.print()}><Printer size={16} /> Print checklist</button>
                    <button type="button" className="coach-quiet-button" onClick={resetWizard}><RotateCcw size={16} /> Start over</button>
                  </div>
                </div>
                {shareStatus && <p className="coach-inline-status" role="status">{shareStatus}</p>}
              </section>
            )}

            <section className="coach-privacy-strip">
              <LockKeyhole size={17} />
              <p><strong>Your privacy matters.</strong> Household answers, including optional special circumstances, remain in memory only. Your income bracket, non-special checklist ticks and any reminder date you choose to save are stored in your account.</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function addDays(value: string, days: number): string {
  const parts = value.split('-').map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (parts.length !== 3 || year === undefined || month === undefined || day === undefined) {
    throw new Error('The saved notification date is invalid.');
  }
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}
