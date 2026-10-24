import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Resources.css';

type ResourceType = 'youtube' | 'notes' | 'pastPapers';

type Subject = {
  name: string;
  category: string;
  resourceLinks?: Partial<Record<ResourceType, string>>;
};

const subjectGroups: { category: string; subjects: string[] }[] = [
  {
    category: 'Core subjects',
    subjects: ['Life Orientation', 'Mathematics', 'Mathematical Literacy'],
  },
  {
    category: 'Languages',
    subjects: [
      'Afrikaans Home Language',
      'Afrikaans First Additional Language',
      'English Home Language',
      'English First Additional Language',
      'isiNdebele Home Language',
      'isiNdebele First Additional Language',
      'isiXhosa Home Language',
      'isiXhosa First Additional Language',
      'isiZulu Home Language',
      'isiZulu First Additional Language',
      'Sepedi Home Language',
      'Sepedi First Additional Language',
      'Sesotho Home Language',
      'Sesotho First Additional Language',
      'Setswana Home Language',
      'Setswana First Additional Language',
      'siSwati Home Language',
      'siSwati First Additional Language',
      'Tshivenda Home Language',
      'Tshivenda First Additional Language',
      'Xiitsonga Home Language',
      'Xiitsonga First Additional Language',
    ],
  },
  {
    category: 'Commerce and Management',
    subjects: ['Accounting', 'Business Studies', 'Economics'],
  },
  {
    category: 'Agriculture',
    subjects: ['Agricultural Management Practices', 'Agricultural Sciences', 'Agricultural Technology'],
  },
  {
    category: 'Science and technology',
    subjects: [
      'Computer Applications Technology',
      'Civil Technology',
      'Electrical Technology',
      'Engineering Graphics and Design',
      'Information Technology',
      'Life Sciences',
      'Mechanical Technology',
      'Physical Sciences',
      'Technical Mathematics',
      'Technical Sciences',
    ],
  },
  {
    category: 'Humanities and social sciences',
    subjects: ['Geography', 'History', 'Religion Studies', 'Tourism'],
  },
  {
    category: 'Arts and culture',
    subjects: ['Dance Studies', 'Design', 'Dramatic Arts', 'Music', 'Visual Arts'],
  },
  {
    category: 'Consumer studies and hospitality',
    subjects: ['Consumer Studies', 'Hospitality Studies'],
  },
];

const resourceTypes: { id: ResourceType; label: string }[] = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'notes', label: 'Notes' },
  { id: 'pastPapers', label: 'Past papers' },
];

const subjects: Subject[] = subjectGroups.flatMap(({ category, subjects: names }) =>
  names.map((name) => ({ name, category })),
);

function getSubjectSlug(name: string) {
  return name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function SubjectIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 6.5C9.5 4.7 6.3 4.5 3 5.5v14c3.3-1 6.5-.8 9 1 2.5-1.8 5.7-2 9-1v-14c-3.3-1-6.5-.8-9 1Z" />
      <path d="M12 6.5v14" />
    </svg>
  );
}

function SubjectCard({ subject, number }: { subject: Subject; number: number }) {
  return (
    <Link
      className="resource-card subject-card-link"
      to={`/resources/${getSubjectSlug(subject.name)}`}
      aria-label={`Open ${subject.name} resources`}
    >
      <div className="resource-card-top">
        <span className="resource-icon">
          <SubjectIcon />
        </span>
        <span className="resource-number">{String(number).padStart(2, '0')}</span>
      </div>

      <p className="resource-category">{subject.category}</p>
      <h3>{subject.name}</h3>
      <p className="resource-description">Study support for Grades 10–12.</p>
      <span className="subject-card-action">
        View subject resources <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const filteredSubjects = subjects.filter((subject) =>
    `${subject.name} ${subject.category}`.toLocaleLowerCase().includes(normalizedSearch),
  );
  let subjectNumber = 0;

  return (
    <section className="page resources-page" aria-labelledby="resources-title">
      <section className="resources-hero">
        <div className="resources-hero-copy">
          <p className="resources-kicker">Your next step starts here</p>
          <h1 id="resources-title">Study smarter, your way.</h1>
          <p className="resources-intro">
            Find your Grade 10–12 subjects, then choose the study support you need. YouTube
            channels, notes and past papers will be added as the links are collected.
          </p>
        </div>
      </section>

      <section className="resources-section" aria-labelledby="subjects-title">
        <div className="resources-header">
          <div>
            <p className="resources-section-label">A place to start</p>
            <h2 id="subjects-title">Study resources by subject</h2>
          </div>
          <p>Browse subjects or search by name to find your study resources.</p>
        </div>

        <label className="subject-search">
          <span>Find a subject</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search subjects"
          />
        </label>

        <p className="subject-count" aria-live="polite">
          Showing {filteredSubjects.length} of {subjects.length} subjects
        </p>

        <div className="subject-groups">
          {subjectGroups.map(({ category }) => {
            const groupSubjects = filteredSubjects.filter((subject) => subject.category === category);
            if (groupSubjects.length === 0) return null;
            const groupId = category.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-');

            return (
              <section className="subject-group" key={category} aria-labelledby={`group-${groupId}`}>
                <h3 id={`group-${groupId}`}>{category}</h3>
                <div className="resources-grid">
                  {groupSubjects.map((subject) => {
                    subjectNumber += 1;
                    return (
                      <SubjectCard
                        key={subject.name}
                        subject={subject}
                        number={subjectNumber}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {filteredSubjects.length === 0 && (
          <p className="subject-empty">No subjects match “{searchTerm}”. Try another search.</p>
        )}

        <p className="resources-note">
          Subject availability can vary by school and curriculum. Confirm your subject offering
          with your school.
        </p>
      </section>
    </section>
  );
}

export function SubjectResources() {
  const { subjectSlug } = useParams();
  const subject = subjects.find((item) => getSubjectSlug(item.name) === subjectSlug);

  if (!subject) {
    return (
      <section className="page resources-page">
        <div className="subject-detail-empty">
          <h1>Subject not found</h1>
          <p>That subject isn’t in the directory.</p>
          <Link to="/resources">Back to all subjects</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page resources-page" aria-labelledby="subject-title">
      <Link className="subject-back-link" to="/resources">
        <span aria-hidden="true">←</span> All subjects
      </Link>

      <section className="resources-hero">
        <div className="resources-hero-copy">
          <p className="resources-kicker">{subject.category}</p>
          <h1 id="subject-title">{subject.name}</h1>
          <p className="resources-intro">
            Find videos, notes and past papers to support your {subject.name} studies.
          </p>
        </div>
      </section>

      <section className="resources-section" aria-labelledby="subject-resources-title">
        <div className="resources-header">
          <div>
            <p className="resources-section-label">Study support</p>
            <h2 id="subject-resources-title">{subject.name} resources</h2>
          </div>
          <p>Choose a resource type to find the support you need.</p>
        </div>

        <div className="subject-detail-grid">
          {resourceTypes.map(({ id, label }) => {
            const href = subject.resourceLinks?.[id];

            return (
              <article className="subject-detail-card" key={id}>
                <span className="subject-detail-icon">
                  <SubjectIcon />
                </span>
                <h3>{label}</h3>
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    Open {label.toLocaleLowerCase()} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <p>Resources for this subject will be added here.</p>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
