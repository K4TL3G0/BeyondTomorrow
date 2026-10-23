import { useState } from 'react';
import { ApsExplainer } from '../components/aps/ApsExplainer';
import { InstitutionPicker } from '../components/aps/InstitutionPicker';
import { InstitutionResults } from '../components/aps/InstitutionResults';
import { ResultsTable } from '../components/aps/ResultsTable';
import { SubjectRow } from '../components/aps/SubjectRow';
import { SUBJECT_SUGGESTIONS } from '../lib/subjects';
import { useApsCalculator } from '../lib/useApsCalculator';
import '../styles/aps.css';

const DATALIST_ID = 'aps-subjects';

export default function ApsCalculator() {
  const calc = useApsCalculator();
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  function toggleInstitution(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const n = calc.result.countedSubjects;

  return (
    <section className="aps">
      <h1>APS Calculator</h1>

      <ApsExplainer />

      <datalist id={DATALIST_ID}>
        {SUBJECT_SUGGESTIONS.map((s) => (
          <option key={s} value={s} />
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
          Marks must be between 0 and 100.
        </p>
      )}

      <div className="aps-actions">
        <button type="button" onClick={calc.addRow}>
          + Add subject
        </button>
        <button type="button" onClick={calc.reset}>
          Clear all
        </button>
      </div>

      <h2>
        {calc.result.total} <small>APS points from {n} subject{n === 1 ? '' : 's'}</small>
      </h2>
      <ResultsTable breakdown={calc.result.breakdown} />

      <h2>Compare institutions</h2>
      <p>Tick the institutions you want to see your score for.</p>
      <InstitutionPicker selected={selected} onToggle={toggleInstitution} />
      <InstitutionResults selected={selected} entries={calc.entries} />
    </section>
  );
}
