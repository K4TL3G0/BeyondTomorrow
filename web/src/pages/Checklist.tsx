import { Hero } from '../components/Hero';

export default function Checklist() {
  return (
    <div className="page-wrapper">
      <Hero
        eyebrow="Stay On Track"
        title={
          <h1>
            Application <span>Checklist.</span>
          </h1>
        }
        description="Track your application deadlines, document preparation, and next steps to ensure a smooth transition to higher education."
        feature={{
          symbol: '✓',
          title: 'Never Miss A Deadline.',
          description: 'Organize required documents and meet key closing dates with confidence.',
        }}
      />

      <div className="page-content">
        <section>
          <h2>Application Checklist</h2>
          <p>Planned: deadline-aware steps with a time-left indicator and risk nudge.</p>
          <p className="muted">Owner: Jeremie and Andile (logic), Blessing and Katlego (UI)</p>
        </section>
      </div>
    </div>
  );
}
