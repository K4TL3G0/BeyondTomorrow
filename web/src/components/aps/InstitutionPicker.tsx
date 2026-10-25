import { useState } from 'react';
import { APS_INSTITUTIONS } from '../../lib/apsInstitutions';

interface Props {
  selected: ReadonlySet<string>;
  onToggle: (id: string, checked: boolean) => void;
}

export function InstitutionPicker({ selected, onToggle }: Props) {
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredInstitutions = APS_INSTITUTIONS.filter((inst) =>
    inst.name.toLocaleLowerCase().includes(normalizedSearch));

  return (
    <>
      <div className="aps-picker-search">
        <label htmlFor="aps-institution-search">Search institutions</label>
        <input
          id="aps-institution-search"
          type="search"
          placeholder="Type an institution name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="aps-picker">
        {filteredInstitutions.length > 0 ? (
          filteredInstitutions.map((inst) => (
            <label key={inst.id} className="aps-inst-opt">
              <input
                type="checkbox"
                value={inst.id}
                checked={selected.has(inst.id)}
                onChange={(event) => onToggle(inst.id, event.target.checked)}
              />
              {inst.name}
            </label>
          ))
        ) : (
          <p className="muted" role="status">No institutions match “{search}”.</p>
        )}
      </div>
    </>
  );
}
