import {
  calculateForInstitution,
  type ApsInstitution,
  type SubjectEntry,
} from '@beyond-tomorrow/engine';

interface Props {
  inst: ApsInstitution;
  entries: SubjectEntry[];
}

export function InstitutionCard({ inst, entries }: Props) {
  const result = calculateForInstitution(inst, entries);

  return (
    <article className="aps-card">
      <h3>{inst.name}</h3>
      <p className="aps-score">
        {inst.scheme.type === 'uct' ? 'Score estimate' : 'APS estimate'}:{' '}
        <strong className="aps-score-n">{result.total}</strong> / {result.maximum}
      </p>
      <ul className="aps-breakdown">
        {result.breakdown.map((row, index) => (
          <li key={`${row.name}-${index}`}>
            {row.name}: {row.aps} {inst.scheme.type === 'uct' ? 'points' : 'APS'}
            {!row.counted && ` (${row.reason})`}
          </li>
        ))}
      </ul>
      {inst.notes.length > 0 && (
        <ul>
          {inst.notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      )}
      {inst.caveat && <p className="aps-note aps-caveat">{inst.caveat}</p>}
      <p className="aps-note">
        Rules last checked {inst.checked}. Confirm your programme&apos;s requirements with the institution.
      </p>
      <a href={inst.source} target="_blank" rel="noreferrer">
        Check institution source
      </a>
    </article>
  );
}
