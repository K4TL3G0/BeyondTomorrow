import { useMemo, useRef, useState } from 'react';
import { pointsForMark } from '@beyond-tomorrow/engine';
import { APS_BANDS, APS_LEVELS } from './apsLevels';

export interface SubjectRowState {
  id: number;
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

function emptyRows(): SubjectRowState[] {
  return Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    name: '',
    mark: '',
    counted: true,
  }));
}

export function useApsCalculator() {
  const [rows, setRows] = useState(emptyRows);
  const [focusId, setFocusId] = useState<number | null>(null);
  const nextId = useRef(7);

  const invalidIds = useMemo(() => new Set(rows
    .filter((row) => {
      if (row.mark.trim() === '') return false;
      const mark = Number(row.mark);
      return !Number.isInteger(mark) || mark < 0 || mark > 100;
    })
    .map((row) => row.id)), [rows]);

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
    const topSixIds = new Set(markedRows
      .filter(({ row }) => row.counted)
      .slice()
      .sort((a, b) => b.aps - a.aps)
      .slice(0, 6)
      .map(({ row }) => row.id));
    const breakdown: ApsBreakdownRow[] = markedRows.map(({ row, percent, aps, level }) => ({
      name: row.name.trim(),
      percent,
      aps,
      level,
      counted: topSixIds.has(row.id),
      reason: !row.counted
        ? 'not selected'
        : !topSixIds.has(row.id)
          ? 'only the best six selected subjects are counted'
          : undefined,
    }));

    return {
      total: breakdown.reduce((sum, row) => sum + (row.counted ? row.aps : 0), 0),
      countedSubjects: topSixIds.size,
      breakdown,
    };
  }, [invalidIds, rows]);

  function updateRow(id: number, update: Partial<SubjectRowState>) {
    setRows((current) => current.map((row) => row.id === id ? { ...row, ...update } : row));
  }

  function addRow() {
    const id = nextId.current++;
    setRows((current) => [...current, { id, name: '', mark: '', counted: true }]);
    setFocusId(id);
  }

  function reset() {
    setRows([]);
    setFocusId(null);
  }

  return {
    rows,
    result,
    invalidIds,
    focusId,
    setName: (id: number, name: string) => updateRow(id, {
      name,
      ...(name.trim().toLowerCase() === 'life orientation' ? { counted: false } : {}),
    }),
    setMark: (id: number, mark: string) => updateRow(id, { mark }),
    setCounted: (id: number, counted: boolean) => updateRow(id, { counted }),
    removeRow: (id: number) => setRows((current) => current.filter((row) => row.id !== id)),
    addRow,
    reset,
  };
}
