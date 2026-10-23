import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ImageSlider, type SliderImage } from '../components/ImageSlider';
import '../styles/institutions.css';

const APPLY_PATH = '/checklist';
const CONTACT_EMAIL = 'enquiry@beytom.com';

interface InstitutionGroup {
  id: string;
  title: string;
  images: readonly SliderImage[];
}

const INSTITUTION_GROUPS: readonly InstitutionGroup[] = [
  {
    id: 'tvet',
    title: 'TVET College',
    images: [
      { src: '/institutions/tshwane-tvet.png', alt: 'Tshwane TVET College' },
      { src: '/institutions/ewc.png', alt: 'EWC TVET College' },
      { src: '/institutions/kzn-tvet.png', alt: 'KwaZulu-Natal TVET College' },
    ],
  },
  {
    id: 'private',
    title: 'Private University/College',
    images: [
      { src: '/institutions/eduvos.jpg', alt: 'Eduvos' },
      { src: '/institutions/emeris.png', alt: 'Emeris' },
      { src: '/institutions/stadio.png', alt: 'STADIO' },
    ],
  },
  {
    id: 'public',
    title: 'Public University',
    images: [
      { src: '/institutions/wits.png', alt: 'University of the Witwatersrand' },
      { src: '/institutions/up.jpg', alt: 'University of Pretoria' },
      { src: '/institutions/uct.jpg', alt: 'University of Cape Town' },
    ],
  },
];

export default function Institutions() {
  useEffect(() => {
    document.title = 'Find Your Institution | Beyond Tomorrow';
  }, []);

  return (
    <div className="inst-page">
      <section className="inst-hero" id="home">
        <div className="inst-hero-content">
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

        <div className="inst-hero-card">
          <div className="inst-hero-icon" aria-hidden="true">
            {'</>'}
          </div>
          <h2>Learn. Write. Secure.</h2>
          <p>Start your future with the right skills and knowledge to succeed.</p>
        </div>
      </section>

      <section className="inst-about" id="about">
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
        <p className="inst-section-label">Higher institutions</p>
        <h2>
          Find the best tertiary institution for <strong>you</strong>
        </h2>

        <div className="inst-cards">
          {INSTITUTION_GROUPS.map((group) => (
            <article className="inst-card" key={group.id}>
              <h3>{group.title}</h3>
              <ImageSlider images={group.images} label={`${group.title} examples`} />
              <Link to={APPLY_PATH} className="inst-card-link">
                Apply now &rarr;
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="inst-cta" id="contact">
        <h2>Ready to Start Your Journey?</h2>
        <p>Take your first step towards a future in Tertiary education.</p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="inst-btn inst-btn-primary">
          Contact Us
        </a>
      </section>
    </div>
  );
}
