import type { ChangeEvent, FormEvent, RefObject } from 'react';
import {
  INSTITUTION_TYPES,
  PROVINCES,
  isInstitutionType,
  isProvince,
} from '../types';
import type { InstitutionType, Province } from '../types';

interface InstitutionFiltersProps {
  search: string;
  province: Province | '';
  type: InstitutionType | '';
  searchInputRef: RefObject<HTMLInputElement>;
  onSearchChange: (value: string) => void;
  onProvinceChange: (value: Province | '') => void;
  onTypeChange: (value: InstitutionType | '') => void;
}

export function InstitutionFilters({
  search,
  province,
  type,
  searchInputRef,
  onSearchChange,
  onProvinceChange,
  onTypeChange,
}: InstitutionFiltersProps) {
  const handleProvince = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onProvinceChange(isProvince(value) ? value : '');
  };

  const handleType = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onTypeChange(isInstitutionType(value) ? value : '');
  };

  return (
    <form
      id="filters"
      className="bt-filter-panel"
      role="search"
      aria-label="Find institutions"
      onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}
    >
      <div className="bt-filters">
        <div className="bt-search-field">
          <label className="bt-label" htmlFor="search">
            Search institutions
          </label>
          <input
            ref={searchInputRef}
            className="bt-control"
            id="search"
            type="search"
            placeholder="Try UJ, Cape Town or TVET…"
            autoComplete="off"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div>
          <label className="bt-label" htmlFor="province">
            Province
          </label>
          <select
            className="bt-control"
            id="province"
            value={province}
            onChange={handleProvince}
          >
            <option value="">All provinces</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="bt-label" htmlFor="type">
            Institution type
          </label>
          <select
            className="bt-control"
            id="type"
            value={type}
            onChange={handleType}
          >
            <option value="">All institution types</option>
            {INSTITUTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}