import { useCallback, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { Institution, InstitutionType, Province } from '../types';

export interface InstitutionFilters {
  search: string;
  province: Province | '';
  type: InstitutionType | '';
  setSearch: (value: string) => void;
  setProvince: (value: Province | '') => void;
  setType: (value: InstitutionType | '') => void;
  /** Attach to the search input so reset() can return focus to it. */
  searchInputRef: RefObject<HTMLInputElement>;
  filtered: readonly Institution[];
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

export function useInstitutionFilters(
  institutions: readonly Institution[],
): InstitutionFilters {
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState<Province | ''>('');
  const [type, setType] = useState<InstitutionType | ''>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const haystacks = useMemo(
    () => institutions.map(buildHaystack),
    [institutions],
  );

  const filtered = useMemo(() => {
    const terms = search
      .trim()
      .toLocaleLowerCase(LOCALE)
      .split(/\s+/)
      .filter(Boolean);

    return institutions.filter((item, index) => {
      const haystack = haystacks[index] ?? '';
      return (
        terms.every((term) => haystack.includes(term)) &&
        (!province || item.provinces.includes(province)) &&
        (!type || item.type === type)
      );
    });
  }, [institutions, haystacks, search, province, type]);

  const reset = useCallback(() => {
    setSearch('');
    setProvince('');
    setType('');
    searchInputRef.current?.focus();
  }, []);

  return {
    search,
    province,
    type,
    setSearch,
    setProvince,
    setType,
    searchInputRef,
    filtered,
    reset,
  };
}