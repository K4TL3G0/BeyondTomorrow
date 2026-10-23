import { INSTITUTIONS, type SubjectEntry } from '@beyond-tomorrow/engine';
import { InstitutionCard } from './InstitutionCard';

interface Props {
  selected: ReadonlySet<string>;
  entries: SubjectEntry[];
}

export function InstitutionResults({ selected, entries }: Props) {
  const institutions = INSTITUTIONS.filter((inst) => selected.has(inst.id));
  if (institutions.length === 0) return null;

  return (
    <div className="aps-results">
      {institutions.map((inst) => (
        <InstitutionCard key={inst.id} inst={inst} entries={entries} />
      ))}
    </div>
  );
}
