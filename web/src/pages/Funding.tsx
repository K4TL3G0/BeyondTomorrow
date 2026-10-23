import { useEffect, useState } from 'react';
import {
  FILTERS,
  OPPORTUNITIES,
  type FundingFilter,
  type Opportunity,
} from '../data/fundingOpportunities';
import { ParticleWaveBackground } from '../components/ParticleWaveBackground';
import { supabase } from '../lib/supabase';
import '../styles/funding.css';

interface FundingSourceRecord {
  id: string;
  name: string;
  type: 'bursary' | 'loan';
  description: string;
  income_ceiling: number | null;
  disability_income_ceiling: number | null;
  eligible_fields: string[];
  eligible_provinces: string[];
  min_average: number | null;
  deadline: string | null;
  source_url: string | null;
  last_verified: string | null;
}

type FundingSourceTypeFilter = 'all' | FundingSourceRecord['type'];

const formatRand = (amount: number) =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string | null) => {
  if (!date) return 'Not specified';
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? 'Not specified'
    : new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(parsed);
};

function FundingSources() {
  const [sources, setSources] = useState<FundingSourceRecord[]>([]);
  const [filter, setFilter] = useState<FundingSourceTypeFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadSources() {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('funding_sources')
        .select(
          'id, name, type, description, income_ceiling, disability_income_ceiling, eligible_fields, eligible_provinces, min_average, deadline, source_url, last_verified',
        )
        .returns<FundingSourceRecord[]>()
        .order('deadline', { ascending: true, nullsFirst: false });

      if (!active) return;

      if (queryError) {
        setError(`Could not load funding data: ${queryError.message}`);
        setSources([]);
      } else {
        setSources(data ?? []);
      }
      setLoading(false);
    }

    void loadSources();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const visibleSources = sources.filter((source) => filter === 'all' || source.type === filter);

  return (
    <section className="database-funding" aria-labelledby="database-funding-heading">
      <div className="database-funding-heading">
        <div>
          <p className="eyebrow">Funding data</p>
          <h2 id="database-funding-heading">Bursaries and loans</h2>
          <p className="intro">
            Funding details maintained in the database. Confirm each opportunity with its source
            before applying.
          </p>
        </div>
      </div>

      <div className="source-filters" role="group" aria-label="Filter database funding">
        {([
          ['all', 'All funding'],
          ['bursary', 'Bursaries'],
          ['loan', 'Loans'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`filter-button${filter === value ? ' active' : ''}`}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {filter !== 'all' && <StudentLoanGuide />}

      {loading && (
        <p className="funding-status" role="status">
          Loading funding data…
        </p>
      )}

      {!loading && error && (
        <div className="funding-status funding-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="funding-retry"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && visibleSources.length === 0 && (
        <p className="funding-status">
          {sources.length === 0
            ? 'No funding sources have been added yet.'
            : `No ${filter === 'bursary' ? 'bursaries' : 'loans'} have been added yet.`}
        </p>
      )}

      {!loading && !error && visibleSources.length > 0 && (
        <div className="funding-source-grid">
          {visibleSources.map((source) => {
            const isSample =
              source.name.toLowerCase().includes('sample data') ||
              source.source_url?.includes('example.com');

            return (
              <article className="funding-source-card" key={source.id}>
                <div className="funding-source-card-heading">
                  <span className="source-type">{source.type}</span>
                  {isSample && <span className="sample-data-badge">Sample data</span>}
                </div>
                <h3>{source.name}</h3>
                {source.description && (
                  <p className="funding-source-description">{source.description}</p>
                )}
                <dl className="funding-criteria">
                  <div>
                    <dt>Income ceiling</dt>
                    <dd>
                      {source.income_ceiling === null
                        ? 'Not specified'
                        : formatRand(source.income_ceiling)}
                    </dd>
                  </div>
                  <div>
                    <dt>Ceiling for applicants with disabilities</dt>
                    <dd>
                      {source.disability_income_ceiling === null
                        ? 'Not specified'
                        : formatRand(source.disability_income_ceiling)}
                    </dd>
                  </div>
                  <div>
                    <dt>Eligible fields</dt>
                    <dd>
                      {source.eligible_fields.length
                        ? source.eligible_fields.join(', ')
                        : source.type === 'loan'
                          ? 'Check provider'
                          : 'Any field'}
                    </dd>
                  </div>
                  <div>
                    <dt>Eligible provinces</dt>
                    <dd>
                      {source.eligible_provinces.length
                        ? source.eligible_provinces.join(', ')
                        : source.type === 'loan'
                          ? 'Check provider'
                          : 'Any province'}
                    </dd>
                  </div>
                  <div>
                    <dt>Minimum average</dt>
                    <dd>
                      {source.min_average === null
                        ? 'Not specified'
                        : `${source.min_average}%`}
                    </dd>
                  </div>
                  <div>
                    <dt>Application deadline</dt>
                    <dd>{formatDate(source.deadline)}</dd>
                  </div>
                </dl>
                <div className="funding-source-meta">
                  <span>Last verified: {formatDate(source.last_verified)}</span>
                  {source.source_url && (
                    <a href={source.source_url} target="_blank" rel="noopener noreferrer">
                      Check source <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function StudentLoanGuide() {
  return (
    <section className="student-loan-guide" aria-labelledby="student-loan-guide-heading">
      <div className="student-loan-guide-copy">
        <p className="eyebrow">Before you borrow</p>
        <h2 id="student-loan-guide-heading">How student loans work in South Africa</h2>
        <p>
          A student loan is borrowed money that must be repaid, usually with interest and possibly
          fees. Depending on the lender and product, it may pay study costs directly or provide
          funding for approved expenses. A bursary is different: it generally does not need to be
          repaid if its conditions are met.
        </p>
        <p>
          South African options include government student-loan schemes, bank study loans and
          alternative private student finance. Providers set their own eligibility, affordability,
          surety and repayment rules, so do not assume one provider’s terms apply to another.
        </p>
      </div>
      <div className="loan-checklist">
        <h3>Compare these details before applying</h3>
        <ul>
          <li>Total amount repayable, interest rate and all fees</li>
          <li>Whether a parent, sponsor or other surety is required</li>
          <li>Which study costs are covered and how the money is paid</li>
          <li>When repayments begin and what the monthly instalment will be</li>
          <li>What happens if you pause or do not complete your studies</li>
        </ul>
      </div>
      <p className="loan-guide-source">
        Summary adapted from the{' '}
        <a
          href="https://www.regenesys.net/reginsights/best-student-loans-in-south-africa"
          target="_blank"
          rel="noopener noreferrer"
        >
          Regenesys guide to student loans in South Africa
        </a>
        . It is general guidance, not financial advice. Verify product details and get the full
        agreement from the lender before signing.
      </p>
    </section>
  );
}

function OpportunityLogo({ item }: { item: Opportunity }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = item.title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <span className="opportunity-logo">
      {imageFailed ? (
        <span className="opportunity-logo-fallback" aria-hidden="true">{initials}</span>
      ) : (
        <img
          className="opportunity-logo-image"
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(item.logoDomain)}&sz=128`}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      )}
    </span>
  );
}

function OpportunityCard({ item }: { item: Opportunity }) {
  const isExternal = !item.url.startsWith('mailto:');

  return (
    <a
      className={`expandable-box${isExternal ? '' : ' informational-card'}`}
      href={item.url}
      aria-label={item.ariaLabel}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <OpportunityLogo item={item} />
      <span className="card-tag">{item.tag}</span>
      <h3>{item.title}</h3>
      <p className="card-description">{item.description}</p>
      <span className="card-action">
        {item.actionLabel} <span aria-hidden="true">↗</span>
      </span>
    </a>
  );
}

export function Funding() {
  const [filter, setFilter] = useState<FundingFilter>('all');

  const visible = OPPORTUNITIES.filter(
    (item) => filter === 'all' || item.categories.includes(filter),
  );

  return (
    <div className="funding-page">
      <section className="hero">
        <ParticleWaveBackground density={0.65} className="funding-wave" />
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Your future starts now</p>
            <h1>
              Find Funding.
              <br />
              Build Your <span>Future.</span>
            </h1>
            <p>
              Explore scholarships, bursaries and study opportunities in South Africa and abroad.
              Compare the options below, then select a card to visit the provider’s website.
            </p>
          </div>
          <aside className="hero-feature" aria-label="Funding opportunities feature">
            <span className="feature-symbol" aria-hidden="true">
              ↗
            </span>
            <h2>Learn. Apply. Succeed.</h2>
            <p>Your future starts with the right opportunity and support.</p>
          </aside>
        </div>
      </section>

      <FundingSources />

      <section className="content-section" id="opportunities">
        <div className="section-heading">
          <p className="eyebrow">Explore your options</p>
          <h2>Study resources and funding websites</h2>
          <p className="intro">
            These curated links are separate from the live database funding records above. Use the
            category buttons to narrow the list.
          </p>
        </div>

        <div className="filters" role="group" aria-label="Filter opportunities">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`filter-button${filter === value ? ' active' : ''}`}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="expandable-boxes">
          {visible.map((item) => (
            <OpportunityCard key={item.id} item={item} />
          ))}
        </div>

        {visible.length === 0 && (
          <p className="no-results">
            No opportunities match this filter. Please choose another category.
          </p>
        )}

        <p className="disclaimer">
          <strong>Important:</strong> These cards link to external websites. Funding availability
          and application dates may change. Always verify details and apply through the official
          provider where possible.
        </p>
      </section>
    </div>
  );
}

export default Funding;