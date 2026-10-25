import { useState, useMemo } from 'react';
import { INSTITUTIONS } from '@beyond-tomorrow/engine';
import { Search, X } from 'lucide-react';

interface Props {
  selected: ReadonlySet<string>;
  onToggle: (id: string, checked: boolean) => void;
}

export function InstitutionPicker({ selected, onToggle }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const normalized = searchTerm.trim().toLocaleLowerCase();

  const filteredInstitutions = useMemo(() => {
    if (!normalized) return INSTITUTIONS;
    return INSTITUTIONS.filter((inst) =>
      inst.name.toLocaleLowerCase().includes(normalized) ||
      inst.id.toLocaleLowerCase().includes(normalized),
    );
  }, [normalized]);

  return (
    <div className="aps-picker-container">
      <div className="aps-picker-search">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          className="aps-picker-input"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search institutions (e.g. UCT, Wits, UJ)…"
          aria-label="Search institutions"
        />
        {searchTerm && (
          <button
            type="button"
            className="aps-picker-clear-btn"
            onClick={() => setSearchTerm('')}
            aria-label="Clear institution search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="aps-picker">
        {filteredInstitutions.map((inst) => (
          <label key={inst.id} className="aps-inst-opt">
            <input
              type="checkbox"
              value={inst.id}
              checked={selected.has(inst.id)}
              onChange={(event) => onToggle(inst.id, event.target.checked)}
            />
            <span>{inst.name}</span>
          </label>
        ))}
      </div>

      {filteredInstitutions.length === 0 && (
        <p className="muted" role="status" style={{ fontStyle: 'italic', margin: '0.5rem 0' }}>
          No institutions match “{searchTerm}”.
        </p>
      )}
    </div>
  );
}
