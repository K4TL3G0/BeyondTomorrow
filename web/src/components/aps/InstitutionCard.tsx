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

export function InstitutionCard({
  inst,
  entries,
  qualifying,
  hasQualificationData,
}: Props) {
  const result = calculateForInstitution(inst, entries);
  const displayScore = result && inst.scheme.type === 'rhodes'
    ? result.total.toFixed(1)
    : result?.total;

  return (
    <section className="aps-card" aria-labelledby={`aps-institution-${inst.id}`}>
      <div className="aps-card-summary">
        <h3 id={`aps-institution-${inst.id}`}>{inst.name}</h3>
        {result ? (
          <p className="aps-score">
            {inst.scheme.type === 'nmu'
              ? 'Applicant Score'
              : inst.scheme.type === 'uct'
                ? 'Score estimate'
                : 'APS estimate'}:{' '}
            <strong className="aps-score-n">{displayScore}</strong> / {result.maximum}
          </p>
        ) : (
          <p className="aps-score aps-marks-method">
            APS calculation: <strong>Not applicable.</strong> Admission is based on programme-specific subject
            marks. Some programmes require NBT results, which are not assessed here.
          </p>
        )}
      </div>

      <div className="aps-card-content">
        {qualifying.length > 0 ? (
          <>
            <h4>Matching qualifications ({qualifying.length})</h4>
            <ul className="aps-qualification-list aps-card-qualification-list">
              {qualifying.map((qualification) => (
                <li key={qualification.id}>
                  <strong>{qualification.name}</strong>
                  {qualification.durationRange ? (
                    <p className="aps-qualification-note">
                      {qualification.durationRange.minYears}–{qualification.durationRange.maxYears} years
                    </p>
                  ) : qualification.durationYears !== undefined ? (
                    <p className="aps-qualification-note">
                      {qualification.durationYears} {qualification.durationYears === 1 ? 'year' : 'years'}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
            <p className="aps-qualification-note">
              <a href={inst.source} target="_blank" rel="noopener noreferrer">
                Check {inst.name} official source
              </a>
            </p>
          </>
        ) : (
          <p className="muted" role="status">
            {hasQualificationData
              ? 'No listed qualifications currently meet the entered marks and subject requirements.'
              : 'Qualification requirements are not available here yet.'}
          </p>
        )}
      </div>
    </section>
  );
}
