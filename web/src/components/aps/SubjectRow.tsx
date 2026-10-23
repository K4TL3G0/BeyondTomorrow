import type { SubjectRowState } from '../../lib/useApsCalculator';

interface Props {
  row: SubjectRowState;
  invalid: boolean;
  autoFocus: boolean;
  datalistId: string;
  onName: (id: number, name: string) => void;
  onMark: (id: number, mark: string) => void;
  onCounted: (id: number, counted: boolean) => void;
  onRemove: (id: number) => void;
}

export function SubjectRow({ row, invalid, autoFocus, datalistId, onName, onMark, onCounted, onRemove }: Props) {
  return (
    <div className="aps-row">
      <input
        type="text"
        placeholder="Subject"
        list={datalistId}
        value={row.name}
        autoFocus={autoFocus}
        aria-label="Subject name"
        onChange={(e) => onName(row.id, e.target.value)}
      />
      <input
        type="number"
        min={0}
        max={100}
        step={1}
        inputMode="numeric"
        placeholder="%"
        value={row.mark}
        aria-label="Mark percentage"
        aria-invalid={invalid || undefined}
        onChange={(e) => onMark(row.id, e.target.value)}
      />
      <label className="aps-count">
        <input type="checkbox" checked={row.counted} onChange={(e) => onCounted(row.id, e.target.checked)} />
        Count
      </label>
      <button type="button" className="aps-remove" aria-label="Remove subject" onClick={() => onRemove(row.id)}>
        ✕
      </button>
    </div>
  );
}
