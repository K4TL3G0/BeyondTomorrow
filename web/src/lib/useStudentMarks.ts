import { useEffect, useState } from 'react';
import { useAuth } from './auth';
import { supabase } from './supabase';

export interface SavedStudentMark {
  code: string;
  name: string;
  mark: number | null;
  counted: boolean;
}

type StudentMarkRecord = {
  mark: number | null;
  counted: boolean;
  subjects: { code: string; name: string } | null;
};

export function useStudentMarks() {
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user.id;
  const [marks, setMarks] = useState<SavedStudentMark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setMarks([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setMarks([]);
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const { data, error: queryError } = await supabase
          .from('student_marks')
          .select('mark, counted, subjects(code, name)')
          .eq('student_id', userId)
          .returns<StudentMarkRecord[]>();

        if (cancelled) return;
        if (queryError) {
          setError(`Your saved subjects could not be loaded: ${queryError.message}`);
          return;
        }

        const rows = data ?? [];
        if (rows.some((row) => !row.subjects)) {
          setError('Some saved subjects could not be matched to the subject catalog.');
          return;
        }
        const savedMarks: SavedStudentMark[] = [];
        for (const row of rows) {
          if (!row.subjects) {
            setError('Some saved subjects could not be matched to the subject catalog.');
            return;
          }
          savedMarks.push({
            code: row.subjects.code,
            name: row.subjects.name,
            mark: row.mark,
            counted: row.counted,
          });
        }
        setMarks(savedMarks);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? `Your saved subjects could not be loaded: ${loadError.message}`
              : 'Your saved subjects could not be loaded.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, reloadKey, userId]);

  return {
    marks,
    loading,
    error,
    reload: () => setReloadKey((key) => key + 1),
  };
}
