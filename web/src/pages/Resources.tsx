import { Hero } from '../components/Hero';

export default function Resources() {
  return (
    <div className="page-wrapper">
      <Hero
        eyebrow="Knowledge & Guidance"
        title={
          <h1>
            Student <span>Resources.</span>
          </h1>
        }
        description="Access curated study guides, bursary advice, application tips, and verified guides for South African tertiary students."
        feature={{
          symbol: '📚',
          title: 'Verified Guides.',
          description: 'Reliable information and advice to guide your tertiary journey every step of the way.',
        }}
      />

      <div className="page-content">
        <section>
          <h2>Student Resources</h2>
          <p>Planned: curated guides and scam warnings, public read, each with source and last-verified date.</p>
          <p className="muted">Owner: Daniel (data), Blessing and Katlego (UI)</p>
        </section>
      </div>
    </div>
  );
}
