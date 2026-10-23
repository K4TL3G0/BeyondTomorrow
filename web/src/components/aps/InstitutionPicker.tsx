import { INSTITUTIONS } from '@beyond-tomorrow/engine';

interface Props {
  selected: ReadonlySet<string>;
  onToggle: (id: string, checked: boolean) => void;
}

export function InstitutionPicker({ selected, onToggle }: Props) {
  return (
    <div className="aps-picker">
      {INSTITUTIONS.map((inst) => (
        <label key={inst.id} className="aps-inst-opt">
          <input
            type="checkbox"
            value={inst.id}
            checked={selected.has(inst.id)}
            onChange={(event) => onToggle(inst.id, event.target.checked)}
          />
          {inst.name}
        </label>
      ))}
    </div>
  );
}
