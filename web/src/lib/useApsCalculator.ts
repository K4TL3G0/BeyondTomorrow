import { useCallback, useMemo, useState } from 'react';
import {
  calculateAps,
  isValidMark,
  type ApsResult,
  type SubjectEntry,
} from '@beyond-tomorrow/engine';

export interface SubjectRowState {
  id: number;
  name: string;
  mark: string; // kept as a string so the input can be empty
  counted: boolean;
  touched: boolean; // true once the student has ticked/unticked "Count" themselves
}

const LIFE_ORIENTATION = /life\s*orientation/i;
const STARTER_SUBJECTS = [
  'Home Language',
  'First Additional Language',
  'Mathematics or Mathematical Literacy',
  'Life Orientation',
];

let nextId = 1;
const makeRow = (name = '', counted = true): SubjectRowState => ({
  id: nextId++,
  name,
  mark: '',
  counted,
  touched: false,
});

const starterRows = (): SubjectRowState[] => [
  ...STARTER_SUBJECTS.map((s) => makeRow(s, !/life/i.test(s))),
  makeRow(),
  makeRow(),
  makeRow(),
];

export interface ApsCalculator {
  rows: SubjectRowState[];
  entries: SubjectEntry[];
  invalidIds: Set<number>;
  result: ApsResult;
  focusId: number | null;
  setName: (id: number, name: string) => void;
  setMark: (id: number, mark: string) => void;
  setCounted: (id: number, counted: boolean) => void;
  addRow: () => void;
  removeRow: (id: number) => void;
  reset: () => void;
}

export function useApsCalculator(): ApsCalculator {
  const [rows, setRows] = useState<SubjectRowState[]>(starterRows);
  const [focusId, setFocusId] = useState<number | null>(null);

  const patch = useCallback((id: number, change: (r: SubjectRowState) => SubjectRowState) => {
    setRows((rs) => rs.map((r) => (r.id === id ? change(r) : r)));
  }, []);

  const setName = useCallback(
    (id: number, name: string) =>
      patch(id, (r) => ({
        ...r,
        name,
        // Life Orientation is not counted by default, unless the student has chosen themselves
        counted: LIFE_ORIENTATION.test(name) && !r.touched ? false : r.counted,
      })),
    [patch],
  );

  const setMark = useCallback((id: number, mark: string) => patch(id, (r) => ({ ...r, mark })), [patch]);

  const setCounted = useCallback(
    (id: number, counted: boolean) => patch(id, (r) => ({ ...r, counted, touched: true })),
    [patch],
  );

  const addRow = useCallback(() => {
    const row = makeRow();
    setRows((rs) => [...rs, row]);
    setFocusId(row.id);
  }, []);

  const removeRow = useCallback((id: number) => setRows((rs) => rs.filter((r) => r.id !== id)), []);

  const reset = useCallback(() => {
    setRows(Array.from({ length: 7 }, () => makeRow()));
    setFocusId(null);
  }, []);

  const { entries, invalidIds } = useMemo(() => {
    const list: SubjectEntry[] = [];
    const bad = new Set<number>();
    for (const r of rows) {
      if (r.mark === '') continue; // empty rows are ignored
      const percent = parseFloat(r.mark);
      if (!isValidMark(percent)) {
        bad.add(r.id);
        continue;
      }
      list.push({ name: r.name.trim() || 'Subject', percent, counted: r.counted });
    }
    return { entries: list, invalidIds: bad };
  }, [rows]);

  const result = useMemo(() => calculateAps(entries), [entries]);

  return { rows, entries, invalidIds, result, focusId, setName, setMark, setCounted, addRow, removeRow, reset };
}