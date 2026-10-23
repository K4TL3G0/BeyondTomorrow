import { useEffect } from 'react';
import { ParticleWaveBackground } from '../../components/ParticleWaveBackground';
import { DocumentChecklist } from './components/DocumentChecklist';
import { InstitutionCard } from './components/InstitutionCard';
import { InstitutionFilters } from './components/InstitutionFilters';
import { institutions } from './data/institutions';
import { useInstitutionFilters } from './hooks/useInstitutionFilters';
import './applications.css';

export default function ApplicationsPage() {
  const filters = useInstitutionFilters(institutions);
  const { filtered, reset } = filters;

  useEffect(() => {
    document.title = 'Applications | BeyondTomorrow';
  }, []);

  return (
    <div className="bt-app">
      <a className="bt-skip" href="#main-content">
        Skip to content
      </a>

      <section className="bt-hero" aria-labelledby="page-title">
        <ParticleWaveBackground />
        <div className="bt-wrap">
          <p className="bt-eyebrow">Your future starts with one step</p>
          <h1 id="page-title">Find your next chapter.</h1>
          <p className="bt-lead">
            Explore South African universities and TVET colleges. Find an official
            institution website, review application requirements, and get your
            documents ready.
          </p>
          <div className="bt-hero-actions">
            <a className="bt-btn" href="#institutions">
              Explore institutions
            </a>
            <a className="bt-btn bt-btn-secondary" href="#document-checklist">
              My document checklist
            </a>
          </div>
        </div>
      </section>

      <main id="main-content" className="bt-wrap">
        
        <div className="bt-layout">
          <section id="institutions" aria-labelledby="institutions-heading">
            <h2 id="institutions-heading">Explore institutions</h2>
            <p className="bt-sub">
              Search by institution name, abbreviation, province or type. No account
              needed.
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

            {filtered.length > 0 ? (
              <div className="bt-grid">
                {filtered.map((item) => (
                  <InstitutionCard key={item.id} institution={item} />
                ))}
              </div>
            ) : (
              <div className="bt-empty">
                <h3>No matching institutions</h3>
                <p>
                  Try a shorter search or select a different province or institution
                  type.
                </p>
                <button className="bt-btn" type="button" onClick={reset}>
                  Reset search
                </button>
              </div>
            )}
          </section>

          <DocumentChecklist />
        </div>
      </main>

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