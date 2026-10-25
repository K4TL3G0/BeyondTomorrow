import { BookmarkCheck, ChartNoAxesColumnIncreasing, LogIn, Plus, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SubjectEntry } from '@beyond-tomorrow/engine';
import { Hero } from '../components/Hero';
import { ApsExplainer } from '../components/aps/ApsExplainer';
import { InstitutionPicker } from '../components/aps/InstitutionPicker';
import { InstitutionResults } from '../components/aps/InstitutionResults';
import { ResultsTable } from '../components/aps/ResultsTable';
import { SubjectRow } from '../components/aps/SubjectRow';
import { InfoTooltip } from '../components/InfoTooltip';
import { useAuth } from '../lib/auth';
import {
  FIRST_ADDITIONAL_LANGUAGE_OPTIONS,
  HOME_LANGUAGE_OPTIONS,
  SUBJECT_SUGGESTIONS,
  hasDuplicateSecondAdditionalLanguage,
} from '../lib/subjects';
import { supabase } from '../lib/supabase';
import { useApsCalculator } from '../lib/useApsCalculator';
import '../styles/aps.css';

const DATALIST_ID = 'aps-subjects';

type SavedSubjectRecord = {
  mark: number | null;
  counted: boolean;
  subjects: { code: string; name: string } | null;
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

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

export default function ApsCalculator() {
  const calc = useApsCalculator();
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user.id;
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedSubjectCount, setSavedSubjectCount] = useState(0);
  const [selectedInstitutions, setSelectedInstitutions] = useState<Set<string>>(() => new Set());
  const { countedSubjects } = calc.result;
  const homeLanguage = calc.rows.find((row) => row.type === 'home-language')?.name ?? '';
  const firstAdditionalLanguage = calc.rows.find((row) => row.type === 'first-additional')?.name ?? '';
  const englishHomeLanguage = homeLanguage === 'English Home Language';
  const availableFirstAdditionalLanguages = englishHomeLanguage
    ? FIRST_ADDITIONAL_LANGUAGE_OPTIONS.filter((language) => language !== 'English First Additional Language')
    : ['English First Additional Language'];
  const availableSubjectSuggestions = SUBJECT_SUGGESTIONS.filter((subject) =>
    !hasDuplicateSecondAdditionalLanguage(subject, homeLanguage, firstAdditionalLanguage));
  const institutionEntries: SubjectEntry[] = calc.result.breakdown.map(({ name, percent, counted }) => ({
    name,
    percent,
    counted,
  }));

  useEffect(() => {
    if (!userId) {
      setLoadingSaved(false);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    setLoadingSaved(true);
    setLoadError(null);
    setSavedSubjectCount(0);
    void (async () => {
      try {
        const { data, error } = await supabase
          .from('student_marks')
          .select('mark, counted, subjects(code, name)')
          .eq('student_id', userId)
          .returns<SavedSubjectRecord[]>();
        if (cancelled) return;
        if (error) {
          setLoadError(`Your saved subjects could not be loaded: ${error.message}`);
          return;
        }

        const savedRows = (data ?? []).flatMap((record) =>
          record.subjects
            ? [{ name: record.subjects.name, mark: record.mark, counted: record.counted }]
            :             [],
        );
        if (calc.loadSavedRows(savedRows)) setSavedSubjectCount(savedRows.length);
      } catch (error) {
        if (!cancelled) setLoadError(`Your saved subjects could not be loaded: ${errorMessage(error)}`);
      } finally {
        if (!cancelled) setLoadingSaved(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [calc.loadSavedRows, reloadKey, userId]);

  async function saveSubjects() {
    if (!userId) {
      setSaveStatus('error');
      setSaveError('Sign in to save your subjects and marks.');
      return;
    }
    if (loadingSaved || loadError) return;
    if (calc.invalidIds.size > 0) {
      setSaveStatus('error');
      setSaveError('Fix invalid marks and duplicate subjects before saving.');
      return;
    }

    const namedRows = calc.rows.filter((row) =>
      row.name.trim() && (row.type !== 'life-orientation' || row.mark.trim() || row.counted),
    );
    if (savedSubjectCount > 0 && namedRows.length === 0 &&
      !window.confirm('This will remove all saved subjects and marks from your profile. Continue?')) {
      return;
    }

    setSaveStatus('saving');
    setSaveError(null);
    try {
      const { data: catalog, error: catalogError } = await supabase
        .from('subjects')
        .select('code, name');
      if (catalogError) throw catalogError;

      const codeByName = new Map(
        (catalog ?? []).map((subject) => [subject.name.trim().toLocaleLowerCase(), subject.code]),
      );
      const marks = namedRows.map((row) => {
        const code = codeByName.get(row.name.trim().toLocaleLowerCase());
        if (!code) {
          throw new Error(`“${row.name.trim()}” is not in the subject catalog. Choose a listed subject.`);
        }
        return {
          code,
          mark: row.mark.trim() ? Number(row.mark) : null,
          counted: row.counted,
        };
      });

      const { error } = await supabase.rpc('save_student_marks', { p_marks: marks });
      if (error) throw error;
      setSavedSubjectCount(marks.length);
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
      setSaveError(`Your subjects and marks were not saved: ${errorMessage(error)}`);
    }
  }

  function updateCalculator(update: () => void) {
    update();
    setSaveStatus('idle');
    setSaveError(null);
  }

  function toggleInstitution(id: string, checked: boolean) {
    setSelectedInstitutions((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <div className="page-wrapper">
      <Hero
        eyebrow="Calculate Your APS Score"
        title={
          <h1>
            Admission Point <span>Calculator.</span>
          </h1>
        }
        description="Calculate your Admission Point Score (APS) for South African universities and TVET colleges. Enter your subjects and marks below to see your total score and qualification eligibility."
        feature={{
          symbol: <ChartNoAxesColumnIncreasing size={28} strokeWidth={1.8} />,
          title: 'Know Your Score.',
          description: 'Your APS score unlocks the degree and diploma options available to you across South Africa.',
        }}
      />

      <div className="page-content">
        <section className="aps">
          <ApsExplainer />

          <datalist id={DATALIST_ID}>
            {availableSubjectSuggestions.map((subject) => (
              <option key={subject} value={subject} />
            ))}
          </datalist>

          {loadingSaved && (
            <p className="aps-save-status" role="status">Loading your saved subjects…</p>
          )}
          {loadError && (
            <div className="aps-save-status aps-save-error" role="alert">
              <p>{loadError}</p>
              <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
                Try again
              </button>
            </div>
          )}

          <div className="aps-rows">
            {calc.rows.map((row) => (
              <SubjectRow
                key={row.id}
                row={row}
                disabled={authLoading || loadingSaved}
                invalid={calc.invalidIds.has(row.id)}
                autoFocus={row.id === calc.focusId}
                datalistId={DATALIST_ID}
                nameOptions={row.type === 'life-orientation'
                  ? ['Life Orientation']
                  : row.type === 'home-language'
                    ? HOME_LANGUAGE_OPTIONS
                    : row.type === 'first-additional'
                      ? availableFirstAdditionalLanguages
                      : undefined}
                nameDisabled={row.type === 'life-orientation' || (
                  row.type === 'first-additional' && !englishHomeLanguage
                )}
                onName={(id, name) => updateCalculator(() => calc.setName(id, name))}
                onMark={(id, mark) => updateCalculator(() => calc.setMark(id, mark))}
                onCounted={(id, counted) => updateCalculator(() => calc.setCounted(id, counted))}
                onRemove={(id) => updateCalculator(() => calc.removeRow(id))}
              />
            ))}
          </div>

          {calc.invalidMarkIds.size > 0 && (
            <p className="aps-err" role="alert">Marks must be whole numbers between 0 and 100.</p>
          )}
          {calc.duplicateLanguageIds.size > 0 && (
            <p className="aps-err" role="alert">
              A second additional language must be different from your home and first additional languages. English
              cannot be a second additional language.
            </p>
          )}
          {calc.duplicateSubjectIds.size > 0 && (
            <p className="aps-err" role="alert">Each subject can only be entered once.</p>
          )}

          <div className="aps-actions-container">
            <button
              type="button"
              className="aps-add-subject-btn"
              disabled={authLoading || loadingSaved}
              onClick={() => updateCalculator(calc.addRow)}
              aria-label="Add subject"
            >
              <span className="aps-add-icon-circle" aria-hidden="true">
                <Plus size={18} strokeWidth={2.5} />
              </span>
              <span>Add subject</span>
            </button>

            <div className="aps-secondary-actions">
              <button
                type="button"
                disabled={authLoading || loadingSaved}
                className="aps-clear-button"
                onClick={() => updateCalculator(calc.reset)}
              >
                <RotateCcw size={16} />
                <span>Clear all</span>
              </button>
              {userId ? (
                <button
                  type="button"
                  className="aps-save-button"
                  onClick={() => void saveSubjects()}
                  disabled={authLoading || loadingSaved || Boolean(loadError) || saveStatus === 'saving'}
                >
                  <BookmarkCheck size={16} />
                  <span>{saveStatus === 'saving' ? 'Saving…' : 'Save subjects and marks'}</span>
                </button>
              ) : (
                <Link className="aps-save-login" to="/login">
                  <LogIn size={16} />
                  <span>Sign in to save</span>
                </Link>
              )}
            </div>
          </div>
          <p className="aps-save-status" aria-live="polite">
            {saveStatus === 'saved' && 'Subjects and marks saved to your profile. APS totals are recalculated from these marks.'}
            {saveStatus === 'error' && saveError}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h2>
              {calc.result.total}{' '}
              <small>
                APS points from {countedSubjects} subject{countedSubjects === 1 ? '' : 's'}
              </small>
            </h2>
            <InfoTooltip
              title="How APS is calculated"
              content="This general estimate adds every subject marked Count. Each percentage maps to a 1–7 achievement level. Institution estimates below use each institution's own rules."
            />
          </div>
          <ResultsTable breakdown={calc.result.breakdown} />

          <section className="aps-compare" aria-labelledby="aps-compare-title">
            <h2 id="aps-compare-title">Compare institutions</h2>
            <p className="muted">
              Select the institutions you want to compare. We’ll show the qualifications where your marks meet the
              listed minimum requirements. Selection, audition, interview, NBT and portfolio requirements may also apply.
            </p>
            <InstitutionPicker selected={selectedInstitutions} onToggle={toggleInstitution} />
            <InstitutionResults entries={institutionEntries} selected={selectedInstitutions} />
          </section>
        </section>
      </div>
    </div>
  );
}
