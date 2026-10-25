import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Trash2 } from 'lucide-react';
import { Hero } from '../../components/Hero';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { INCOME_BRACKETS, PROVINCES, type IncomeBracket, type Province } from '@beyond-tomorrow/engine';
import './profile.css';

const INTERESTS = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'technology', label: 'Technology and computing' },
  { value: 'business', label: 'Business and commerce' },
  { value: 'finance', label: 'Finance' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'health', label: 'Health sciences' },
  { value: 'law', label: 'Law' },
  { value: 'humanities', label: 'Humanities' },
  { value: 'education', label: 'Education' },
  { value: 'science', label: 'Natural sciences' },
  { value: 'agriculture', label: 'Agriculture and environment' },
  { value: 'construction', label: 'Construction' },
] as const;

type ProfileRecord = {
  province: Province | null;
  income_bracket: IncomeBracket | 'unsure' | null;
  interests: string[];
};

type StudentMarkRecord = {
  mark: number | null;
  subjects: { code: string; name: string } | null;
};

type SavedSubject = {
  code: string;
  name: string;
  mark: number | null;
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const INCOME_LABELS: Record<IncomeBracket, string> = {
  up_to_350k: 'Up to R350,000',
  '350k_to_600k': 'R350,001 to R600,000',
  above_600k: 'Above R600,000',
  prefer_not_to_say: 'Prefer not to say',
};

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}

export function ProfilePage() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [province, setProvince] = useState<Province | ''>('');
  const [incomeBracket, setIncomeBracket] = useState<IncomeBracket | ''>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<SavedSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const requestId = useRef(0);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const currentRequest = ++requestId.current;
    setLoading(true);
    setLoadError(null);

    try {
      const [profileResult, marksResult] = await Promise.all([
        supabase
          .from('student_profiles')
          .select('province, income_bracket, interests')
          .eq('id', userId)
          .maybeSingle<ProfileRecord>(),
        supabase
          .from('student_marks')
          .select('mark, subjects(code, name)')
          .eq('student_id', userId)
          .returns<StudentMarkRecord[]>(),
      ]);

      if (currentRequest !== requestId.current) return;
      if (profileResult.error || marksResult.error) {
        setLoadError(
          profileResult.error?.message ??
            marksResult.error?.message ??
            'Your study profile could not be loaded.',
        );
        setLoading(false);
        return;
      }

      const profile = profileResult.data;
      setProvince(profile?.province ?? '');
      setIncomeBracket(
        profile?.income_bracket === 'unsure' ? 'prefer_not_to_say' : profile?.income_bracket ?? '',
      );
      setInterests(profile?.interests ?? []);
      setSubjects(
        (marksResult.data ?? [])
          .flatMap((row) =>
            row.subjects
              ? [{ code: row.subjects.code, name: row.subjects.name, mark: row.mark }]
              : [],
          )
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      setSaveStatus('idle');
      setSaveError(null);
      setLoading(false);
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      setLoadError(
        error instanceof Error
          ? `Your study profile could not be loaded: ${error.message}`
          : 'Your study profile could not be loaded.',
      );
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadProfile();
    return () => {
      requestId.current += 1;
    };
  }, [loadProfile, reloadKey]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      setSaveError('You need to sign in again before saving your profile.');
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saving');
    setSaveError(null);
    try {
      const { error } = await supabase.from('student_profiles').upsert(
        {
          id: userId,
          province: province || null,
          income_bracket: incomeBracket || null,
          interests,
        },
        { onConflict: 'id' },
      );
      if (error) throw error;
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
      setSaveError(`Your profile was not saved: ${errorMessage(error)}`);
    }
  }

  function toggleInterest(value: string) {
    setInterests((current) =>
      current.includes(value)
        ? current.filter((interest) => interest !== value)
        : [...current, value],
    );
    setSaveStatus('idle');
  }

  async function clearStudyProfile() {
    if (!userId || !window.confirm('Remove your saved province, income bracket, interests, subjects and marks?')) {
      return;
    }

    setClearing(true);
    setClearError(null);
    try {
      const marksResult = await supabase.from('student_marks').delete().eq('student_id', userId);
      if (marksResult.error) {
        setClearError(`Saved subjects and marks could not be removed: ${marksResult.error.message}`);
        return;
      }

      const profileResult = await supabase.from('student_profiles').upsert(
        { id: userId, province: null, income_bracket: null, interests: [] },
        { onConflict: 'id' },
      );
      if (profileResult.error) {
        setClearError(
          `Your subjects and marks were removed, but profile details could not be cleared: ${profileResult.error.message}`,
        );
        setReloadKey((key) => key + 1);
        return;
      }

      setProvince('');
      setIncomeBracket('');
      setInterests([]);
      setSubjects([]);
      setSaveStatus('idle');
      setSaveError(null);
    } catch (error) {
      setClearError(`Your study data could not be cleared: ${errorMessage(error)}`);
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="page-wrapper">
      <Hero
        eyebrow="Your study details"
        title={
          <h1>
            My Study <span>Profile.</span>
          </h1>
        }
        description="Keep the details that help us find relevant study and funding options. Your subjects and marks are shared with the APS calculator."
        feature={{
          symbol: <LockKeyhole size={28} strokeWidth={1.8} />,
          title: 'Your data, your choice.',
          description: 'You can update or clear your saved study details at any time.',
        }}
      />

      <div className="page-content">
        <div className="study-profile">
          <aside className="study-profile-privacy" aria-label="Privacy information">
            <LockKeyhole size={22} aria-hidden="true" />
            <div>
              <h2>Your privacy matters</h2>
              <p>
                We use your province, income bracket, interests, subjects and marks to show relevant
                options. We never ask for ID numbers, exact income, or document uploads.
              </p>
            </div>
          </aside>

          {loading ? (
            <p className="study-profile-status" role="status">Loading your study profile…</p>
          ) : loadError ? (
            <div className="study-profile-status study-profile-error" role="alert">
              <p>{loadError}</p>
              <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
                Try again
              </button>
            </div>
          ) : (
            <>
              <form className="study-profile-card" onSubmit={handleSave}>
                <div className="study-profile-heading">
                  <div>
                    <p className="study-profile-kicker">Personalize your options</p>
                    <h2>Study preferences</h2>
                    <p>These details help narrow funding and course information.</p>
                  </div>
                </div>

                <div className="study-profile-fields">
                  <label className="study-profile-field">
                    <span>Province</span>
                    <select
                      value={province}
                      onChange={(event) => {
                        setProvince(PROVINCES.find((item) => item === event.target.value) ?? '');
                        setSaveStatus('idle');
                      }}
                      disabled={saveStatus === 'saving'}
                    >
                      <option value="">Choose a province</option>
                      {PROVINCES.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>

                  <label className="study-profile-field">
                    <span>Household income range</span>
                    <select
                      value={incomeBracket}
                      onChange={(event) => {
                        setIncomeBracket(
                          INCOME_BRACKETS.find((item) => item === event.target.value) ?? '',
                        );
                        setSaveStatus('idle');
                      }}
                      disabled={saveStatus === 'saving'}
                    >
                      <option value="">Choose a range (optional)</option>
                      {INCOME_BRACKETS.map((item) => (
                        <option key={item} value={item}>{INCOME_LABELS[item]}</option>
                      ))}
                    </select>
                    <small>Choose a range only. We do not ask for an exact amount.</small>
                  </label>
                </div>

                <fieldset className="study-profile-interests">
                  <legend>Areas you are interested in</legend>
                  <p>Select any that fit. You can change these later.</p>
                  <div className="study-profile-interest-grid">
                    {INTERESTS.map(({ value, label }) => (
                      <label key={value} className="study-profile-interest">
                        <input
                          type="checkbox"
                          checked={interests.includes(value)}
                          onChange={() => toggleInterest(value)}
                          disabled={saveStatus === 'saving'}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="study-profile-actions">
                  <button type="submit" disabled={saveStatus === 'saving'}>
                    {saveStatus === 'saving' ? 'Saving…' : 'Save study preferences'}
                  </button>
                  <p className="study-profile-save-status" aria-live="polite">
                    {saveStatus === 'saved' && 'Saved securely to your account.'}
                    {saveStatus === 'error' && saveError}
                  </p>
                </div>
              </form>

              <section className="study-profile-card" aria-labelledby="saved-subjects-title">
                <div className="study-profile-heading">
                  <div>
                    <p className="study-profile-kicker">From your APS calculator</p>
                    <h2 id="saved-subjects-title">Your subjects and marks</h2>
                    <p>
                      {subjects.length
                        ? `${subjects.length} subject${subjects.length === 1 ? '' : 's'} saved. Update these as your marks change.`
                        : 'Your saved subjects and marks will appear here.'}
                    </p>
                  </div>
                  <Link className="study-profile-edit-link" to="/aps-calculator">
                    Edit in calculator <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>

                {subjects.length > 0 ? (
                  <ul className="study-profile-subject-list">
                    {subjects.map(({ code, name, mark }) => (
                      <li key={code}>
                        <span>{name}</span>
                        <strong>{mark === null ? 'Mark not added' : `${mark}%`}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Link className="study-profile-primary-link" to="/aps-calculator">
                    Add subjects and marks <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                )}
              </section>

              <section className="study-profile-clear" aria-labelledby="clear-profile-title">
                <div>
                  <h2 id="clear-profile-title">Clear your saved study data</h2>
                  <p>
                    This removes your province, income range, interests, selected subjects and marks
                    from your account. It does not delete your account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearStudyProfile}
                  disabled={clearing || saveStatus === 'saving'}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  {clearing ? 'Clearing…' : 'Remove my study data'}
                </button>
                {clearError && <p className="study-profile-error" role="alert">{clearError}</p>}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
