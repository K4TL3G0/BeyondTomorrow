import { ChartNoAxesColumnIncreasing } from 'lucide-react';
import { useState } from 'react';
import type { SubjectEntry } from '@beyond-tomorrow/engine';
import { Hero } from '../components/Hero';
import { ApsExplainer } from '../components/aps/ApsExplainer';
import { InstitutionPicker } from '../components/aps/InstitutionPicker';
import { InstitutionResults } from '../components/aps/InstitutionResults';
import { ResultsTable } from '../components/aps/ResultsTable';
import { SubjectRow } from '../components/aps/SubjectRow';
import { InfoTooltip } from '../components/InfoTooltip';
import {
  FIRST_ADDITIONAL_LANGUAGE_OPTIONS,
  HOME_LANGUAGE_OPTIONS,
  SUBJECT_SUGGESTIONS,
  hasDuplicateSecondAdditionalLanguage,
} from '../lib/subjects';
import { useApsCalculator } from '../lib/useApsCalculator';
import '../styles/aps.css';

const DATALIST_ID = 'aps-subjects';

export default function ApsCalculator() {
  const calc = useApsCalculator();
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
        description="Calculate your Admission Point Score (APS) for South African universities. Enter your subjects and marks below to see your total score and qualification eligibility."
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

          <div className="aps-rows">
            {calc.rows.map((row) => (
              <SubjectRow
                key={row.id}
                row={row}
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
                onName={calc.setName}
                onMark={calc.setMark}
                onCounted={calc.setCounted}
                onRemove={calc.removeRow}
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

          <div className="aps-actions">
            <button type="button" onClick={calc.addRow}>
              + Add subject
            </button>
            <button type="button" className="aps-clear-button" onClick={calc.reset}>
              Clear all
            </button>
          </div>

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
            <p className="muted">
              Results are estimates for guidance only, not admission decisions. Requirements can change and may include
              additional criteria; confirm current entry requirements with each institution.
            </p>
            <InstitutionPicker selected={selectedInstitutions} onToggle={toggleInstitution} />
            <InstitutionResults entries={institutionEntries} selected={selectedInstitutions} />
          </section>
        </section>
      </div>
    </div>
  );
}
