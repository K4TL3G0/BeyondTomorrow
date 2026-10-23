import { Hero } from '../components/Hero';

export default function Onboarding() {
  return (
    <div className="page-wrapper">
      <Hero
        eyebrow="Personalize Your Journey"
        title={
          <h1>
            Your <span>Profile.</span>
          </h1>
        }
        description="Tell us about your subject marks, province, and interests so we can personalize course recommendations and funding options for you."
        feature={{
          symbol: '👤',
          title: 'Tailored For You.',
          description: 'Get custom funding and course matches based on your academic profile.',
        }}
      />

      <div className="page-content">
        <section>
          <h2>Your details</h2>
          <p>Planned: form for marks (0-100), province, income bracket and interests, validated before saving.</p>
          <p className="muted">Owner: Blessing and Katlego with Jeremie and Andile</p>
        </section>
      </div>
    </div>
  );
}
