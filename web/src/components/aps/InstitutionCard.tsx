import {
  calculateForInstitution,
  type ApsInstitution,
  type SubjectEntry,
} from '@beyond-tomorrow/engine';
import type { Qualification } from '../../data/qualifications';

interface Props {
  inst: ApsInstitution;
  entries: SubjectEntry[];
  qualifying: Qualification[];
  hasQualificationData: boolean;
}

export function InstitutionCard({ inst, entries, qualifying, hasQualificationData }: Props) {
  const result = calculateForInstitution(inst, entries);
  const displayScore = inst.scheme.type === 'stellies' || inst.scheme.type === 'rhodes'
    ? result.total.toFixed(1)
    : result.total;

  return (
    <section className="aps-card" aria-labelledby={`aps-institution-${inst.id}`}>
      <div className="aps-card-summary">
        <h3 id={`aps-institution-${inst.id}`}>{inst.name}</h3>
        <p className="aps-score">
          {inst.scheme.type === 'stellies'
            ? 'Admission average'
            : inst.scheme.type === 'nmu'
              ? 'Applicant Score'
              : inst.scheme.type === 'uct'
                ? 'Score estimate'
                : 'APS estimate'}:{' '}
              <strong className="aps-score-n">{displayScore}</strong> / {result.maximum}
        </p>
      </div>

      <div className="aps-card-content">
        <h4>Matching qualifications</h4>
        {qualifying.length > 0 ? (
          <ul className="aps-qualification-list">
            {qualifying.map((qualification) => (
              <li key={qualification.id}>
                {qualification.name}
                {qualification.durationYears !== undefined &&
                  ` · ${qualification.durationYears} ${qualification.durationYears === 1 ? 'year' : 'years'}`}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted" role="status">
            {hasQualificationData
              ? 'No listed qualifications currently meet the entered minimum requirements.'
              : 'Qualification requirements are not available here yet.'}
          </p>
        )}
      </div>
    </section>
  );
}
