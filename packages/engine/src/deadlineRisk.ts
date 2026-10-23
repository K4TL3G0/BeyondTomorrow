import type { RiskLevel } from './types';

export interface DeadlineRiskInput {
  remainingTaskDays: number[]; // est_days of tasks not yet completed
  deadline: Date;
  now: Date;
}

/** Compares estimated work remaining with days left. est_days are estimates: label them as such. */
export function assessDeadlineRisk(input: DeadlineRiskInput): RiskLevel {
  const totalRemaining = input.remainingTaskDays.reduce((total, days) => total + Math.max(0, days), 0);
  const msLeft = input.deadline.getTime() - input.now.getTime();
  const daysLeft = msLeft / (1000 * 60 * 60 * 24);

  if (daysLeft <= 0 || totalRemaining > daysLeft * 1.5) {
    return 'overdue';
  }

  if (totalRemaining > daysLeft) {
    return 'at_risk';
  }

  return 'on_track';
}
