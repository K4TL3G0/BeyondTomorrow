import { useCallback, useState } from 'react';
import { preparationItems } from '../data/preparationItems';
import type { ChecklistState, PreparationItem, PreparationItemId } from '../types';

const STORAGE_KEY = 'beyondTomorrow.applicationChecklist.v1';

const MSG_INITIAL = 'Checklist choices are saved locally when changed.';
const MSG_SAVED = 'Checklist saved in this browser.';
const MSG_UNREADABLE =
  'Browser storage could not be read or used. Changes work for this session but may not be saved. Check browser privacy / file settings.';
const MSG_SAVE_FAILED =
  'Could not save. Your checklist currently works for this session only.';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function createEmptyState(): ChecklistState {
  const state = {} as ChecklistState;
  for (const item of preparationItems) state[item.id] = false;
  return state;
}

interface LoadResult {
  state: ChecklistState;
  storageAvailable: boolean;
}

function loadChecklist(): LoadResult {
  const state = createEmptyState();
  try {
    if (typeof window === 'undefined') throw new Error('No window');
    const storage = window.localStorage;
    const stored = storage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed: unknown = JSON.parse(stored);
      if (!isRecord(parsed)) throw new Error('Invalid checklist');
      for (const item of preparationItems) {
        state[item.id] = parsed[item.id] === true;
      }
    }
    const probe = `${STORAGE_KEY}.probe`;
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return { state, storageAvailable: true };
  } catch {
    return { state: createEmptyState(), storageAvailable: false };
  }
}

export interface DocumentChecklist {
  items: readonly PreparationItem[];
  checked: ChecklistState;
  completedCount: number;
  total: number;
  statusMessage: string;
  toggle: (id: PreparationItemId, value: boolean) => void;
  reset: () => void;
}

export function useDocumentChecklist(): DocumentChecklist {
  const [initial] = useState(loadChecklist);
  const [checked, setChecked] = useState<ChecklistState>(initial.state);
  const [storageAvailable, setStorageAvailable] = useState(
    initial.storageAvailable,
  );
  const [statusMessage, setStatusMessage] = useState(
    initial.storageAvailable ? MSG_INITIAL : MSG_UNREADABLE,
  );

  const persist = useCallback(
    (next: ChecklistState) => {
      if (!storageAvailable) {
        setStatusMessage(MSG_UNREADABLE);
        return;
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setStatusMessage(MSG_SAVED);
      } catch {
        setStorageAvailable(false);
        setStatusMessage(MSG_SAVE_FAILED);
      }
    },
    [storageAvailable],
  );

  const toggle = useCallback(
    (id: PreparationItemId, value: boolean) => {
      const next = { ...checked, [id]: value };
      setChecked(next);
      persist(next);
    },
    [checked, persist],
  );

  const reset = useCallback(() => {
    const next = createEmptyState();
    setChecked(next);
    persist(next);
  }, [persist]);

  const completedCount = preparationItems.filter((item) => checked[item.id]).length;

  return {
    items: preparationItems,
    checked,
    completedCount,
    total: preparationItems.length,
    statusMessage,
    toggle,
    reset,
  };
}