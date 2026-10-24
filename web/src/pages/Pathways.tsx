import { useState } from 'react';
import { Compass } from 'lucide-react';
import { Hero } from '../components/Hero';
import { InfoTooltip } from '../components/InfoTooltip';
import { Link } from 'react-router-dom';

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

const SAMPLE_COURSES: CourseOption[] = [
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
  const [baseAps, setBaseAps] = useState(30);
  const [mathsBoost, setMathsBoost] = useState(0);

  // Simulated student effective APS and Maths mark boost
  const effectiveAps = baseAps + Math.floor(mathsBoost / 3);
  const effectiveMaths = 55 + mathsBoost;

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
                content="The simulator re-runs our scoring engine with adjusted marks to forecast which courses become newly unlocked if you improve your grades."
              />
            </div>
            <p className="muted" style={{ marginBottom: '1.25rem' }}>
              Test how raising your marks or Mathematics grade unlocks additional degree and diploma options across South Africa.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Base APS Score: {baseAps}
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

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Maths Mark Boost: +{mathsBoost}% (Est. {effectiveMaths}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={5}
                  value={mathsBoost}
                  onChange={(e) => setMathsBoost(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--line)' }}>
              <span>Effective APS: <strong>{effectiveAps}</strong></span>
              <span>Maths Level: <strong>{effectiveMaths}%</strong></span>
              <Link to="/aps-calculator" style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                Calculate exact APS →
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
            Ranked by eligibility and academic fit based on your current inputs.
          </p>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {SAMPLE_COURSES.map((course) => {
              const qualifies = effectiveAps >= course.minAps && effectiveMaths >= course.requiredMaths;
              const close = !qualifies && effectiveAps >= course.minAps - 3;

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
                      ? `Your effective APS of ${effectiveAps} meets the minimum requirement of ${course.minAps}, and your Maths (${effectiveMaths}%) meets the required ${course.requiredMaths}%.`
                      : close
                      ? `You are close! Your APS of ${effectiveAps} is near the requirement of ${course.minAps}. Raising marks slightly will unlock this course.`
                      : `Requires APS of ${course.minAps} (you have ${effectiveAps}) and Maths at ${course.requiredMaths}% (you have ${effectiveMaths}%). Use the What-If slider above to test marks improvement.`}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--line)' }}>
                    <span>Application Deadline: {course.deadline}</span>
                    <span>Verified: {course.verifiedDate}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
