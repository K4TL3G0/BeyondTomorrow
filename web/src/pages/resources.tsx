import { BookOpenCheck } from 'lucide-react';
import { Hero } from '../components/Hero';

interface ResourceGuide {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  sourceName: string;
  sourceUrl: string;
  lastVerified: string;
}

const RESOURCES: ResourceGuide[] = [
  {
    id: 'r1',
    category: 'Scam Safety',
    title: 'How to Identify and Avoid Bursary and NSFAS Scams',
    summary: 'Protect yourself from fraudulent schemes demanding upfront fees or personal banking PINs.',
    content: 'Scammers frequently target matriculants during application season. Official government and university portals never charge an application fee for NSFAS or request money to "expedite" your bursary approval. Always verify that URLs end in .ac.za or .gov.za.',
    sourceName: 'DHET / NSFAS Official Guidance',
    sourceUrl: 'https://www.nsfas.org.za',
    lastVerified: '2026-10-15',
  },
  {
    id: 'r2',
    category: 'Applications',
    title: 'Step-by-Step Guide to University & TVET Admissions',
    summary: 'Everything you need to know about opening applications, admission requirements, and offer letters.',
    content: 'Ensure you apply to at least two institutions (one university and one TVET college) to maximize your options. Keep digital copies of your ID, latest results, and guardian details ready before starting online forms.',
    sourceName: 'Department of Higher Education and Training',
    sourceUrl: 'https://www.dhet.gov.za',
    lastVerified: '2026-10-12',
  },
  {
    id: 'r3',
    category: 'Funding',
    title: 'Understanding NSFAS Allowances and Qualifying Criteria',
    summary: 'A breakdown of tuition, accommodation, book, and living allowances for qualifying students.',
    content: 'Students with a household income under R350,000 per year (or R600,000 for students living with disabilities) may qualify for comprehensive NSFAS financial support covering tuition, meals, learning materials, and accommodation.',
    sourceName: 'National Student Financial Aid Scheme',
    sourceUrl: 'https://www.nsfas.org.za',
    lastVerified: '2026-10-14',
  },
];

export default function Resources() {
  return (
    <div className="page-wrapper">
      <Hero
        eyebrow="Knowledge & Guidance"
        title={
          <h1>
            Student <span>Resources.</span>
          </h1>
        }
        description="Access curated study guides, application tips, and verified scam-safety warnings for South African tertiary students."
        feature={{
          symbol: <BookOpenCheck size={28} strokeWidth={1.8} />,
          title: 'Verified Guides.',
          description: 'Reliable information and advice to guide your tertiary journey every step of the way.',
        }}
      />

      <div className="page-content">
        <section style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius)' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🛡️</span> Scam Safety Notice
            </h3>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
              Never pay anyone claiming they can secure your university admission or NSFAS bursary for a fee. Official applications are processed directly through verified `.ac.za` or `.gov.za` portals only.
            </p>
          </div>
        </section>

        <section>
          <h2>Curated Guides &amp; References</h2>
          <p className="muted" style={{ marginBottom: '1.5rem' }}>
            All resources are verified against official government and institutional sources.
          </p>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {RESOURCES.map((guide) => (
              <article key={guide.id} className="card" style={{ padding: '1.75rem', display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', fontWeight: 700 }}>
                    {guide.category}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Last verified: {guide.lastVerified}
                  </span>
                </div>

                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{guide.title}</h3>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '1rem' }}>{guide.summary}</p>
                <p className="muted" style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>{guide.content}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--line)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Source: {guide.sourceName}</span>
                  <a
                    href={guide.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Visit official source ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
