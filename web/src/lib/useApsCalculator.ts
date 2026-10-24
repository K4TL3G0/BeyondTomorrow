import { useMemo, useRef, useState } from 'react';
import { pointsForMark } from '@beyond-tomorrow/engine';
import { APS_BANDS, APS_LEVELS } from './apsLevels';
import { hasDuplicateSecondAdditionalLanguage } from './subjects';

export type SubjectRowType = 'life-orientation' | 'home-language' | 'first-additional' | 'subject';

export interface SubjectRowState {
  id: number;
  type: SubjectRowType;
  name: string;
  mark: string;
  counted: boolean;
}

export interface ApsBreakdownRow {
  name: string;
  percent: number;
  aps: number;
  level: number;
  counted: boolean;
  reason?: string;
}

function initialRows(): SubjectRowState[] {
  return [
    { id: 1, type: 'life-orientation', name: 'Life Orientation', mark: '', counted: false },
    { id: 2, type: 'home-language', name: '', mark: '', counted: true },
    { id: 3, type: 'first-additional', name: 'English First Additional Language', mark: '', counted: true },
    ...Array.from({ length: 3 }, (_, index) => ({
      id: index + 4,
      type: 'subject' as const,
      name: '',
      mark: '',
      counted: true,
    })),
  ];
}

function isEnglishHomeLanguage(name: string): boolean {
  return name.trim().toLowerCase() === 'english home language';
}

function duplicateSecondAdditionalIds(rows: SubjectRowState[]): Set<number> {
  const homeLanguage = rows.find((row) => row.type === 'home-language')?.name ?? '';
  const firstAdditionalLanguage = rows.find((row) => row.type === 'first-additional')?.name ?? '';
  return new Set(rows
    .filter((row) => row.type === 'subject')
    .filter((row) => hasDuplicateSecondAdditionalLanguage(row.name, homeLanguage, firstAdditionalLanguage))
    .map((row) => row.id));
}

function rowMarkIsInvalid(row: SubjectRowState): boolean {
  if (row.mark.trim() === '') return false;
  const mark = Number(row.mark);
  return !Number.isInteger(mark) || mark < 0 || mark > 100;
}

export function useApsCalculator() {
  const [rows, setRows] = useState(initialRows);
  const [focusId, setFocusId] = useState<number | null>(null);
  const nextId = useRef(7);

  const invalidMarkIds = useMemo(
    () => new Set(rows.filter(rowMarkIsInvalid).map((row) => row.id)),
    [rows],
  );
  const duplicateLanguageIds = useMemo(() => duplicateSecondAdditionalIds(rows), [rows]);
  const invalidIds = useMemo(
    () => new Set([...invalidMarkIds, ...duplicateLanguageIds]),
    [duplicateLanguageIds, invalidMarkIds],
  );

  const result = useMemo(() => {
    const markedRows = rows.flatMap((row) => {
      if (!row.name.trim() || !row.mark.trim() || invalidIds.has(row.id)) return [];
      const percent = Number(row.mark);
      const level = APS_LEVELS.find((entry) => percent >= entry.minMark && percent <= entry.maxMark);
      if (!level) return [];
      return [{
        row,
        percent,
        aps: pointsForMark(percent, APS_BANDS),
        level: level.level,
      }];
    });
    const breakdown: ApsBreakdownRow[] = markedRows.map(({ row, percent, aps, level }) => ({
      name: row.name.trim(),
      percent,
      aps,
      level,
      counted: row.counted,
      reason: row.counted ? undefined : 'not selected',
    }));

    return {
      total: breakdown.reduce((sum, row) => sum + (row.counted ? row.aps : 0), 0),
      countedSubjects: breakdown.filter((row) => row.counted).length,
      breakdown,
    };
  }, [invalidIds, rows]);

  function updateRow(id: number, update: Partial<SubjectRowState>) {
    setRows((current) => current.map((row) => row.id === id ? { ...row, ...update } : row));
  }

  function setName(id: number, name: string) {
    setRows((current) => {
      const homeRow = current.find((row) => row.type === 'home-language');
      const nextHomeLanguage = id === homeRow?.id ? name : homeRow?.name ?? '';

      return current.map((row) => {
        if (row.type === 'life-orientation') return row;
        if (row.id === homeRow?.id) {
          return id === row.id ? { ...row, name } : row;
        }
        if (row.type === 'first-additional') {
          if (isEnglishHomeLanguage(nextHomeLanguage)) {
            return id === homeRow?.id ? { ...row, name: '', mark: '' } : { ...row, name };
          }
          return row.name === 'English First Additional Language'
            ? row
            : { ...row, name: 'English First Additional Language', mark: '' };
        }
        return row.id === id ? { ...row, name } : row;
      });
    });
  }

  function addRow() {
    const id = nextId.current++;
    setRows((current) => [...current, { id, type: 'subject', name: '', mark: '', counted: true }]);
    setFocusId(id);
  }

  function reset() {
    setRows(initialRows());
    setFocusId(null);
  }

  return {
    rows,
    result,
    invalidIds,
    invalidMarkIds,
    duplicateLanguageIds,
    focusId,
    setName,
    setMark: (id: number, mark: string) => updateRow(id, { mark }),
    setCounted: (id: number, counted: boolean) => updateRow(id, { counted }),
    removeRow: (id: number) => setRows((current) =>
      current.filter((row) => row.id !== id || row.type !== 'subject')),
    addRow,
    reset,
  };
}
