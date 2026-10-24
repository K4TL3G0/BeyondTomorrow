import { ChartNoAxesColumnIncreasing } from 'lucide-react';
import { Hero } from '../components/Hero';
import { ApsExplainer } from '../components/aps/ApsExplainer';
import { ResultsTable } from '../components/aps/ResultsTable';
import { SubjectRow } from '../components/aps/SubjectRow';
import { InfoTooltip } from '../components/InfoTooltip';
import { SUBJECT_SUGGESTIONS } from '../lib/subjects';
import { useApsCalculator } from '../lib/useApsCalculator';
import '../styles/aps.css';

const DATALIST_ID = 'aps-subjects';

export default function ApsCalculator() {
  const calc = useApsCalculator();
  const { countedSubjects } = calc.result;

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
            {SUBJECT_SUGGESTIONS.map((subject) => (
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
                onName={calc.setName}
                onMark={calc.setMark}
                onCounted={calc.setCounted}
                onRemove={calc.removeRow}
              />
            ))}
          </div>

          {calc.invalidIds.size > 0 && (
            <p className="aps-err" role="alert">
              Marks must be whole numbers between 0 and 100.
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
              content="Most South African tertiary institutions calculate your APS using your best 6 subjects (excluding Life Orientation). Each percentage score maps to a 1–7 achievement level."
            />
          </div>
          <ResultsTable breakdown={calc.result.breakdown} />
        </section>
      </div>
    </div>
  );
}
