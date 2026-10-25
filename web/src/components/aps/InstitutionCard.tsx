import { GraduationCap, Sparkles, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import {
  calculateForInstitution,
  type ApsInstitution,
  type SubjectEntry,
} from '@beyond-tomorrow/engine';
import type { Qualification } from '../../data/qualifications';

interface Props {
  inst: ApsInstitution;
  entries: SubjectEntry[];
  qualifying: Qualification[];
  hasQualificationData: boolean;
}

export function InstitutionCard({ inst, entries, qualifying, hasQualificationData }: Props) {
  const result = calculateForInstitution(inst, entries);
  const displayScore = inst.scheme.type === 'stellies' || inst.scheme.type === 'rhodes'
    ? result.total.toFixed(1)
    : result.total;

  const scoreLabel = inst.scheme.type === 'stellies'
    ? 'Admission average'
    : inst.scheme.type === 'nmu'
      ? 'Applicant Score'
      : inst.scheme.type === 'uct'
        ? 'Score estimate'
        : 'APS estimate';

  const maxScore = result.maximum > 0 ? result.maximum : 42;
  const percentage = Math.min(100, Math.max(0, (result.total / maxScore) * 100));

  return (
    <article className="aps-card" aria-labelledby={`aps-institution-${inst.id}`}>
      <div className="aps-card-header">
        <div className="aps-card-title-wrap">
          <div className="aps-card-icon" aria-hidden="true">
            <GraduationCap size={20} />
          </div>
          <div>
            <h3 id={`aps-institution-${inst.id}`}>{inst.name}</h3>
            <span className="aps-card-scheme-badge">
              {inst.scheme.type === 'stellies' ? 'Stellenbosch Scale' :
               inst.scheme.type === 'nmu' ? 'NMU Formula' :
               inst.scheme.type === 'uct' ? 'UCT Points' :
               inst.scheme.type === 'rhodes' ? 'Rhodes Scale' :
               inst.scheme.type === 'wits' ? 'Wits Faculty Rules' : 'Standard NSC Scale'}
            </span>
          </div>
        </div>
      </div>

      <div className="aps-card-score-box">
        <div className="aps-card-score-info">
          <span className="aps-score-label">{scoreLabel}</span>
          <div className="aps-score-value-row">
            <span className="aps-score-n">{displayScore}</span>
            <span className="aps-score-max">/ {result.maximum}</span>
          </div>
        </div>
        <div className="aps-score-progress-bar" aria-hidden="true">
          <div
            className="aps-score-progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="aps-card-content">
        <div className="aps-qualifications-header">
          <h4>
            <Sparkles size={16} className="aps-sparkle-icon" />
            Matching qualifications
          </h4>
          {qualifying.length > 0 && (
            <span className="aps-match-badge">
              {qualifying.length} {qualifying.length === 1 ? 'match' : 'matches'}
            </span>
          )}
        </div>

        {qualifying.length > 0 ? (
          <ul className="aps-qualification-list">
            {qualifying.map((qualification) => (
              <li key={qualification.id} className="aps-qualification-item">
                <CheckCircle2 size={16} className="aps-check-icon" />
                <div className="aps-qualification-details">
                  <span className="aps-qualification-name">{qualification.name}</span>
                  {qualification.durationYears !== undefined && (
                    <span className="aps-qualification-duration">
                      <Clock size={12} />
                      {qualification.durationYears} {qualification.durationYears === 1 ? 'year' : 'years'}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="aps-no-match">
            <AlertCircle size={18} className="aps-alert-icon" />
            <p className="muted" role="status">
              {hasQualificationData
                ? 'No listed qualifications currently meet the entered minimum requirements.'
                : 'Qualification requirements are not available here yet.'}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
