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
        <div>
          <h3 id={titleId}>{item.name}</h3>
          <p className="bt-type">{item.type}</p>
        </div>
      </div>

      <p className="bt-location">{location}</p>
      <span className="bt-badge">Verify admissions details</span>

      <dl className="bt-dates">
        <div>
          <dt>Applications open</dt>
          <dd>{formatDate(item.openingDate)}</dd>
        </div>
        <div>
          <dt>Applications close</dt>
          <dd>{formatDate(item.closingDate)}</dd>
        </div>
      </dl>

      {item.intake && <p className="bt-small">Intake: {item.intake}</p>}
      <p className="bt-small">
        {hasDateSource && item.dateSource ? (
          <>
            <a
              href={safeUrl(item.dateSource)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Date source (new tab)
            </a>{' '}
            · Checked {formatDate(item.dateVerifiedOn)}. Confirm programme-specific
            deadlines.
          </>
        ) : (
          'Dates and intake: not verified'
        )}
      </p>

      <details>
        <summary>Faculty / programme APS</summary>
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

      <details>
        <summary>Required documents</summary>
        {documents && documents.length > 0 ? (
          <ul>
            {documents.map((doc) => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
        ) : (
          <p>
            The official required-document list has not been verified. Use the
            preparation checklist as a starting point, then confirm the documents for
            your programme and applicant category on the institution’s website.
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
          Official website ↗
        </a>
        <p className="bt-small">
          Opens in a new tab. Find the application portal on the official site.
        </p>
      </div>
    </article>
  );
}