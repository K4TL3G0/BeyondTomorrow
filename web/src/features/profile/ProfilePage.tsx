import { useRef, useState } from 'react';
import { ParticleWaveBackground } from '../../components/ParticleWaveBackground';
import './profile.css';

const GRADES = ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

// All subjects offered by South African high schools (CAPS curriculum)
const SUBJECTS: Record<string, string[]> = {
  'Languages': [
    'Afrikaans Home Language',
    'Afrikaans First Additional Language',
    'Afrikaans Second Additional Language',
    'English Home Language',
    'English First Additional Language',
    'English Second Additional Language',
    'IsiNdebele Home Language',
    'IsiNdebele First Additional Language',
    'IsiXhosa Home Language',
    'IsiXhosa First Additional Language',
    'IsiZulu Home Language',
    'IsiZulu First Additional Language',
    'Sepedi Home Language',
    'Sepedi First Additional Language',
    'Sesotho Home Language',
    'Sesotho First Additional Language',
    'Setswana Home Language',
    'Setswana First Additional Language',
    'Siswati Home Language',
    'Siswati First Additional Language',
    'Tshivenda Home Language',
    'Tshivenda First Additional Language',
    'Xitsonga Home Language',
    'Xitsonga First Additional Language',
    'Sign Language Home Language',
    'Arabic First Additional Language',
    'French First Additional Language',
    'German First Additional Language',
    'Hindi First Additional Language',
    'Mandarin First Additional Language',
    'Portuguese First Additional Language',
    'Tamil First Additional Language',
    'Telegu First Additional Language',
    'Urdu First Additional Language',
  ],
  'Mathematics & Science': [
    'Mathematics',
    'Mathematical Literacy',
    'Technical Mathematics',
    'Physical Sciences',
    'Technical Sciences',
    'Life Sciences',
  ],
  'Commerce': [
    'Accounting',
    'Business Studies',
    'Economics',
  ],
  'Humanities & Social Sciences': [
    'History',
    'Geography',
    'Religion Studies',
    'Philosophy',
    'Life Orientation',
  ],
  'Technology & Design': [
    'Information Technology',
    'Computer Applications Technology',
    'Engineering Graphics & Design',
    'Electrical Technology',
    'Mechanical Technology',
    'Civil Technology',
  ],
  'Arts': [
    'Visual Arts',
    'Dramatic Arts',
    'Music',
    'Dance Studies',
    'Design',
  ],
  'Technical & Vocational': [
    'Agricultural Sciences',
    'Agricultural Management Practices',
    'Agricultural Technology',
    'Consumer Studies',
    'Hospitality Studies',
    'Tourism',
    'Sport & Exercise Science',
    'Nautical Science',
  ],
};

const ALL_SUBJECTS = Object.values(SUBJECTS).flat();

const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape',
];

const CAREER_INTERESTS = [
  'Engineering & Technology',
  'Medicine & Health Sciences',
  'Business & Commerce',
  'Law & Humanities',
  'Education & Teaching',
  'Arts & Design',
  'Natural Sciences',
  'Agriculture & Environment',
  'Social Work & Community Development',
  'Not sure yet',
];

function completeness(
  displayName: string,
  school: string,
  grade: string,
  province: string,
  careerInterest: string,
  selectedSubjects: string[],
  avatarUrl: string | null,
  bio: string,
  apsGoal: string,
): number {
  const checks = [
    !!displayName,
    !!school,
    !!grade,
    !!province,
    !!careerInterest,
    selectedSubjects.length >= 5,
    !!avatarUrl,
    bio.length >= 20,
    !!apsGoal,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function ProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [province, setProvince] = useState('');
  const [careerInterest, setCareerInterest] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [apsGoal, setApsGoal] = useState('');
  const [saved, setSaved] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pct = completeness(displayName, school, grade, province, careerInterest, selectedSubjects, avatarUrl, bio, apsGoal);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  }

  function toggleSubject(subject: string) {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject],
    );
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const initials = displayName
    ? displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const filteredSubjects = subjectSearch.trim()
    ? ALL_SUBJECTS.filter((s) => s.toLowerCase().includes(subjectSearch.toLowerCase()))
    : null;

  const apsNum = parseInt(apsGoal, 10);
  const apsValid = !Number.isNaN(apsNum) && apsNum >= 15 && apsNum <= 42;

  return (
    <div className="bt-profile-page">
      {/* ── Hero ── */}
      <section className="bt-profile-hero">
        <ParticleWaveBackground density={0.65} className="bt-profile-hero__particles" />
        <div className="bt-profile-hero__content">
          <span className="bt-profile-hero__label">YOUR JOURNEY STARTS HERE</span>
          <h1 className="bt-profile-hero__title">
            Your <span className="bt-profile-hero__accent">Profile.</span>
          </h1>
          <p className="bt-profile-hero__sub">
            Tell us about yourself so Beyond Tomorrow can guide you to the right institutions,
            funding and pathways.
          </p>
        </div>
      </section>

      <main className="bt-profile-main">
        <div className="bt-profile-layout">
          <aside className="bt-profile-sidebar">
            {/* ── Avatar ── */}
            <section className="bt-profile-section">
              <h2 className="bt-profile-section__title">Profile picture</h2>
              <div className="bt-profile-avatar-row">
                <button
                  type="button"
                  className="bt-profile-avatar"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload profile picture"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="bt-profile-avatar__img" />
                  ) : (
                    <span className="bt-profile-avatar__initials">{initials}</span>
                  )}
                  <span className="bt-profile-avatar__overlay">Change</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="bt-profile-avatar__input" onChange={handleAvatarChange} />
                <div className="bt-profile-avatar__hint">
                  <p>Click to upload a photo. JPG or PNG, max 5 MB.</p>
                  <p>Your initials will show until you upload a picture.</p>
                </div>
              </div>
            </section>

            {/* ── Profile completeness summary ── */}
            <div className="bt-profile-completeness-box">
              <h3 className="bt-profile-completeness-box__title">Profile Completeness</h3>
              <div className="bt-profile-completeness-box__bar-wrap">
                <div className="bt-profile-completeness-box__bar">
                  <div className="bt-profile-completeness-box__fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="bt-profile-completeness-box__pct">{pct}% complete</span>
              </div>
              <p className="bt-profile-completeness-box__hint">
                Complete your profile to get the most out of BeyondTomorrow.
              </p>
            </div>
          </aside>

          <form className="bt-profile-form" onSubmit={handleSave}>

            {/* ── About you ── */}
            <section className="bt-profile-section">
              <h2 className="bt-profile-section__title">About you</h2>
              <div className="bt-profile-grid">
                <label className="bt-profile-field">
                  <span className="bt-profile-field__label">Display name</span>
                  <input type="text" className="bt-profile-field__input" placeholder="e.g. Thabo M." value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </label>
                <label className="bt-profile-field">
                  <span className="bt-profile-field__label">School name</span>
                  <input type="text" className="bt-profile-field__input" placeholder="e.g. Soweto High School" value={school} onChange={(e) => setSchool(e.target.value)} />
                </label>
                <label className="bt-profile-field">
                  <span className="bt-profile-field__label">Province</span>
                  <select className="bt-profile-field__input" value={province} onChange={(e) => setProvince(e.target.value)}>
                    <option value="">Select province</option>
                    {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </label>
                <label className="bt-profile-field">
                  <span className="bt-profile-field__label">Current grade</span>
                  <select className="bt-profile-field__input" value={grade} onChange={(e) => setGrade(e.target.value)}>
                    <option value="">Select grade</option>
                    {GRADES.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </label>
                <label className="bt-profile-field bt-profile-field--full">
                  <span className="bt-profile-field__label">Career interest</span>
                  <select className="bt-profile-field__input" value={careerInterest} onChange={(e) => setCareerInterest(e.target.value)}>
                    <option value="">Select an area</option>
                    {CAREER_INTERESTS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
              </div>

            {/* ── Subjects ── */}
            <div className="bt-profile-subjects-block">
              <h2 className="bt-profile-section__title">Your subjects</h2>
              <p className="bt-profile-section__sub">
                Select every subject you are currently studying. This helps us show accurate APS breakdowns for university programmes.
              </p>

              <div className="bt-profile-subject-search-wrap">
                <input
                  type="search"
                  className="bt-profile-subject-search"
                  placeholder="Search subjects…"
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                />
              </div>

              {filteredSubjects ? (
                <div className="bt-profile-subjects">
                  {filteredSubjects.length === 0
                    ? <p className="bt-profile-subjects__none">No subjects match your search.</p>
                    : filteredSubjects.map((subject) => (
                      <button key={subject} type="button"
                        className={`bt-profile-subject-chip${selectedSubjects.includes(subject) ? ' bt-profile-subject-chip--selected' : ''}`}
                        onClick={() => toggleSubject(subject)}
                      >{subject}</button>
                    ))
                  }
                </div>
              ) : (
                Object.entries(SUBJECTS).map(([category, subjects]) => (
                  <div key={category} className="bt-profile-subject-group">
                    <h3 className="bt-profile-subject-group__title">{category}</h3>
                    <div className="bt-profile-subjects">
                      {subjects.map((subject) => (
                        <button key={subject} type="button"
                          className={`bt-profile-subject-chip${selectedSubjects.includes(subject) ? ' bt-profile-subject-chip--selected' : ''}`}
                          onClick={() => toggleSubject(subject)}
                        >{subject}</button>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {selectedSubjects.length > 0 && (
                <div className="bt-profile-subjects__summary">
                  <p className="bt-profile-subjects__count">
                    {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
                  </p>
                  <div className="bt-profile-subjects__selected-list">
                    {selectedSubjects.map((s) => (
                      <span key={s} className="bt-profile-subjects__selected-chip">
                        {s}
                        <button type="button" onClick={() => toggleSubject(s)} aria-label={`Remove ${s}`}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── APS Goal ── */}
          <section className="bt-profile-section bt-profile-aps-section">
            <div className="bt-profile-aps-icon-wrap">
              <span className="bt-profile-aps-icon">🎯</span>
            </div>
            <div className="bt-profile-aps-content">
              <h2 className="bt-profile-section__title" style={{ marginBottom: 6 }}>APS Goal</h2>
              <p className="bt-profile-section__sub" style={{ marginBottom: 16 }}>
                Set a target APS score to work towards. Most university programmes require between 25 and 42.
              </p>
              <div className="bt-profile-aps-input-row">
                <div className="bt-profile-aps-input-wrap">
                  <input
                    type="number"
                    min={15}
                    max={42}
                    className={`bt-profile-aps-input${apsGoal && !apsValid ? ' bt-profile-aps-input--error' : ''}${apsValid ? ' bt-profile-aps-input--valid' : ''}`}
                    placeholder="e.g. 35"
                    value={apsGoal}
                    onChange={(e) => setApsGoal(e.target.value)}
                  />
                  <span className="bt-profile-aps-unit">/ 42</span>
                </div>
                {apsValid && (
                  <div className="bt-profile-aps-badge">
                    {apsNum >= 38 ? '🏆 Excellent target' : apsNum >= 30 ? '⭐ Great target' : '💪 Good starting point'}
                  </div>
                )}
                {apsGoal && !apsValid && (
                  <p className="bt-profile-aps-error">APS must be between 15 and 42</p>
                )}
              </div>
              {apsValid && (
                <div className="bt-profile-aps-bar-wrap">
                  <div className="bt-profile-aps-bar">
                    <div className="bt-profile-aps-bar__fill" style={{ width: `${((apsNum - 15) / 27) * 100}%` }} />
                  </div>
                  <div className="bt-profile-aps-scale">
                    <span>15</span><span>25</span><span>35</span><span>42</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Bio ── */}
          <section className="bt-profile-section">
            <h2 className="bt-profile-section__title">Your story</h2>
            <p className="bt-profile-section__sub">
              Write a short bio about yourself — your background, what drives you, and where you want to go. This is your space.
            </p>
            <div className="bt-profile-bio-wrapper">
              <textarea
                className="bt-profile-bio"
                placeholder="e.g. I'm a Grade 12 learner from Limpopo with a passion for engineering. I want to study at Wits and eventually build infrastructure for rural communities..."
                maxLength={500}
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <div className="bt-profile-bio__footer">
                <span className={`bt-profile-bio__count${bio.length >= 480 ? ' bt-profile-bio__count--warn' : ''}`}>
                  {bio.length}/500
                </span>
                {bio.length >= 20 && (
                  <span className="bt-profile-bio__check">✓ Great bio!</span>
                )}
              </div>
            </div>
          </section>

          {/* ── Save ── */}
          <div className="bt-profile-save-row">
            <button type="submit" className="bt-profile-save-btn">
              {saved ? '✓ Saved!' : 'Save profile'}
            </button>
            {saved && <p className="bt-profile-save-confirm">Your profile has been updated successfully.</p>}
          </div>

          </form>
        </div>
      </main>
    </div>
  );
}