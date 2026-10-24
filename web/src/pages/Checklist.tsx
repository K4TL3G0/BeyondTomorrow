import { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { assessDeadlineRisk } from '@beyond-tomorrow/engine';
import { Hero } from '../components/Hero';
import { InfoTooltip } from '../components/InfoTooltip';
import { ProgressBar } from '../components/ProgressBar';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  deadline: string;
  estDays: number;
  completed: boolean;
}

const INITIAL_TASKS: ChecklistItem[] = [
  {
    id: 't1',
    title: 'Certified copy of ID or passport',
    description: 'Must be certified by a commissioner of oaths (police station or post office) within the last 3 months.',
    deadline: '2026-10-31',
    estDays: 2,
    completed: true,
  },
  {
    id: 't2',
    title: 'Final or latest matric results',
    description: 'Grade 11 final report or Grade 12 June/trial examination results stamped by your school.',
    deadline: '2026-10-31',
    estDays: 1,
    completed: true,
  },
  {
    id: 't3',
    title: 'NSFAS / Bursary Application',
    description: 'Submit your financial aid application online at nsfas.org.za or via verified bursary portals.',
    deadline: '2026-10-31',
    estDays: 3,
    completed: false,
  },
  {
    id: 't4',
    title: 'University / TVET Application',
    description: 'Submit your online application directly through the institution admissions portal.',
    deadline: '2026-11-15',
    estDays: 2,
    completed: false,
  },
  {
    id: 't5',
    title: 'Proof of address / Guardian income details',
    description: 'Required for bursary and financial verification (parent/guardian payslips or affidavit).',
    deadline: '2026-11-15',
    estDays: 4,
    completed: false,
  },
];

export default function Checklist() {
  const [tasks, setTasks] = useState<ChecklistItem[]>(INITIAL_TASKS);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const now = new Date();
  const uncompletedTasks = tasks.filter((t) => !t.completed);
  const remainingTaskDays = uncompletedTasks.map((t) => t.estDays);
  const earliestDeadlineStr = uncompletedTasks.length > 0
    ? uncompletedTasks.reduce((earliest, t) => (t.deadline < earliest ? t.deadline : earliest), uncompletedTasks[0]?.deadline ?? '2026-10-31')
    : '2026-10-31';

  const riskLevel = assessDeadlineRisk({
    remainingTaskDays,
    deadline: new Date(earliestDeadlineStr),
    now,
  });

  return (
    <div className="page-wrapper">
      <Hero
        eyebrow="Stay On Track"
        title={
          <h1>
            Application <span>Checklist.</span>
          </h1>
        }
        description="Track your application deadlines, required documents, and critical milestones to ensure a smooth transition to higher education."
        feature={{
          symbol: <CalendarCheck size={28} strokeWidth={1.8} />,
          title: 'Never Miss A Deadline.',
          description: 'Organize required documents and meet key closing dates with confidence.',
        }}
      />

      <div className="page-content">
        {/* Progress & Risk Nudge */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.75rem', background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Progress: {completedCount} of {totalCount} steps completed</h2>
                  <InfoTooltip
                    title="Deadline Risk Nudges"
                    content="Our deadline risk engine compares your completed milestone tasks against upcoming closing dates (such as NSFAS and university applications) to warn you if you are falling behind."
                  />
                </div>
                <p className="muted" style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Keep going to secure your placement and funding before deadlines arrive.</p>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                {progressPercent}%
              </div>
            </div>

            {/* Progress bar */}
            <ProgressBar value={completedCount} max={totalCount} ariaLabel="Application progress" />

            {riskLevel === 'overdue' ? (
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🚨</span>
                <div>
                  <strong>Deadline Overdue:</strong> One or more application deadlines have passed or your remaining estimated work exceeds the time available. Prioritize submission immediately!
                </div>
              </div>
            ) : riskLevel === 'at_risk' ? (
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <div>
                  <strong>Deadline Risk Nudge:</strong> Your remaining estimated task days exceed the time left until upcoming deadlines (such as NSFAS / university admissions). Accelerate your document preparation!
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>✅</span>
                <div>
                  <strong>On Track:</strong> You have sufficient time remaining before upcoming deadlines based on your estimated work needed. Keep up the steady pace!
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Task List */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h2 style={{ margin: 0 }}>Application Steps &amp; Deadlines</h2>
            <InfoTooltip
              title="Estimated Days Needed (~ est.)"
              content="The approximate number of working days required to prepare, gather, or submit this specific document or application before the deadline."
            />
          </div>
          <p className="muted" style={{ marginBottom: '1.5rem' }}>
            Check off items as you complete them. Estimated days needed (~X days est.) represent the approximate working time required to complete each task.
          </p>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {tasks.map((task) => {
              const deadlineDate = new Date(task.deadline);
              const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysLeft < 0;

              return (
                <div
                  key={task.id}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    background: task.completed ? 'rgba(16, 185, 129, 0.03)' : 'var(--card)',
                    borderColor: task.completed ? 'rgba(16, 185, 129, 0.3)' : 'var(--line)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    style={{ marginTop: '0.25rem', width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    aria-label={task.title}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.7 : 1 }}>
                        {task.title}
                      </h3>
                      <span
                        title="Estimated working days required to complete this task"
                        style={{ fontSize: '0.85rem', fontWeight: 600, color: isOverdue && !task.completed ? '#dc2626' : 'var(--muted)', background: isOverdue && !task.completed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px', cursor: 'help' }}
                      >
                        Due: {task.deadline} ({isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`} · ~{task.estDays} days est. work)
                      </span>
                    </div>
                    <p className="muted" style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {task.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
