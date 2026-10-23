import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="db-stack">
      <div>
        <h1>Find your path, fund it, and finish it</h1>
        <p className="muted">Explore course requirements, keep your student details in one place, review funding criteria, and track the steps toward applying.</p>
      </div>
      <div className="db-card-grid">
        <article className="card">
          <h2>Set up your student profile</h2>
          <p>Save your province, income bracket, interests and subject marks to your account.</p>
          <Link to="/onboarding">Your details</Link>
        </article>
        <article className="card">
          <h2>Explore course pathways</h2>
          <p>Browse database course entries, APS bands, subject requirements and application links.</p>
          <Link to="/pathways">Explore courses</Link>
        </article>
        <article className="card">
          <h2>Review funding sources</h2>
          <p>Compare the published limits, eligibility criteria, deadlines and source links.</p>
          <Link to="/funding">View funding</Link>
        </article>
        <article className="card">
          <h2>Plan your next steps</h2>
          <p>Track database checklist tasks and consider the time remaining before listed deadlines.</p>
          <Link to="/checklist">Open checklist</Link>
        </article>
        <article className="card">
          <h2>Browse institutions</h2>
          <p>Search the independent institution directory and use official sites to confirm admissions details.</p>
          <Link to="/applications">Explore institutions</Link>
        </article>
      </div>
    </section>
  );
}
