import { useEffect, useMemo, useState } from 'react';
import type { Province } from '@beyond-tomorrow/engine';
import { PROVINCES } from '@beyond-tomorrow/engine';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface InstitutionRow {
  id: string;
  name: string;
  aps_method_code: string;
  source_url: string | null;
  last_verified: string | null;
}

interface CourseRow {
  id: string;
  institution_id: string;
  name: string;
  field_tags: string[];
  min_aps: number;
  province: Province | null;
  application_deadline: string | null;
  application_url: string | null;
  source_url: string | null;
  last_verified: string | null;
}

interface BandRow {
  institution_id: string;
  min_mark: number;
  max_mark: number;
  points: number;
}

interface RequirementRow {
  course_id: string;
  subject_id: string;
  min_mark: number;
}

interface SubjectRow {
  id: string;
  code: string;
  name: string;
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

function readableDate(value: string | null): string {
  if (!value) return 'Not listed';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? 'Not listed' : new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(date);
}

export default function Pathways() {
  const { session } = useAuth();
  const [institutions, setInstitutions] = useState<InstitutionRow[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [bands, setBands] = useState<BandRow[]>([]);
  const [requirements, setRequirements] = useState<RequirementRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState<Province | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      const [institutionResult, courseResult, bandResult, requirementResult, subjectResult] = await Promise.all([
        supabase.from('institutions').select('id,name,aps_method_code,source_url,last_verified').order('name'),
        supabase.from('courses').select('id,institution_id,name,field_tags,min_aps,province,application_deadline,application_url,source_url,last_verified').order('name'),
        supabase.from('aps_bands').select('institution_id,min_mark,max_mark,points'),
        supabase.from('course_requirements').select('course_id,subject_id,min_mark'),
        supabase.from('subjects').select('id,code,name').order('name'),
      ]);
      if (!active) return;
      const failed = institutionResult.error || courseResult.error || bandResult.error || requirementResult.error || subjectResult.error;
      if (failed) {
        setError(failed.message);
      } else {
        setInstitutions((institutionResult.data ?? []) as InstitutionRow[]);
        setCourses((courseResult.data ?? []) as CourseRow[]);
        setBands((bandResult.data ?? []) as BandRow[]);
        setRequirements((requirementResult.data ?? []) as RequirementRow[]);
        setSubjects((subjectResult.data ?? []) as SubjectRow[]);
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [session?.user.id]);

  const institutionMap = useMemo(() => new Map(institutions.map((item) => [item.id, item])), [institutions]);
  const subjectMap = useMemo(() => new Map(subjects.map((item) => [item.id, item])), [subjects]);
  const filteredCourses = useMemo(() => {
    const terms = search.trim().toLocaleLowerCase('en-ZA').split(/\s+/).filter(Boolean);
    return courses.filter((course) => {
      const institution = institutionMap.get(course.institution_id);
      const haystack = `${course.name} ${course.field_tags.join(' ')} ${institution?.name ?? ''}`.toLocaleLowerCase('en-ZA');
      return terms.every((term) => haystack.includes(term)) && (!province || course.province === province);
    });
  }, [courses, institutionMap, province, search]);

  if (loading) return <section><h1>Pathways</h1><p>Loading course and admissions data…</p></section>;

  return (
    <section className="db-stack">
      <div>
        <h1>Course pathways</h1>
        <p className="muted">Explore courses, published APS thresholds, subject requirements and application links from the database. APS thresholds are not an eligibility decision; check the current official prospectus.</p>
      </div>
      {error && <p role="alert" className="db-message db-message--error">Could not load course data: {error}</p>}
      {!error && (
        <>
          <div className="card db-form-grid">
            <label>Search courses or institutions
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. engineering, Demo University" />
            </label>
            <label>Course location
              <select value={province} onChange={(event) => setProvince(event.target.value as Province | '')}>
                <option value="">All provinces</option>
                {PROVINCES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <p role="status" aria-live="polite">{filteredCourses.length} of {courses.length} courses</p>
          {courses.length === 0 ? (
            <div className="card"><h2>No courses in the database yet</h2><p>Course details will appear here after an administrator adds verified reference data.</p></div>
          ) : filteredCourses.length === 0 ? (
            <div className="card"><h2>No matching courses</h2><p>Try another search term or clear the province filter.</p></div>
          ) : (
            <div className="db-card-grid">
              {filteredCourses.map((course) => {
                const institution = institutionMap.get(course.institution_id);
                const courseRequirements = requirements.filter((item) => item.course_id === course.id);
                const courseBands = bands.filter((item) => item.institution_id === course.institution_id)
                  .sort((a, b) => b.min_mark - a.min_mark);
                const applicationUrl = safeExternalUrl(course.application_url);
                const sourceUrl = safeExternalUrl(course.source_url ?? institution?.source_url ?? null);
                return (
                  <article className="card db-course-card" key={course.id}>
                    <p className="db-eyebrow">{institution?.name ?? 'Institution'}</p>
                    <h2>{course.name}</h2>
                    <dl className="db-details">
                      <div><dt>Minimum APS</dt><dd>{course.min_aps}</dd></div>
                      <div><dt>Province</dt><dd>{course.province ?? 'Not specified'}</dd></div>
                      <div><dt>Application deadline</dt><dd>{readableDate(course.application_deadline)}</dd></div>
                      <div><dt>Last verified</dt><dd>{readableDate(course.last_verified ?? institution?.last_verified ?? null)}</dd></div>
                    </dl>
                    {course.field_tags.length > 0 && <p><strong>Fields:</strong> {course.field_tags.join(', ')}</p>}
                    <h3>Subject requirements</h3>
                    {courseRequirements.length ? (
                      <ul>{courseRequirements.map((item) => {
                        const subject = subjectMap.get(item.subject_id);
                        return <li key={item.subject_id}>{subject?.name ?? subject?.code ?? 'Subject'}: {item.min_mark}% minimum</li>;
                      })}</ul>
                    ) : <p className="muted">No subject requirements recorded.</p>}
                    {courseBands.length > 0 && (
                      <details>
                        <summary>Institution APS mark bands</summary>
                        <ul>{courseBands.map((band) => <li key={`${band.min_mark}-${band.max_mark}`}>{band.min_mark}–{band.max_mark}%: {band.points} point(s)</li>)}</ul>
                        <p className="muted">APS method: {institution?.aps_method_code}. Bands alone do not define the institution’s complete APS rules.</p>
                      </details>
                    )}
                    <p className="muted">Entry requirements may vary by programme and year. This catalogue does not calculate admission eligibility.</p>
                    <div className="db-card-links">
                      {applicationUrl && <a href={applicationUrl} target="_blank" rel="noopener noreferrer">Application portal (new tab)</a>}
                      {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer">Reference source (new tab)</a>}
                    </div>
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
