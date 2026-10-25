import { useCallback, useMemo, useRef, useState } from 'react';
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
    { id: 3, type: 'first-additional', name: '', mark: '', counted: true },
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

function duplicateSubjectIds(rows: SubjectRowState[]): Set<number> {
  const idsByName = new Map<string, number[]>();
  for (const row of rows) {
    const normalizedName = row.name.trim().toLocaleLowerCase();
    if (!normalizedName) continue;
    idsByName.set(normalizedName, [...(idsByName.get(normalizedName) ?? []), row.id]);
  }
  return new Set([...idsByName.values()].filter((ids) => ids.length > 1).flat());
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
  const hasEdited = useRef(false);

  const invalidMarkIds = useMemo(
    () => new Set(rows.filter(rowMarkIsInvalid).map((row) => row.id)),
    [rows],
  );
  const duplicateLanguageIds = useMemo(() => duplicateSecondAdditionalIds(rows), [rows]);
  const duplicateIds = useMemo(() => duplicateSubjectIds(rows), [rows]);
  const invalidIds = useMemo(
    () => new Set([...invalidMarkIds, ...duplicateLanguageIds, ...duplicateIds]),
    [duplicateIds, duplicateLanguageIds, invalidMarkIds],
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
    hasEdited.current = true;
    setRows((current) => current.map((row) => row.id === id ? { ...row, ...update } : row));
  }

  function setName(id: number, name: string) {
    hasEdited.current = true;
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
    hasEdited.current = true;
    setRows((current) => [...current, { id, type: 'subject', name: '', mark: '', counted: true }]);
    setFocusId(id);
  }

  function reset() {
    hasEdited.current = true;
    setRows(initialRows());
    setFocusId(null);
  }

  const loadSavedRows = useCallback(
    (savedRows: Array<{ name: string; mark: number | null; counted: boolean }>): boolean => {
      if (hasEdited.current) return false;

      // Deduplicate savedRows by normalized name to prevent duplicate records from creating duplicate rows
      const seenNames = new Set<string>();
      const uniqueSavedRows = savedRows.filter((savedRow) => {
        const normalized = savedRow.name.trim().toLocaleLowerCase();
        if (!normalized || seenNames.has(normalized)) return false;
        seenNames.add(normalized);
        return true;
      });

      const restoredRows = initialRows();
      let nextSubjectSlot = 4;
      for (const savedRow of uniqueSavedRows) {
        const normalizedName = savedRow.name.trim().toLocaleLowerCase();

        // Check if this subject name is already present in restoredRows to prevent duplicate slots
        const existingSlot = restoredRows.findIndex(
          (row) => row.name.trim().toLocaleLowerCase() === normalizedName,
        );
        const savedState = {
          name: savedRow.name,
          mark: savedRow.mark === null ? '' : String(savedRow.mark),
          counted: savedRow.counted,
        };

        if (existingSlot >= 0) {
          const existingRow = restoredRows[existingSlot];
          if (existingRow) restoredRows[existingSlot] = { ...existingRow, ...savedState };
          continue;
        }

        const type: SubjectRowType = savedRow.name === 'Life Orientation'
          ? 'life-orientation'
          : savedRow.name.endsWith(' Home Language')
            ? 'home-language'
            : savedRow.name.endsWith(' First Additional Language')
              ? 'first-additional'
              : 'subject';
        const slot = type === 'life-orientation'
          ? restoredRows.findIndex((row) => row.type === type)
          : type === 'home-language'
            ? restoredRows.findIndex((row) => row.type === type && !row.name)
            : type === 'first-additional'
              ? restoredRows.findIndex((row) => row.type === type)
              : -1;

        if (slot >= 0) {
          const existingRow = restoredRows[slot];
          if (existingRow) restoredRows[slot] = { ...existingRow, ...savedState };
        } else {
          const emptySlot = restoredRows.findIndex((row) =>
            row.id >= 4 && row.type === 'subject' && !row.name && !row.mark,
          );
          if (emptySlot >= 0) {
            const existingRow = restoredRows[emptySlot];
            if (existingRow) restoredRows[existingSlot] = { ...existingRow, ...savedState };
          } else {
            restoredRows.push({
              id: nextSubjectSlot + 3,
              type: 'subject',
              ...savedState,
            });
            nextSubjectSlot += 1;
          }
        }
      }

      nextId.current = Math.max(7, ...restoredRows.map((row) => row.id + 1));
      setRows(restoredRows);
      setFocusId(null);
      return true;
    },
    [],
  );

  return {
    rows,
    result,
    invalidIds,
    invalidMarkIds,
    duplicateLanguageIds,
    duplicateSubjectIds: duplicateIds,
    focusId,
    setName,
    setMark: (id: number, mark: string) => updateRow(id, { mark }),
    setCounted: (id: number, counted: boolean) => updateRow(id, { counted }),
    removeRow: (id: number) => {
      hasEdited.current = true;
      setRows((current) => current.filter((row) => row.id !== id || row.type !== 'subject'));
    },
    addRow,
    reset,
    loadSavedRows,
  };
}
