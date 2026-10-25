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
            Empowering South African youth to discover higher education pathways, secure funding, and succeed through graduation.
          </p>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h3>Platform Navigation</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/pathways">Pathways & APS Calculator</Link></li>
              <li><Link to="/coach">Readiness Coach (Naledi)</Link></li>
              <li><Link to="/applications">Applications & Institutions</Link></li>
              <li><Link to="/funding">Funding & NSFAS</Link></li>
              <li><Link to="/checklist">Preflight Checklist & Deadlines</Link></li>
              <li><Link to="/resources">Resources & Guides</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Official Sited Sources</h3>
            <ul>
              <li><a href="https://www.nsfas.org.za" target="_blank" rel="noopener noreferrer">NSFAS Student Portal</a></li>
              <li><a href="https://www.dhet.gov.za" target="_blank" rel="noopener noreferrer">Dept of Higher Education (DHET)</a></li>
              <li><a href="https://www.saqa.org.za" target="_blank" rel="noopener noreferrer">South African Qualifications Authority (SAQA)</a></li>
              <li><a href="https://www.usaf.ac.za" target="_blank" rel="noopener noreferrer">Universities South Africa (USAf)</a></li>
              <li><a href="https://www.cao.ac.za" target="_blank" rel="noopener noreferrer">Central Applications Office (CAO)</a></li>
              <li><a href="https://www.nrf.ac.za" target="_blank" rel="noopener noreferrer">National Research Foundation (NRF)</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Disclaimer & Governance</h3>
            <p className="footer-disclaimer">
              Beyond Tomorrow provides guidance estimates based on published institution criteria, DHET frameworks, and NSFAS funding thresholds. Final admission and financial aid decisions rest solely with tertiary institutions and funding bodies. Verify all critical dates and requirements directly with official authorities.
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>© {currentYear} Beyond Tomorrow. Advancing informed education choices and access to opportunity for South African students.</p>
          <div className="footer-bottom-links">
            <span className="muted">Data verified: 2026 Academic Cycle</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
