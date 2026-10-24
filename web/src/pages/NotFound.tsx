import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <Hero
        eyebrow="404 Error"
        title={
          <h1>
            Page <span>Not Found.</span>
          </h1>
        }
        description="The page you are looking for doesn't exist or has been moved."
        actions={
          <Link to="/" className="hero-button">
            Back to Home
          </Link>
        }
      />
    </div>
  );
}
