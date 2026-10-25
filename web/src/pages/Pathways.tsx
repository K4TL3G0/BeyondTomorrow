import { useState } from 'react';
import { Compass } from 'lucide-react';
import { Hero } from '../components/Hero';
import { InfoTooltip } from '../components/InfoTooltip';
import { Link } from 'react-router-dom';
import { pointsForMark } from '@beyond-tomorrow/engine';
import { APS_BANDS } from '../lib/apsLevels';
import { useStudentMarks } from '../lib/useStudentMarks';

interface CourseOption {
  id: string;
  name: string;
  institution: string;
  minAps: number;
  requiredMaths: number;
  field: string;
  province: string;
  deadline: string;
  verifiedDate: string;
}

const RECOMMENDED_COURSES: CourseOption[] = [
  {
    id: 'c1',
    name: 'BCom Accounting',
    institution: 'University of Cape Town (UCT)',
    minAps: 32,
    requiredMaths: 60,
    field: 'Business & Commerce',
    province: 'Western Cape',
    deadline: '2026-10-31',
    verifiedDate: '2026-10-12',
  },
  {
    id: 'c2',
    name: 'BSc Computer Science',
    institution: 'University of the Witwatersrand (Wits)',
    minAps: 35,
    requiredMaths: 70,
    field: 'Engineering & IT',
    province: 'Gauteng',
    deadline: '2026-11-15',
    verifiedDate: '2026-10-14',
  },
  {
    id: 'c3',
    name: 'Diploma in Information Technology',
    institution: 'Tshwane TVET College',
    minAps: 20,
    requiredMaths: 40,
    field: 'Engineering & IT',
    province: 'Gauteng',
    deadline: '2026-11-30',
    verifiedDate: '2026-10-15',
  },
  {
    id: 'c4',
    name: 'BA Law',
    institution: 'University of Pretoria (UP)',
    minAps: 30,
    requiredMaths: 50,
    field: 'Humanities & Law',
    province: 'Gauteng',
    deadline: '2026-11-05',
    verifiedDate: '2026-10-10',
  },
];

export default function Pathways() {
  const studentMarks = useStudentMarks();
  const [baseAps, setBaseAps] = useState(30);
  const [mathsBoost, setMathsBoost] = useState(0);

  const hasSavedSubjects = studentMarks.marks.length > 0;
  const savedAps = studentMarks.marks.reduce(
    (total, entry) => total + (
      entry.counted && entry.mark !== null ? pointsForMark(entry.mark, APS_BANDS) : 0
    ),
    0,
  );
  const mathematics = studentMarks.marks.find((entry) => entry.code === 'MATH' && entry.mark !== null);
  const baseMathsMark = hasSavedSubjects ? mathematics?.mark ?? null : 55;
  const effectiveMaths = baseMathsMark === null
    ? null
    : Math.min(100, baseMathsMark + mathsBoost);
  const mathsApsChange = mathematics?.counted && mathematics.mark !== null && effectiveMaths !== null
    ? pointsForMark(effectiveMaths, APS_BANDS) - pointsForMark(mathematics.mark, APS_BANDS)
    : 0;
  const effectiveAps = hasSavedSubjects
    ? savedAps + mathsApsChange
    : baseAps + Math.floor(mathsBoost / 3);
  const appliedMathsBoost = effectiveMaths !== null && baseMathsMark !== null
    ? effectiveMaths - baseMathsMark
    : 0;
  const maxMathsBoost = baseMathsMark === null ? 0 : Math.min(25, 100 - baseMathsMark);

  return (
    <div className="page-wrapper">
      <Hero
        eyebrow="Discover Your Path"
        title={
          <h1>
            Higher Education <span>Pathways.</span>
          </h1>
        }
        description="Explore ranked course recommendations tailored to your APS score, interests, and career goals. Use our What-If simulator below to see how boosting your marks unlocks new study opportunities."
        feature={{
          symbol: <Compass size={28} strokeWidth={1.8} />,
          title: 'Explore & Plan.',
          description: 'Find the right academic path and discover alternative options for your tertiary journey.',
        }}
      />

      <div className="page-content">
        <section style={{ marginBottom: '2.5rem' }}>
          <div className="card" style={{ background: 'var(--card)', padding: '1.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ margin: 0 }}>What-If Simulator</h2>
              <InfoTooltip
                title="How the What-If Simulator works"
                content="With saved marks, the simulator starts from your counted subjects and Mathematics mark. Without saved marks, it uses clearly labelled sample inputs. This is an estimate, not an institution-specific APS calculation."
              />
            </div>
            <p className="muted" style={{ marginBottom: '1.25rem' }}>
              {studentMarks.loading
                ? 'Loading your saved subjects and marks…'
                : studentMarks.error
                  ? studentMarks.error
                  : hasSavedSubjects
                    ? 'Your saved subjects and marks are the starting point for these estimates.'
                    : 'No saved subjects yet. Sample inputs are shown; save your marks in the APS calculator to personalize these estimates.'}
            </p>
            {studentMarks.error && (
              <button type="button" onClick={studentMarks.reload}>Try loading saved marks again</button>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1rem' }}>
              {!studentMarks.loading && !studentMarks.error && !hasSavedSubjects && (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Sample base APS: {baseAps}
                  </label>
                  <input
                    type="range"
                    min={18}
                    max={42}
                    step={1}
                    value={baseAps}
                    onChange={(e) => setBaseAps(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>
              )}

              {!studentMarks.loading && !studentMarks.error && effectiveMaths !== null && (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Mathematics mark: {baseMathsMark}% · What-if boost: +{appliedMathsBoost}% (to {effectiveMaths}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxMathsBoost}
                    step={1}
                    value={Math.min(mathsBoost, maxMathsBoost)}
                    onChange={(e) => setMathsBoost(Number(e.target.value))}
                    disabled={maxMathsBoost === 0}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--line)' }}>
              {studentMarks.loading ? (
                <span>Loading your saved study profile…</span>
              ) : studentMarks.error ? (
                <span>Pathway estimates are unavailable until your saved marks load.</span>
              ) : (
                <>
                  <span>{hasSavedSubjects ? 'Estimated APS from your saved marks' : 'Sample effective APS'}: <strong>{effectiveAps}</strong></span>
                  <span>Mathematics: <strong>{effectiveMaths === null ? 'Mark not saved' : `${effectiveMaths}%`}</strong></span>
                </>
              )}
              <Link to="/aps-calculator" style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                Update subjects and marks →
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ margin: 0 }}>Recommended Course Matches</h2>
            <InfoTooltip
              title="Understanding Eligibility Verdicts"
              content="Qualifies means you meet both APS and subject minimums. Close means your APS is within 3 points of the requirement. Not Yet indicates you fall short of current published entry barriers."
            />
          </div>
          <p className="muted" style={{ marginBottom: '1.5rem' }}>
            Estimates use saved marks when available. Confirm requirements and APS rules with each institution.
          </p>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {!studentMarks.loading && !studentMarks.error && RECOMMENDED_COURSES.map((course) => {
              const qualifies = effectiveMaths !== null &&
                effectiveAps >= course.minAps &&
                effectiveMaths >= course.requiredMaths;
              const close = !qualifies &&
                effectiveMaths !== null &&
                effectiveMaths >= course.requiredMaths &&
                effectiveAps >= course.minAps - 3;

              return (
                <article key={course.id} className="card" style={{ padding: '1.5rem', display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span className="source-type" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', fontWeight: 700 }}>
                        {course.field}
                      </span>
                      <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.2rem' }}>{course.name}</h3>
                      <p className="muted" style={{ margin: 0, fontSize: '0.95rem' }}>{course.institution} • {course.province}</p>
                    </div>
                    <div>
                      {qualifies ? (
                        <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                          Qualifies
                        </span>
                      ) : close ? (
                        <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                          Close (Within 3 APS)
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                          Not Yet
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                    {qualifies
                      ? `Your estimated APS of ${effectiveAps} meets the listed minimum of ${course.minAps}, and your Mathematics mark (${effectiveMaths}%) meets the listed ${course.requiredMaths}%.`
                      : close
                      ? `Your estimate is close to the listed APS minimum of ${course.minAps}. Confirm the programme's subject requirements with the institution.`
                      : effectiveMaths === null
                        ? `This option lists an APS minimum of ${course.minAps} and Mathematics of ${course.requiredMaths}%. Save a Mathematics mark to compare against it.`
                        : `The listing requires APS ${course.minAps} and Mathematics ${course.requiredMaths}%. Your current estimate is APS ${effectiveAps} and Mathematics ${effectiveMaths}%.`}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--line)' }}>
                    <span>Application Deadline: {course.deadline}</span>
                    <span>Verified: {course.verifiedDate}</span>
                  </div>
                </article>
              );
            })}
            {studentMarks.loading && <p role="status">Loading pathway estimates…</p>}
            {studentMarks.error && (
              <p role="alert">Pathway estimates were not updated because saved marks could not be loaded.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
