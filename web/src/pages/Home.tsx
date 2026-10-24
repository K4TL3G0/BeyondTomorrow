import { useEffect, type CSSProperties } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  ChartNoAxesColumnIncreasing,
  Check,
  Compass,
  GraduationCap,
  HandCoins,
  Landmark,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageSlider } from '../components/ImageSlider';
import { ParticleWaveBackground } from '../components/ParticleWaveBackground';
import { INSTITUTION_GROUPS } from '../data/institutionGroups';
import './home.css';

const FEATURES = [
  {
    icon: ChartNoAxesColumnIncreasing,
    number: '01',
    eyebrow: 'Know where you stand',
    title: 'Make your marks make sense.',
    description:
      'Calculate an APS estimate from your subjects and marks, then see how it can guide your next study choices.',
    link: '/aps-calculator',
    linkLabel: 'Calculate your APS',
    tone: 'blue',
  },
  {
    icon: Compass,
    number: '02',
    eyebrow: 'Explore what is possible',
    title: 'Find a path that fits.',
    description:
      'Explore course options, compare entry requirements and use the what-if simulator to see how stronger marks can open new routes.',
    link: '/pathways',
    linkLabel: 'Explore pathways',
    tone: 'violet',
  },
  {
    icon: Landmark,
    number: '03',
    eyebrow: 'Choose where to apply',
    title: 'Get to know your options.',
    description:
      'Browse South African universities and TVET colleges, and use official institution links to confirm current admission details.',
    link: '/institutions',
    linkLabel: 'Browse institutions',
    tone: 'cyan',
  },
  {
    icon: HandCoins,
    number: '04',
    eyebrow: 'Plan how to pay',
    title: 'Look into funding early.',
    description:
      'Review bursary and study-loan information, eligibility criteria and provider links as you plan your next steps.',
    link: '/funding',
    linkLabel: 'Explore funding',
    tone: 'green',
  },
  {
    icon: CalendarCheck,
    number: '05',
    eyebrow: 'Stay ready',
    title: 'Keep applications moving.',
    description:
      'Use the checklist to organize key documents and track important application milestones.',
    link: '/checklist',
    linkLabel: 'Open your checklist',
    tone: 'orange',
  },
  {
    icon: BookOpenCheck,
    number: '06',
    eyebrow: 'Get reliable guidance',
    title: 'Learn from verified guides.',
    description:
      'Find practical information on admissions, funding and staying safe from bursary scams.',
    link: '/resources',
    linkLabel: 'Read student resources',
    tone: 'pink',
  },
] as const;

const JOURNEY_STEPS = [
  {
    label: 'Understand your marks',
    description: 'Calculate your APS and see how your subject results open entry doors.',
    icon: ChartNoAxesColumnIncreasing,
    link: '/aps-calculator',
    linkLabel: 'Start calculator',
  },
  {
    label: 'Explore study options',
    description: 'Compare qualifications, TVET colleges and university pathways.',
    icon: Compass,
    link: '/pathways',
    linkLabel: 'View pathways',
  },
  {
    label: 'Prepare to apply',
    description: 'Track document requirements, deadlines and funding applications.',
    icon: GraduationCap,
    link: '/applications',
    linkLabel: 'Open applications',
  },
];

export default function Home() {
  useEffect(() => {
    document.title = 'Beyond Tomorrow | Your Study Journey Starts Here';

    const elements = document.querySelectorAll<HTMLElement>('[data-home-reveal]');
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (motionPreference.matches || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      <section className="home-hero">
        <ParticleWaveBackground density={0.7} speed={1} className="home-hero-wave" />
        <div className="home-hero-orb home-hero-orb-one" aria-hidden="true" />
        <div className="home-hero-orb home-hero-orb-two" aria-hidden="true" />
        <div className="home-hero-inner">
          <div className="home-hero-copy" data-home-reveal>
            <p className="home-eyebrow">
              <Sparkles size={15} aria-hidden="true" />
              Your future starts with a plan
            </p>
            <h1>
              Your next chapter
              <br />
              starts <span>here.</span>
            </h1>
            <p className="home-hero-description">
              Make sense of your marks, explore study options, find funding information and get
              ready to apply. All in one place.
            </p>
            <div className="home-hero-actions">
              <Link to="/aps-calculator" className="home-button home-button-primary">
                Start with your APS
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a href="#journey" className="home-button home-button-secondary">
                See how it works
              </a>
            </div>
          </div>

          <div className="home-hero-visual" data-home-reveal aria-label="A study journey from marks to opportunity">
            <div className="home-visual-glow" aria-hidden="true" />
            <div className="home-visual-topline">
              <span className="home-visual-dot" />
              YOUR JOURNEY, MAPPED
            </div>
            <div className="home-visual-chart">
              <div className="home-chart-caption">
                <span>Small steps</span>
                <span>New possibilities</span>
              </div>
              <div className="home-chart-grid" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <svg className="home-chart-line" viewBox="0 0 420 150" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="journeyLine" x1="20" y1="140" x2="400" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38BDF8" />
                    <stop offset="1" stopColor="#A5F3FC" />
                  </linearGradient>
                  <linearGradient id="journeyFill" x1="210" y1="14" x2="210" y2="150" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38BDF8" stopOpacity=".28" />
                    <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M10 137C62 130 77 110 121 113C163 116 182 82 222 88C266 94 281 55 322 58C358 61 376 28 410 14V150H10V137Z" fill="url(#journeyFill)" />
                <path d="M10 137C62 130 77 110 121 113C163 116 182 82 222 88C266 94 281 55 322 58C358 61 376 28 410 14" stroke="url(#journeyLine)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="121" cy="113" r="5" fill="#0B1D3C" stroke="#7DD3FC" strokeWidth="2" />
                <circle cx="222" cy="88" r="5" fill="#0B1D3C" stroke="#7DD3FC" strokeWidth="2" />
                <circle cx="322" cy="58" r="5" fill="#0B1D3C" stroke="#7DD3FC" strokeWidth="2" />
                <circle cx="410" cy="14" r="6" fill="#A5F3FC" />
              </svg>
            </div>
            <div className="home-journey-pills">
              <span><ChartNoAxesColumnIncreasing size={15} /> Marks</span>
              <span><Compass size={15} /> Pathways</span>
              <span><GraduationCap size={16} /> Your future</span>
            </div>
            <div className="home-visual-footer">
              <span>One step at a time</span>
              <TrendingUp size={16} aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section className="home-journey-section" id="journey">
        <div className="home-section-inner">
          <div className="home-section-heading" data-home-reveal>
            <p className="home-section-eyebrow">A clearer way forward</p>
            <h2>From “what next?” to <span>next steps.</span></h2>
            <p>
              Higher education decisions can feel like a lot. Break the journey into manageable
              steps and use the tools that help you move forward.
            </p>
          </div>
          <div className="home-steps">
            {JOURNEY_STEPS.map(({ label, description, icon: Icon, link, linkLabel }, index) => (
              <Link
                to={link}
                className="home-step home-step-interactive"
                data-home-reveal
                key={label}
                style={{ '--home-reveal-delay': `${index * 100}ms` } as CSSProperties}
              >
                <div className="home-step-header">
                  <span className="home-step-icon"><Icon size={22} strokeWidth={1.8} /></span>
                  <span className="home-step-number">0{index + 1}</span>
                </div>
                <div className="home-step-body">
                  <h3>{label}</h3>
                  <p>{description}</p>
                </div>
                <span className="home-step-link-action">
                  {linkLabel} <ArrowRight size={15} aria-hidden="true" />
                </span>
                {index < JOURNEY_STEPS.length - 1 && (
                  <ArrowRight className="home-step-arrow" size={19} aria-hidden="true" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-institutions-section" id="institutions">
        <div className="home-section-inner">
          <div className="home-section-heading" data-home-reveal>
            <p className="home-section-eyebrow">Explore your options</p>
            <h2>Find a place to <span>make it happen.</span></h2>
            <p>
              Explore public universities, private institutions and TVET colleges across South
              Africa. Confirm current courses and admission requirements directly with each
              institution.
            </p>
          </div>
          <div className="home-institution-grid">
            {INSTITUTION_GROUPS.map((group, index) => (
              <article
                className="home-institution-card"
                data-home-reveal
                key={group.id}
                style={{ '--home-reveal-delay': `${index * 90}ms` } as CSSProperties}
              >
                <div className="home-institution-card-heading">
                  <span className="home-institution-number">0{index + 1}</span>
                  <h3>{group.title}</h3>
                </div>
                <ImageSlider images={group.images} label={`${group.title} examples`} />
                <Link to="/applications" className="home-feature-link">
                  Explore institutions <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
          <p className="home-data-note" data-home-reveal>
            Logos are examples of institutions in each category, not endorsements or a complete
            directory.
          </p>
        </div>
      </section>

      <section className="home-tools-section" id="tools">
        <div className="home-section-inner">
          <div className="home-section-heading home-tools-heading" data-home-reveal>
            <p className="home-section-eyebrow">Everything in one place</p>
            <h2>Tools for every part of <span>the journey.</span></h2>
            <p>
              Start where you are. Use one tool today, then come back when you’re ready for the
              next step.
            </p>
          </div>
          <div className="home-feature-grid">
            {FEATURES.map(({ icon: Icon, number, eyebrow, title, description, link, linkLabel, tone }, index) => (
              <article
                className={`home-feature-card home-feature-${tone}`}
                data-home-reveal
                key={number}
                style={{ '--home-reveal-delay': `${(index % 3) * 90}ms` } as CSSProperties}
              >
                <div className="home-feature-card-top">
                  <span className="home-feature-icon"><Icon size={22} strokeWidth={1.8} /></span>
                  <span className="home-feature-number">{number}</span>
                </div>
                <p className="home-feature-eyebrow">{eyebrow}</p>
                <h3>{title}</h3>
                <p className="home-feature-description">{description}</p>
                <Link to={link} className="home-feature-link">
                  {linkLabel} <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
          <p className="home-data-note" data-home-reveal>
            Admission and funding criteria can change. Always confirm requirements and deadlines
            with the relevant institution or provider.
          </p>
        </div>
      </section>

      <section className="home-profile-banner" data-home-reveal>
        <div className="home-profile-icon"><GraduationCap size={27} strokeWidth={1.7} /></div>
        <div>
          <p className="home-section-eyebrow">Make your experience your own</p>
          <h2>Start with the details that matter to you.</h2>
          <p>Add your interests, province and academic details to help personalize your study journey.</p>
        </div>
        <Link to="/onboarding" className="home-button home-button-primary">
          Set up your profile <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>

      <section className="home-final-cta" data-home-reveal>
        <div className="home-final-cta-icon"><Sparkles size={21} aria-hidden="true" /></div>
        <p className="home-section-eyebrow">Your future is worth planning for</p>
        <h2>You don’t need every answer today.<br /><span>Just take the first step.</span></h2>
        <Link to="/aps-calculator" className="home-button home-button-primary">
          Calculate your APS <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
