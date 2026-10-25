import { calculateForInstitution, type SubjectEntry } from '@beyond-tomorrow/engine';
import { QUALIFICATIONS } from '../../data/qualifications';
import { APS_INSTITUTIONS } from '../../lib/apsInstitutions';
import { calculateNsCAggregate, qualifyingQualifications } from '../../lib/qualificationMatches';
import { InstitutionCard } from './InstitutionCard';

interface Props {
  entries: SubjectEntry[];
  selected: ReadonlySet<string>;
}

export function InstitutionResults({ entries, selected }: Props) {
  const aggregate = calculateNsCAggregate(entries);
  const selectedInstitutions = APS_INSTITUTIONS.filter((inst) => selected.has(inst.id));

  if (selectedInstitutions.length === 0) {
    return <p className="muted" role="status">Select one or more institutions above to see matching qualifications.</p>;
  }

  const results = selectedInstitutions.map((inst) => {
    const score = calculateForInstitution(inst, entries)?.total ?? null;
    const institutionQualifications = QUALIFICATIONS.filter(
      (qualification) => qualification.institutionId === inst.id,
    );
    const qualifications = qualifyingQualifications(
      QUALIFICATIONS,
      inst.id,
      entries,
      score,
      aggregate,
    );
    return {
      inst,
      qualifications,
      hasQualificationData: institutionQualifications.length > 0,
    };
  });

  return (
    <div className="aps-results">
      {entries.length === 0 && (
        <p className="muted" role="status">
          Enter your subject marks above to check which listed qualifications may meet their minimum requirements.
        </p>
      )}
      {results.map(({ inst, qualifications, hasQualificationData }) => (
        <InstitutionCard
          key={inst.id}
          inst={inst}
          entries={entries}
          qualifying={qualifications}
          hasQualificationData={hasQualificationData}
        />
      ))}
    </div>
  );
}
