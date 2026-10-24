import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ImageSlider } from '../components/ImageSlider';
import { INSTITUTION_GROUPS } from '../data/institutionGroups';
import '../styles/institutions.css';

const APPLY_PATH = '/checklist';
const CONTACT_EMAIL = 'enquiry@beytom.com';

const CARD_DIRECTIONS = ['from-left', 'from-bottom', 'from-right'];
const CARD_DELAYS = ['delay-1', 'delay-2', 'delay-3'];

export default function Institutions() {
  useEffect(() => {
    document.title = 'Find Your Institution | Beyond Tomorrow';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );

    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="inst-page">
      <section className="inst-hero" id="home">
        <div className="inst-hero-content fade-in from-left">
          <p className="inst-small-heading">Your future starts now</p>

          <h1>
            Study <span>Today</span>.<br />
            Build Your <span>Future</span>.
          </h1>

          <p className="inst-hero-text">
            Unlock your potential with our resources, and get access to applications and
            funding. Find out what your APS score is. Connect with your peers and get the
            support you need to succeed in your tertiary journey.
          </p>

          <div className="inst-hero-buttons">
            <Link to="/resources" className="inst-btn inst-btn-primary">
              Explore Resources
            </Link>
            <Link to="/funding" className="inst-btn inst-btn-secondary">
              Get Funding
            </Link>
          </div>
        </div>

        <div className="inst-hero-card fade-in from-right delay-2">
          <div className="inst-hero-icon" aria-hidden="true">
            {'</>'}
          </div>
          <h2>Learn. Write. Secure.</h2>
          <p>Start your future with the right skills and knowledge to succeed.</p>
        </div>
      </section>

      <section className="inst-about fade-in from-bottom" id="about">
        <p className="inst-section-label">About us</p>
        <h2>Building Knowledge for a Successful Future</h2>
        <p>
          At Beyond Tomorrow, we are dedicated to empowering students with the skills and
          knowledge they need to thrive in the digital age. Our platform provides access to a
          wide range of resources, applications, and funding opportunities to help students
          succeed in their higher education journey, so that they can easily access the
          tertiary education they desire.
        </p>
      </section>

      <section className="inst-programmes" id="programmes">
        <div className="fade-in from-top">
          <p className="inst-section-label">Higher institutions</p>
          <h2>
            Find the best tertiary institution for <strong>you</strong>
          </h2>
        </div>

        <div className="inst-cards">
          {INSTITUTION_GROUPS.map((group, index) => (
            <article
              className={`inst-card fade-in ${CARD_DIRECTIONS[index % 3]} ${CARD_DELAYS[index % 3]}`}
              key={group.id}
            >
              <h3>{group.title}</h3>
              <ImageSlider images={group.images} label={`${group.title} examples`} />
              <Link to={APPLY_PATH} className="inst-card-link">
                Apply now &rarr;
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="inst-cta fade-in from-bottom" id="contact">
        <h2>Ready to Start Your Journey?</h2>
        <p>Take your first step towards a future in Tertiary education.</p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="inst-btn inst-btn-primary">
          Contact Us
        </a>
      </section>
    </div>
  );
}
