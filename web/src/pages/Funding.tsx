import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface FundingSourceRow {
  id: string;
  name: string;
  type: 'bursary' | 'loan';
  income_ceiling: number | null;
  disability_income_ceiling: number | null;
  eligible_fields: string[];
  eligible_provinces: string[];
  min_average: number | null;
  deadline: string | null;
  source_url: string | null;
  last_verified: string | null;
}

interface StudentProfileRow {
  income_bracket: string | null;
  province: string | null;
  interests: string[];
}

function safeExternalUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function formatDate(value: string | null): string {
  if (!value) return 'Not listed';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? 'Not listed' : new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(date);
}

function formatAmount(value: number | null): string {
  return value === null ? 'Not specified' : `R${new Intl.NumberFormat('en-ZA').format(value)}`;
}

function incomeSummary(profile: StudentProfileRow | null): string {
  if (!profile?.income_bracket) return 'Add an income bracket in Your details to compare it with the published criteria.';
  switch (profile.income_bracket) {
    case 'up_to_350k': return 'Your saved bracket is up to R350,000. Check each funder’s full criteria; this is not an eligibility decision.';
    case '350k_to_600k': return 'Your saved bracket is R350,000–R600,000. Some records list a separate disability threshold; no disability details are stored here.';
    case 'above_600k': return 'Your saved bracket is above R600,000. Review each funder’s criteria and confirm directly with the provider.';
    default: return 'Your saved preference is not to specify income. Review each provider’s criteria directly.';
  }
}

export default function Funding() {
  const { session } = useAuth();
  const [sources, setSources] = useState<FundingSourceRow[]>([]);
  const [profile, setProfile] = useState<StudentProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      if (!session?.user.id) return;
      setLoading(true);
      setError('');
      const [sourcesResult, profileResult] = await Promise.all([
        supabase.from('funding_sources').select('id,name,type,income_ceiling,disability_income_ceiling,eligible_fields,eligible_provinces,min_average,deadline,source_url,last_verified').order('deadline'),
        supabase.from('student_profiles').select('income_bracket,province,interests').eq('id', session.user.id).maybeSingle(),
      ]);
      if (!active) return;
      const failed = sourcesResult.error || profileResult.error;
      if (failed) setError(failed.message);
      else {
        setSources((sourcesResult.data ?? []) as FundingSourceRow[]);
        setProfile((profileResult.data ?? null) as StudentProfileRow | null);
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [session?.user.id]);

  if (loading) return <section><h1>Funding</h1><p>Loading funding sources…</p></section>;

  return (
    <section className="db-stack">
      <div>
        <h1>Funding sources</h1>
        <p className="muted">Review bursaries and loans stored in the database, including their published limits, deadlines and verification dates.</p>
      </div>
      {error && <p role="alert" className="db-message db-message--error">Could not load funding data: {error}</p>}
      {!error && (
        <>
          <div className="card">
            <h2>Your profile context</h2>
            <p>{incomeSummary(profile)}</p>
            {profile?.province && <p><strong>Province:</strong> {profile.province}</p>}
            {profile?.interests.length ? <p><strong>Interests:</strong> {profile.interests.join(', ')}</p> : null}
            <p className="muted">This page lists criteria only. It does not predict approval or determine eligibility. Confirm current requirements with the provider.</p>
          </div>
          {sources.length === 0 ? (
            <div className="card"><h2>No funding sources listed</h2><p>Verified funding opportunities will appear here when reference data is added.</p></div>
          ) : (
            <div className="db-card-grid">
              {sources.map((source) => {
                const sourceUrl = safeExternalUrl(source.source_url);
                return (
                  <article className="card db-course-card" key={source.id}>
                    <p className="db-eyebrow">{source.type === 'bursary' ? 'Bursary' : 'Loan'}</p>
                    <h2>{source.name}</h2>
                    <dl className="db-details">
                      <div><dt>Income ceiling</dt><dd>{formatAmount(source.income_ceiling)}</dd></div>
                      <div><dt>Disability income ceiling</dt><dd>{formatAmount(source.disability_income_ceiling)}</dd></div>
                      <div><dt>Minimum average</dt><dd>{source.min_average === null ? 'Not specified' : `${source.min_average}%`}</dd></div>
                      <div><dt>Deadline</dt><dd>{formatDate(source.deadline)}</dd></div>
                      <div><dt>Last verified</dt><dd>{formatDate(source.last_verified)}</dd></div>
                    </dl>
                    <p><strong>Eligible fields:</strong> {source.eligible_fields.length ? source.eligible_fields.join(', ') : 'Any field listed by the provider'}</p>
                    <p><strong>Eligible provinces:</strong> {source.eligible_provinces.length ? source.eligible_provinces.join(', ') : 'Any province listed by the provider'}</p>
                    {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer">Check provider website (new tab)</a>}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
