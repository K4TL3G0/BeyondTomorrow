import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand-section">
          <Link to="/" className="footer-brand">
            <img src="/logo.svg" alt="Beyond Tomorrow Logo" />
            <span>Beyond Tomorrow</span>
          </Link>
          <p className="footer-tagline">
            Helping young South Africans find a study pathway, fund it, and finish it through to graduation.
          </p>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h3>Platform</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/pathways">Pathways & APS</Link></li>
              <li><Link to="/applications">Applications</Link></li>
              <li><Link to="/funding">Funding & NSFAS</Link></li>
              <li><Link to="/checklist">Checklist & Deadlines</Link></li>
              <li><Link to="/resources">Resources & Guides</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Official Resources</h3>
            <ul>
              <li><a href="https://www.nsfas.org.za" target="_blank" rel="noopener noreferrer">NSFAS Portal</a></li>
              <li><a href="https://www.dhet.gov.za" target="_blank" rel="noopener noreferrer">DHET South Africa</a></li>
              <li><a href="https://www.saqa.org.za" target="_blank" rel="noopener noreferrer">SAQA Qualifications</a></li>
              <li><a href="https://www.usaf.ac.za" target="_blank" rel="noopener noreferrer">Universities South Africa</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Disclaimer & Legal</h3>
            <p className="footer-disclaimer">
              Beyond Tomorrow provides guidance estimates based on published institution criteria and funding thresholds. Final admission and financial aid decisions rest solely with tertiary institutions and funding bodies. Verify all critical dates and requirements directly.
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>© {currentYear} Beyond Tomorrow. Built with care for South African students.</p>
          <div className="footer-bottom-links">
            <span className="muted">Last verified data: 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
