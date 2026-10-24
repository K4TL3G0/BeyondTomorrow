import { useEffect, useState } from 'react';
import { Landmark } from 'lucide-react';
import { Hero } from '../../components/Hero';
import { DocumentChecklist } from './components/DocumentChecklist';
import { InstitutionCard } from './components/InstitutionCard';
import { InstitutionFilters } from './components/InstitutionFilters';
import { institutions } from './data/institutions';
import { useInstitutionFilters } from './hooks/useInstitutionFilters';
import { useDocumentChecklist } from './hooks/useDocumentChecklist';
import './applications.css';

export default function ApplicationsPage() {
  const filters = useInstitutionFilters(institutions);
  const { filtered, reset } = filters;
  const checklist = useDocumentChecklist();
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);

  const allChecked = checklist.completedCount === checklist.total;

  useEffect(() => {
    document.title = 'Applications | BeyondTomorrow';
  }, []);

  return (
    <div className="bt-app">
      <a className="bt-skip" href="#main-content">
        Skip to content
      </a>

      <Hero
        eyebrow="Your future starts with one step"
        title={
          <h1 id="page-title">
            Find Your Next <span>Chapter.</span>
          </h1>
        }
        description="Explore South African universities and TVET colleges. Find an official institution website, review application requirements, and get your documents ready."
        feature={{
          symbol: <Landmark size={28} strokeWidth={1.8} />,
          title: 'Apply. Prepare. Excel.',
          description: 'Direct links to official application portals and essential document checklists.',
        }}
      />

      <section id="main-content" className="bt-wrap bt-main-content">
        {/* Pulsing Glowing Hamburger Trigger Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            className={`bt-hamburger-btn ${!allChecked ? 'bt-hamburger-pulse' : ''}`}
            onClick={() => setIsChecklistOpen(!isChecklistOpen)}
            aria-expanded={isChecklistOpen}
            aria-controls="document-checklist"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span style={{ flex: 1, textAlign: 'left' }}>
              Document Checklist ({checklist.completedCount}/{checklist.total})
            </span>
            {!allChecked && (
              <span title="Action required: checklist not complete" style={{ fontSize: '1.1rem' }}>
                💡
              </span>
            )}
          </button>
        </div>

        <div className={`bt-layout ${isChecklistOpen ? 'bt-layout-with-sidebar' : 'bt-layout-full'}`}>
          <DocumentChecklist isOpen={isChecklistOpen} onClose={() => setIsChecklistOpen(false)} />

          <div className="bt-main-area" style={{ minWidth: 0 }}>
            <div className="bt-filter-area" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '1.5rem' }}>
              <h2 id="institutions-heading">Explore institutions</h2>
              <p className="bt-sub">
                Search by institution name, abbreviation, province or type. No account needed.
              </p>

              <InstitutionFilters
                search={filters.search}
                province={filters.province}
                type={filters.type}
                searchInputRef={filters.searchInputRef}
                onSearchChange={filters.setSearch}
                onProvinceChange={filters.setProvince}
                onTypeChange={filters.setType}
              />

              <div className="bt-results-bar">
                <p id="result-count" role="status" aria-live="polite" aria-atomic="true">
                  Showing {filtered.length} of {institutions.length} institutions
                </p>
                <button className="bt-link-button" type="button" onClick={reset}>
                  Clear filters
                </button>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className={`bt-grid ${isChecklistOpen ? 'bt-grid-2col' : 'bt-grid-3col'}`}>
                {filtered.map((item) => (
                  <InstitutionCard key={item.id} institution={item} />
                ))}
              </div>
            ) : (
              <div className="bt-empty">
                <h3>No matching institutions</h3>
                <p>
                  Try a shorter search or select a different province or institution type.
                </p>
                <button className="bt-btn" type="button" onClick={reset}>
                  Reset search
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bt-directory-notes bt-wrap" aria-label="Directory notes">
        <p>
          Independent student project. Not affiliated with the institutions listed.
          An APS score alone is not an offer of admission.
        </p>
        <p>
          Directory references:{' '}
          <a
            href="https://www.dhet.gov.za/SitePages/UniversitiesinSA.aspx"
            target="_blank"
            rel="noopener noreferrer"
          >
            DHET universities (new tab)
          </a>{' '}
          ·{' '}
          <a
            href="https://www.dhet.gov.za/SitePages/TVETlinks.aspx"
            target="_blank"
            rel="noopener noreferrer"
          >
            DHET TVET colleges (new tab)
          </a>
          .
        </p>
        <p>
          Province filters include campus or regional presence; Unisa is a
          distance-learning institution. Confirm that your chosen programme is
          offered at the location you need.
        </p>
      </section>
    </div>
  );
}
