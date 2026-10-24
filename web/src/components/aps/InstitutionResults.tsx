import { calculateForInstitution, INSTITUTIONS, type SubjectEntry } from '@beyond-tomorrow/engine';
import { QUALIFICATIONS } from '../../data/qualifications';
import { calculateNsCAggregate, qualifyingQualifications } from '../../lib/qualificationMatches';
import { InstitutionCard } from './InstitutionCard';

interface Props {
  entries: SubjectEntry[];
}

export function InstitutionResults({ entries }: Props) {
  const aggregate = calculateNsCAggregate(entries);
  const matches = INSTITUTIONS.flatMap((inst) => {
    const score = calculateForInstitution(inst, entries).total;
    const qualifications = qualifyingQualifications(
      QUALIFICATIONS,
      inst.id,
      entries,
      score,
      aggregate,
    );
    return qualifications.length > 0 ? [{ inst, qualifications }] : [];
  });

  if (matches.length === 0) {
    return (
      <p className="muted" role="status">
        {entries.length === 0
          ? 'Enter at least six subject marks to check APS and aggregate-based qualifications.'
          : 'No listed qualifications currently match all entered subject marks and score thresholds.'}
      </p>
    );
  }

  return (
    <div className="aps-results">
      {matches.map(({ inst, qualifications }) => (
        <InstitutionCard
          key={inst.id}
          inst={inst}
          entries={entries}
          qualifying={qualifications}
        />
      ))}
    </div>
  );
}
