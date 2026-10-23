import { useEffect, useState, type FormEvent } from 'react';
import { INCOME_BRACKETS, PROVINCES } from '@beyond-tomorrow/engine';
import type { IncomeBracket, Province } from '@beyond-tomorrow/engine';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface SubjectRow {
  id: string;
  code: string;
  name: string;
}

interface MarkRow {
  subject_id: string;
  mark: number;
}

interface ProfileRow {
  province: Province | null;
  income_bracket: IncomeBracket | null;
  interests: string[];
}

interface MarkInput {
  subjectId: string;
  mark: string;
}

const INTEREST_SUGGESTIONS = [
  'business', 'finance', 'accounting', 'technology', 'computing', 'maths',
  'engineering', 'construction', 'health', 'education', 'agriculture',
  'science', 'law', 'arts',
];

export default function Onboarding() {
  const { session } = useAuth();
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [province, setProvince] = useState<Province | ''>('');
  const [incomeBracket, setIncomeBracket] = useState<IncomeBracket | ''>('');
  const [interests, setInterests] = useState('');
  const [marks, setMarks] = useState<MarkInput[]>([{ subjectId: '', mark: '' }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      if (!session?.user.id) return;
      setLoading(true);
      setError('');
      const [subjectResult, profileResult, markResult] = await Promise.all([
        supabase.from('subjects').select('id,code,name').order('name'),
        supabase.from('student_profiles').select('province,income_bracket,interests').eq('id', session.user.id).maybeSingle(),
        supabase.from('student_marks').select('subject_id,mark').eq('student_id', session.user.id),
      ]);
      if (!active) return;
      const failed = subjectResult.error || profileResult.error || markResult.error;
      if (failed) {
        setError(failed.message);
        setLoading(false);
        return;
      }
      setSubjects((subjectResult.data ?? []) as SubjectRow[]);
      const profile = profileResult.data as ProfileRow | null;
      if (profile) {
        setProvince(profile.province ?? '');
        setIncomeBracket(profile.income_bracket ?? '');
        setInterests(profile.interests.join(', '));
      }
      const savedMarks = (markResult.data ?? []) as MarkRow[];
      setMarks(savedMarks.length
        ? savedMarks.map((row) => ({ subjectId: row.subject_id, mark: String(row.mark) }))
        : [{ subjectId: '', mark: '' }]);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [session?.user.id]);

  const updateMark = (index: number, field: keyof MarkInput, value: string) => {
    setMarks((current) => current.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.user.id) return;
    setError('');
    setNotice('');
    const validMarks = marks.filter((row) => row.subjectId || row.mark);
    const duplicates = new Set(validMarks.map((row) => row.subjectId)).size !== validMarks.length;
    if (validMarks.length > 12) {
      setError('Enter no more than 12 subjects.');
      return;
    }
    if (validMarks.some((row) => !row.subjectId || !/^\d{1,3}$/.test(row.mark) || Number(row.mark) > 100)) {
      setError('Choose a subject and enter a whole-number mark from 0 to 100 for each row.');
      return;
    }
    if (duplicates) {
      setError('Each subject can only be entered once.');
      return;
    }
    const cleanInterests = [...new Set(interests.split(',').map((value) => value.trim()).filter(Boolean))];
    if (cleanInterests.length > 20 || cleanInterests.some((value) => value.length > 40)) {
      setError('Enter up to 20 interests, each 40 characters or fewer.');
      return;
    }

    setSaving(true);
    const profileResult = await supabase.from('student_profiles').upsert({
      id: session.user.id,
      province: province || null,
      income_bracket: incomeBracket || null,
      interests: cleanInterests,
    });
    if (profileResult.error) {
      setError(profileResult.error.message);
      setSaving(false);
      return;
    }

    const currentResult = await supabase.from('student_marks')
      .select('subject_id').eq('student_id', session.user.id);
    if (currentResult.error) {
      setError(`Profile saved, but existing marks could not be checked: ${currentResult.error.message}`);
      setSaving(false);
      return;
    }
    const rows = validMarks.map((row) => ({
      student_id: session.user.id,
      subject_id: row.subjectId,
      mark: Number(row.mark),
    }));
    if (rows.length) {
      const upsertResult = await supabase.from('student_marks').upsert(rows, { onConflict: 'student_id,subject_id' });
      if (upsertResult.error) {
        setError(`Profile saved, but marks could not be saved: ${upsertResult.error.message}`);
        setSaving(false);
        return;
      }
    }
    const retainedIds = new Set(rows.map((row) => row.subject_id));
    const removedIds = ((currentResult.data ?? []) as Pick<MarkRow, 'subject_id'>[])
      .map((row) => row.subject_id).filter((id) => !retainedIds.has(id));
    if (removedIds.length) {
      const deleteResult = await supabase.from('student_marks')
        .delete().eq('student_id', session.user.id).in('subject_id', removedIds);
      if (deleteResult.error) {
        setError(`Profile and marks saved, but removed marks could not be cleared: ${deleteResult.error.message}`);
        setSaving(false);
        return;
      }
    }
    setNotice('Your details and marks have been saved securely to your account.');
    setSaving(false);
  }

  if (loading) return <section><h1>Your details</h1><p>Loading your profile…</p></section>;

  return (
    <section>
      <h1>Your details</h1>
      <p className="muted">Add the information used to explore courses and funding. Income is stored only as a bracket, never as an exact amount.</p>
      {error && <p role="alert" className="db-message db-message--error">{error}</p>}
      {notice && <p role="status" className="db-message">{notice}</p>}
      <form className="db-stack" onSubmit={save}>
        <div className="card">
          <h2>About you</h2>
          <div className="db-form-grid">
            <label>Province
              <select value={province} onChange={(event) => setProvince(event.target.value as Province | '')}>
                <option value="">Choose a province</option>
                {PROVINCES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>Household income bracket
              <select value={incomeBracket} onChange={(event) => setIncomeBracket(event.target.value as IncomeBracket | '')}>
                <option value="">Prefer not to specify</option>
                {INCOME_BRACKETS.map((item) => (
                  <option key={item} value={item}>
                    {item === 'up_to_350k' ? 'Up to R350,000' : item === '350k_to_600k' ? 'R350,000–R600,000' : item === 'above_600k' ? 'Above R600,000' : 'Prefer not to say'}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>Interests (comma-separated)
            <input value={interests} onChange={(event) => setInterests(event.target.value)} placeholder={INTEREST_SUGGESTIONS.slice(0, 4).join(', ')} />
          </label>
          <p className="muted">Examples: {INTEREST_SUGGESTIONS.join(', ')}.</p>
        </div>

        <div className="card">
          <h2>Subject marks</h2>
          <p className="muted">Enter marks from 0 to 100. Add only subjects you have results for.</p>
          {subjects.length === 0 ? (
            <p>No subjects are available yet. Ask an administrator to load the subject list.</p>
          ) : marks.map((row, index) => (
            <div className="db-mark-row" key={index}>
              <label>Subject
                <select value={row.subjectId} onChange={(event) => updateMark(index, 'subjectId', event.target.value)}>
                  <option value="">Choose a subject</option>
                  {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>)}
                </select>
              </label>
              <label>Mark (%)
                <input type="number" min="0" max="100" step="1" value={row.mark} onChange={(event) => updateMark(index, 'mark', event.target.value)} />
              </label>
              <button type="button" className="db-secondary-button" onClick={() => setMarks((current) => current.filter((_, i) => i !== index))} aria-label={`Remove subject row ${index + 1}`}>Remove</button>
            </div>
          ))}
          <button type="button" className="db-secondary-button" disabled={marks.length >= 12 || subjects.length === 0} onClick={() => setMarks((current) => [...current, { subjectId: '', mark: '' }])}>Add subject</button>
        </div>
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save details'}</button>
      </form>
    </section>
  );
}
