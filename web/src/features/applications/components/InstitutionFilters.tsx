import type { ChangeEvent, FormEvent, RefObject } from 'react';
import {
  CalendarCheck,
  Globe,
  GraduationCap,
  MapPin,
  Search,
} from 'lucide-react';
import {
  INSTITUTION_TYPES,
  PROVINCES,
  isInstitutionType,
  isProvince,
  type ApplicationStatusFilter,
  type DeliveryModeFilter,
  type InstitutionType,
  type Province,
} from '../types';

interface InstitutionFiltersProps {
  search: string;
  province: Province | '';
  type: InstitutionType | '';
  status: ApplicationStatusFilter;
  mode: DeliveryModeFilter;
  searchInputRef: RefObject<HTMLInputElement>;
  onSearchChange: (value: string) => void;
  onProvinceChange: (value: Province | '') => void;
  onTypeChange: (value: InstitutionType | '') => void;
  onStatusChange: (value: ApplicationStatusFilter) => void;
  onModeChange: (value: DeliveryModeFilter) => void;
}

export function InstitutionFilters({
  search,
  province,
  type,
  status,
  mode,
  searchInputRef,
  onSearchChange,
  onProvinceChange,
  onTypeChange,
  onStatusChange,
  onModeChange,
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
          <div className="bt-control-wrap">
            <Search className="bt-field-icon" size={18} />
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
        </div>

        <div>
          <label className="bt-label" htmlFor="province">
            Province
          </label>
          <div className="bt-control-wrap">
            <MapPin className="bt-field-icon" size={18} />
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
        </div>

        <div>
          <label className="bt-label" htmlFor="type">
            Institution type
          </label>
          <div className="bt-control-wrap">
            <GraduationCap className="bt-field-icon" size={18} />
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

        <div>
          <label className="bt-label" htmlFor="status">
            Application status
          </label>
          <div className="bt-control-wrap">
            <CalendarCheck className="bt-field-icon" size={18} />
            <select
              className="bt-control"
              id="status"
              value={status}
              onChange={(e) => onStatusChange(e.target.value as ApplicationStatusFilter)}
            >
              <option value="all">All statuses</option>
              <option value="open">Still open / Open now</option>
              <option value="closing_soon">Closing soon (≤ 30 days)</option>
              <option value="opening_soon">Opening soon</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="bt-label" htmlFor="mode">
            Delivery mode
          </label>
          <div className="bt-control-wrap">
            <Globe className="bt-field-icon" size={18} />
            <select
              className="bt-control"
              id="mode"
              value={mode}
              onChange={(e) => onModeChange(e.target.value as DeliveryModeFilter)}
            >
              <option value="all">All delivery modes</option>
              <option value="campus">On-campus only</option>
              <option value="distance">Distance learning (e.g. Unisa)</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
}