import {
  calculateForInstitution,
  type ApsInstitution,
  type SubjectEntry,
} from '@beyond-tomorrow/engine';
import type { Qualification } from '../../data/qualifications';
import { QUALIFICATION_COVERAGE } from '../../data/qualifications';
import { calculateNsCAggregate } from '../../lib/qualificationMatches';

interface Props {
  inst: ApsInstitution;
  entries: SubjectEntry[];
  qualifying: Qualification[];
}

export function InstitutionCard({ inst, entries, qualifying }: Props) {
  const result = calculateForInstitution(inst, entries);
  const aggregate = calculateNsCAggregate(entries);
  const coverageNote = QUALIFICATION_COVERAGE[inst.id];
  const aggregateBased = qualifying.some((qualification) => qualification.minimumAggregate !== undefined);

  return (
    <details className="aps-card">
      <summary>
        <h3>{inst.name}</h3>
        {aggregateBased ? (
          <p className="aps-score">
            NSC aggregate estimate: <strong className="aps-score-n">{aggregate?.toFixed(1)}%</strong>
          </p>
        ) : (
          <p className="aps-score">
            {inst.scheme.type === 'uct' ? 'Score estimate' : 'APS estimate'}:{' '}
            <strong className="aps-score-n">{result.total}</strong> / {result.maximum}
          </p>
        )}
        <span className="aps-card-hint">Select to view matching qualifications</span>
      </summary>

      <div className="aps-card-content">
        <h4>{aggregateBased ? 'General APS estimate (not used for matching)' : 'Score breakdown'}</h4>
        <ul className="aps-breakdown">
          {result.breakdown.map((row, index) => (
            <li key={`${row.name}-${index}`}>
              {row.name}: {row.aps} {inst.scheme.type === 'uct' ? 'points' : 'APS'}
              {!row.counted && ` (${row.reason})`}
            </li>
          ))}
        </ul>

        <h4>Matching qualifications</h4>
        <ul className="aps-qualification-list">
          {qualifying.map((qualification) => {
            const subjectRequirements = qualification.sourceRequirements
              ? Object.values(qualification.sourceRequirements).filter(Boolean).join('; ')
              : qualification.requirements.map((requirement) => requirement.label).join('; ');
            return (
              <li key={qualification.id}>
                <strong>{qualification.name}</strong>
                {qualification.intakeYear && <span> ({qualification.intakeYear})</span>}
                <p>
                  {qualification.minimumScore !== undefined && <>Minimum APS: {qualification.minimumScore}. </>}
                  {qualification.minimumAggregate !== undefined && (
                    <>Minimum NSC aggregate: {qualification.minimumAggregate}%. </>
                  )}
                  {subjectRequirements && <>Subject requirements: {subjectRequirements}.</>}
                </p>
                {qualification.selectionNote && <p className="aps-note">{qualification.selectionNote}</p>}
                {qualification.sourceReference && <p className="aps-note">Source: {qualification.sourceReference}.</p>}
                <p className="aps-note">Requirements checked {qualification.checked}.</p>
                <a href={qualification.source} target="_blank" rel="noreferrer">View institution requirements</a>
              </li>
            );
          })}
        </ul>

        {coverageNote && <p className="aps-note">{coverageNote}</p>}
        {inst.notes.length > 0 && (
          <ul>{inst.notes.map((note) => <li key={note}>{note}</li>)}</ul>
        )}
        {inst.caveat && <p className="aps-note aps-caveat">{inst.caveat}</p>}
        <p className="aps-note">
          Institution scoring rules last checked {inst.checked}. Minimum requirements do not guarantee admission.
        </p>
        <a href={inst.source} target="_blank" rel="noreferrer">Check institution source</a>
      </div>
    </details>
  );
}
