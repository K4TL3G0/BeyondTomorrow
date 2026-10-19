import type { RiskLevel } from './types';
import { notImplemented } from './util';

export interface DeadlineRiskInput {
  remainingTaskDays: number[]; // est_days of tasks not yet completed
  deadline: Date;
  now: Date;
}

/** Compares estimated work remaining with days left. est_days are estimates: label them as such. */
export function assessDeadlineRisk(_input: DeadlineRiskInput): RiskLevel {
  return notImplemented('assessDeadlineRisk');
}
