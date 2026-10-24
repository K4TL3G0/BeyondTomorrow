import { Trash2 } from 'lucide-react';
import type { SubjectRowState } from '../../lib/useApsCalculator';

interface Props {
  row: SubjectRowState;
  invalid: boolean;
  autoFocus: boolean;
  datalistId: string;
  nameOptions?: readonly string[];
  nameDisabled?: boolean;
  onName: (id: number, name: string) => void;
  onMark: (id: number, mark: string) => void;
  onCounted: (id: number, counted: boolean) => void;
  onRemove: (id: number) => void;
}

export function SubjectRow({
  row,
  invalid,
  autoFocus,
  datalistId,
  nameOptions,
  nameDisabled,
  onName,
  onMark,
  onCounted,
  onRemove,
}: Props) {
  return (
    <div className="aps-row">
      {nameOptions ? (
        <select
          value={row.name}
          disabled={nameDisabled}
          aria-label={
            row.type === 'life-orientation'
              ? 'Compulsory subject'
              : row.type === 'home-language'
                ? 'Home language'
                : 'First additional language'
          }
          aria-invalid={invalid || undefined}
          onChange={(event) => onName(row.id, event.target.value)}
        >
          {!row.name && <option value="">Select {row.type === 'home-language' ? 'home' : 'first additional'} language</option>}
          {nameOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input
          type="text"
          placeholder="Subject"
          list={datalistId}
          value={row.name}
          autoFocus={autoFocus}
          aria-label="Subject name"
          aria-invalid={invalid || undefined}
          onChange={(event) => onName(row.id, event.target.value)}
        />
      )}
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
        onChange={(event) => onMark(row.id, event.target.value)}
      />
      <label className="aps-count">
        <input type="checkbox" checked={row.counted} onChange={(event) => onCounted(row.id, event.target.checked)} />
        {row.type === 'life-orientation' ? 'Count LO' : 'Count'}
      </label>
      {row.type === 'subject' ? (
        <button
          type="button"
          className="aps-remove"
          aria-label="Remove subject"
          title="Remove subject"
          onClick={() => onRemove(row.id)}
        >
          <Trash2 size={18} />
        </button>
      ) : <span aria-hidden="true" />}
    </div>
  );
}
