import { useEffect } from 'react';
import { Hero } from '../../components/Hero';
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

      <Hero
        eyebrow="Your future starts with one step"
        title={
          <h1 id="page-title">
            Find Your Next <span>Chapter.</span>
          </h1>
        }
        description="Explore South African universities and TVET colleges. Find an official institution website, review application requirements, and get your documents ready."
        feature={{
          symbol: '🏛️',
          title: 'Apply. Prepare. Excel.',
          description: 'Direct links to official application portals and essential document checklists.',
        }}
      />

      <section id="main-content" className="bt-wrap bt-main-content">
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
