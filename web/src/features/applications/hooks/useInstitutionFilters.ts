import { useCallback, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type {
  ApplicationStatusFilter,
  DeliveryModeFilter,
  Institution,
  InstitutionType,
  Province,
} from '../types';

export interface InstitutionFilters {
  search: string;
  province: Province | '';
  type: InstitutionType | '';
  status: ApplicationStatusFilter;
  mode: DeliveryModeFilter;
  setSearch: (value: string) => void;
  setProvince: (value: Province | '') => void;
  setType: (value: InstitutionType | '') => void;
  setStatus: (value: ApplicationStatusFilter) => void;
  setMode: (value: DeliveryModeFilter) => void;
  toggleStillOpen: () => void;
  /** Attach to the search input so reset() can return focus to it. */
  searchInputRef: RefObject<HTMLInputElement>;
  filtered: readonly Institution[];
  activeFilterCount: number;
  reset: () => void;
}

const LOCALE = 'en-ZA';

function buildHaystack(item: Institution): string {
  return [
    item.name,
    item.short,
    item.type,
    ...item.provinces,
    item.distanceLearning ? 'distance learning national' : '',
  ]
    .join(' ')
    .toLocaleLowerCase(LOCALE);
}

export function getApplicationStatus(
  openingDateStr: string | null,
  closingDateStr: string | null,
  now = new Date(),
): 'open' | 'closing_soon' | 'opening_soon' | 'closed' | 'unknown' {
  if (!closingDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(closingDateStr)) return 'unknown';

  const closingDate = new Date(`${closingDateStr}T23:59:59+02:00`);
  if (Number.isNaN(closingDate.getTime())) return 'unknown';

  let openingDate: Date | null = null;
  if (openingDateStr && /^\d{4}-\d{2}-\d{2}$/.test(openingDateStr)) {
    const parsed = new Date(`${openingDateStr}T00:00:00+02:00`);
    if (!Number.isNaN(parsed.getTime())) openingDate = parsed;
  }

  const msLeft = closingDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  if (openingDate && now.getTime() < openingDate.getTime()) {
    return 'opening_soon';
  }

  if (daysLeft < 0) {
    return 'closed';
  }

  if (daysLeft <= 30) {
    return 'closing_soon';
  }

  return 'open';
}

export function useInstitutionFilters(
  institutions: readonly Institution[],
): InstitutionFilters {
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState<Province | ''>('');
  const [type, setType] = useState<InstitutionType | ''>('');
  const [status, setStatus] = useState<ApplicationStatusFilter>('all');
  const [mode, setMode] = useState<DeliveryModeFilter>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const haystacks = useMemo(
    () => institutions.map(buildHaystack),
    [institutions],
  );

  const activeFilterCount =
    (search.trim() ? 1 : 0) +
    (province ? 1 : 0) +
    (type ? 1 : 0) +
    (status !== 'all' ? 1 : 0) +
    (mode !== 'all' ? 1 : 0);

  const filtered = useMemo(() => {
    const terms = search
      .trim()
      .toLocaleLowerCase(LOCALE)
      .split(/\s+/)
      .filter(Boolean);

    const now = new Date();

    return institutions.filter((item, index) => {
      const haystack = haystacks[index] ?? '';
      const textMatches = terms.every((term) => haystack.includes(term));
      if (!textMatches) return false;

      if (province && !item.provinces.includes(province)) return false;
      if (type && item.type !== type) return false;

      if (status !== 'all') {
        const itemStatus = getApplicationStatus(item.openingDate, item.closingDate, now);
        if (status === 'open' && itemStatus !== 'open' && itemStatus !== 'closing_soon') return false;
        if (status === 'closing_soon' && itemStatus !== 'closing_soon') return false;
        if (status === 'opening_soon' && itemStatus !== 'opening_soon') return false;
        if (status === 'closed' && itemStatus !== 'closed') return false;
      }

      if (mode !== 'all') {
        if (mode === 'distance' && !item.distanceLearning) return false;
        if (mode === 'campus' && item.distanceLearning) return false;
      }

      return true;
    });
  }, [institutions, haystacks, search, province, type, status, mode]);

  const toggleStillOpen = useCallback(() => {
    setStatus((current) => (current === 'open' ? 'all' : 'open'));
  }, []);

  const reset = useCallback(() => {
    setSearch('');
    setProvince('');
    setType('');
    setStatus('all');
    setMode('all');
    searchInputRef.current?.focus();
  }, []);

  return {
    search,
    province,
    type,
    status,
    mode,
    setSearch,
    setProvince,
    setType,
    setStatus,
    setMode,
    toggleStillOpen,
    searchInputRef,
    filtered,
    activeFilterCount,
    reset,
  };
}