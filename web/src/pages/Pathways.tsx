import { Hero } from '../components/Hero';

export default function Pathways() {
  return (
    <div className="page-wrapper">
      <Hero
        eyebrow="Discover Your Path"
        title={
          <h1>
            Higher Education <span>Pathways.</span>
          </h1>
        }
        description="Explore ranked course recommendations tailored to your APS score, interests, and career goals. See matches across South African universities and TVET colleges."
        feature={{
          symbol: '🧭',
          title: 'Explore & Plan.',
          description: 'Find the right academic path and discover alternative options for your tertiary journey.',
        }}
      />

      <div className="page-content">
        <section>
          <h2>Recommended Pathways</h2>
          <p>Planned: ranked course recommendations with reasons, plus the what-if slider.</p>
          <p className="muted">Owner: Jeremie and Andile (engine), Blessing and Katlego (UI)</p>
        </section>
      </div>
    </div>
  );
}
