import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface TaskRow {
  id: string;
  title: string;
  est_days: number;
  sort_order: number;
}

interface ProgressRow {
  task_id: string;
}

interface DeadlineRow {
  name: string;
  deadline: string | null;
}

interface CourseDeadlineRow {
  name: string;
  application_deadline: string | null;
}

interface ParsedDeadline extends DeadlineRow {
  parsed: Date;
}

function parseDate(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string | null): string {
  const date = parseDate(value);
  return date ? new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(date) : 'Not listed';
}

export default function Checklist() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [deadlines, setDeadlines] = useState<DeadlineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      if (!session?.user.id) return;
      setLoading(true);
      setError('');
      const [taskResult, progressResult, courseResult, fundingResult] = await Promise.all([
        supabase.from('checklist_tasks').select('id,title,est_days,sort_order').order('sort_order'),
        supabase.from('checklist_progress').select('task_id').eq('student_id', session.user.id),
        supabase.from('courses').select('name,application_deadline'),
        supabase.from('funding_sources').select('name,deadline'),
      ]);
      if (!active) return;
      const failed = taskResult.error || progressResult.error || courseResult.error || fundingResult.error;
      if (failed) setError(failed.message);
      else {
        setTasks((taskResult.data ?? []) as TaskRow[]);
        setCompletedIds(new Set(((progressResult.data ?? []) as ProgressRow[]).map((row) => row.task_id)));
        setDeadlines([
          ...((courseResult.data ?? []) as CourseDeadlineRow[]).map((row) => ({ name: row.name, deadline: row.application_deadline })),
          ...((fundingResult.data ?? []) as DeadlineRow[]).map((row) => ({ name: row.name, deadline: row.deadline })),
        ]);
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [session?.user.id]);

  const remainingDays = useMemo(
    () => tasks.filter((task) => !completedIds.has(task.id)).reduce((total, task) => total + task.est_days, 0),
    [completedIds, tasks],
  );
  const nearestDeadline = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadlines
      .map((item) => ({ ...item, parsed: parseDate(item.deadline) }))
      .filter((item): item is ParsedDeadline => item.parsed !== null && item.parsed >= today)
      .sort((a, b) => a.parsed.getTime() - b.parsed.getTime())[0] ?? null;
  }, [deadlines]);
  const daysUntilDeadline = nearestDeadline
    ? Math.ceil((nearestDeadline.parsed.getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
    : null;

  async function toggle(task: TaskRow) {
    if (!session?.user.id || busyId) return;
    setUpdateError('');
    setBusyId(task.id);
    const isComplete = completedIds.has(task.id);
    const result = isComplete
      ? await supabase.from('checklist_progress').delete().eq('student_id', session.user.id).eq('task_id', task.id)
      : await supabase.from('checklist_progress').insert({ student_id: session.user.id, task_id: task.id });
    if (result.error) {
      setUpdateError(`Could not update "${task.title}": ${result.error.message}`);
      setBusyId('');
      return;
    }
    setCompletedIds((current) => {
      const next = new Set(current);
      if (isComplete) next.delete(task.id);
      else next.add(task.id);
      return next;
    });
    setBusyId('');
  }

  if (loading) return <section><h1>Application checklist</h1><p>Loading your checklist…</p></section>;

  return (
    <section className="db-stack">
      <div>
        <h1>Application checklist</h1>
        <p className="muted">Track your planning tasks across sessions. Completion is private to your signed-in account.</p>
      </div>
      {error && <p role="alert" className="db-message db-message--error">{error}</p>}
      {updateError && <p role="alert" className="db-message db-message--error">{updateError}</p>}
      {!error && (
        <>
          {tasks.length === 0 ? (
            <div className="card"><h2>No checklist tasks available</h2><p>Tasks will appear here when an administrator adds them to the database.</p></div>
          ) : (
            <>
              <div className="card">
                <p><strong>{completedIds.size} of {tasks.length} tasks complete</strong></p>
                <progress className="db-progress" max={tasks.length} value={Math.min(completedIds.size, tasks.length)}>{completedIds.size} of {tasks.length}</progress>
                <p>Estimated work remaining: {remainingDays} day(s). Estimates are planning aids, not guarantees.</p>
              </div>
              <div className="card db-task-list">
                {tasks.map((task) => (
                  <label className="db-task-row" key={task.id}>
                    <input type="checkbox" checked={completedIds.has(task.id)} disabled={busyId === task.id || Boolean(busyId)} onChange={() => void toggle(task)} />
                    <span className={completedIds.has(task.id) ? 'db-task-done' : ''}>{task.title}</span>
                    <span className="muted">~{task.est_days} day(s)</span>
                  </label>
                ))}
              </div>
              <div className="card">
                <h2>Deadline planning</h2>
                {nearestDeadline && daysUntilDeadline !== null ? (
                  <>
                    <p>Nearest upcoming listed deadline: <strong>{nearestDeadline.name}</strong> — {formatDate(nearestDeadline.deadline)} ({daysUntilDeadline} day(s) away).</p>
                    <p className="muted">
                      {remainingDays > daysUntilDeadline
                        ? 'Estimated work remaining exceeds the time until this deadline. Prioritize the next step and confirm the deadline with its provider.'
                        : 'The remaining task estimates fit within the time to this deadline, but allow for delays and verify the date with the provider.'}
                    </p>
                  </>
                ) : <p>No future course or funding deadlines are currently listed in the database.</p>}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
