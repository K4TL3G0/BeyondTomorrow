import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ExternalLink,
  FileText,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import type { Institution } from '../types';

const dateFormatter = new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const NOT_VERIFIED = 'Not verified';

const INSTITUTION_LOGOS: Record<string, string> = {
  uct: '/institutions/uct.jpg',
  wits: '/institutions/wits.png',
  uj: '/UJ.jpg',
  up: '/institutions/up.jpg',
  unisa: '/funding/unisa-postgraduate-bursaries.png',
  ufs: '/UFS.jpg',
  ewc: '/institutions/ewc.png',
};

function formatDate(value: string | null): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NOT_VERIFIED;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? NOT_VERIFIED : dateFormatter.format(date);
}

function getDeadlineInfo(
  openingDateStr: string | null,
  closingDateStr: string | null,
  now = new Date(),
) {
  if (!closingDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(closingDateStr)) return null;

  const closingDate = new Date(`${closingDateStr}T23:59:59+02:00`);
  if (Number.isNaN(closingDate.getTime())) return null;

  let openingDate: Date | null = null;
  if (openingDateStr && /^\d{4}-\d{2}-\d{2}$/.test(openingDateStr)) {
    const parsed = new Date(`${openingDateStr}T00:00:00+02:00`);
    if (!Number.isNaN(parsed.getTime())) openingDate = parsed;
  }

  const msLeft = closingDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  if (openingDate && now.getTime() < openingDate.getTime()) {
    const daysUntilOpen = Math.ceil((openingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      label: daysUntilOpen === 1 ? 'Opens tomorrow' : `Opens in ${daysUntilOpen} days`,
      tone: 'neutral' as const,
    };
  }

  if (daysLeft < 0) {
    return {
      label: 'Closed',
      tone: 'closed' as const,
    };
  }

  if (daysLeft === 0) {
    return {
      label: 'Closes today',
      tone: 'urgent' as const,
    };
  }

  if (daysLeft === 1) {
    return {
      label: '1 day left',
      tone: 'urgent' as const,
    };
  }

  if (daysLeft <= 30) {
    return {
      label: `${daysLeft} days left`,
      tone: 'urgent' as const,
    };
  }

  return {
    label: `${daysLeft} days left`,
    tone: 'open' as const,
  };
}

/** Only https links are allowed; anything else becomes an inert "#". */
function safeUrl(value: string): string {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : '#';
  } catch {
    return '#';
  }
}

interface InstitutionCardProps {
  institution: Institution;
}

export function InstitutionCard({ institution: item }: InstitutionCardProps) {
  const titleId = `title-${item.id}`;
  const location = item.distanceLearning
    ? 'Distance learning · national reach'
    : item.provinces.join(' · ');
  const hasDateSource = Boolean(item.dateSource && item.dateVerifiedOn);
  const documents = item.requiredDocuments;
  const deadlineInfo = getDeadlineInfo(item.openingDate, item.closingDate);

  return (
    <article className="bt-card" aria-labelledby={titleId}>
      <div className="bt-card-top">
        <span className="bt-logo" aria-hidden="true">
          <span>{item.short}</span>
          {INSTITUTION_LOGOS[item.id] && (
            <img
              src={INSTITUTION_LOGOS[item.id]}
              alt=""
              loading="lazy"
              onError={(event) => event.currentTarget.remove()}
            />
          )}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
            <p className="bt-type">{item.type}</p>
            <span className="bt-verified-badge" title="Admissions details sourced and verified">
              <ShieldCheck size={13} /> Verified
            </span>
          </div>
          <h3 id={titleId}>{item.name}</h3>
        </div>
      </div>

      <div className="bt-location-row">
        <MapPin size={14} className="bt-icon-muted" />
        <span>{location}</span>
      </div>

      <div className="bt-dates-grid">
        <div className="bt-date-box">
          <span className="bt-date-label">Opens</span>
          <span className="bt-date-val">{formatDate(item.openingDate)}</span>
        </div>
        <div className="bt-date-box">
          <span className="bt-date-label">Closes</span>
          <span className="bt-date-val">
            {formatDate(item.closingDate)}
            {deadlineInfo && (
              <span className={`bt-deadline-pill bt-deadline-${deadlineInfo.tone}`}>
                {deadlineInfo.label}
              </span>
            )}
          </span>
        </div>
      </div>

      {item.intake && (
        <p className="bt-small bt-intake-row">
          <CalendarDays size={14} className="bt-icon-muted" />
          <span>Intake: <strong>{item.intake}</strong></span>
        </p>
      )}

      <p className="bt-small bt-source-row">
        {hasDateSource && item.dateSource ? (
          <>
            <ExternalLink size={13} className="bt-icon-muted" />
            <a
              href={safeUrl(item.dateSource)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Date source ({formatDate(item.dateVerifiedOn)})
            </a>
          </>
        ) : (
          'Dates unverified'
        )}
      </p>

      <details className="bt-accordion">
        <summary>
          <span className="bt-summary-left">
            <BookOpen size={15} className="bt-summary-icon" />
            <span>Faculty / programme APS</span>
          </span>
          <ChevronDown size={16} className="bt-chevron-icon" />
        </summary>
        {item.requirements.length > 0 ? (
          <table>
            <caption>
              Published requirements — confirm against the current prospectus
            </caption>
            <thead>
              <tr>
                <th scope="col">Faculty / programme</th>
                <th scope="col">APS / conditions</th>
              </tr>
            </thead>
            <tbody>
              {item.requirements.map((r) => (
                <tr key={r.faculty}>
                  <th scope="row">{r.faculty}</th>
                  <td>
                    {r.aps}
                    {r.notes && (
                      <>
                        <br />
                        {r.notes}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>
            Faculty / programme APS requirements have not been verified. Check the
            current prospectus for your exact qualification, subject prerequisites
            and selection rules. No eligibility decision is made here.
          </p>
        )}
      </details>

      <details className="bt-accordion">
        <summary>
          <span className="bt-summary-left">
            <FileText size={15} className="bt-summary-icon" />
            <span>Required documents</span>
          </span>
          <ChevronDown size={16} className="bt-chevron-icon" />
        </summary>
        {documents && documents.length > 0 ? (
          <ul>
            {documents.map((doc) => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
        ) : (
          <p>
            The official required-document list has not been verified. Use the
            preparation checklist as a starting point.
          </p>
        )}
      </details>

      <div className="bt-card-bottom">
        <a
          className="bt-btn bt-card-link"
          href={safeUrl(item.url)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${item.name} official website (opens in a new tab)`}
        >
          <span>Official website</span>
          <ExternalLink size={16} />
        </a>
      </div>
    </article>
  );
}