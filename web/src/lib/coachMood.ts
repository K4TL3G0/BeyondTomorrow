import type { CoachMood } from '../components/CoachAvatar';

/**
 * Everything the avatar is allowed to know. It deliberately has no household answers,
 * so special-category answers (vulnerable child, disability, grants) can never reach it.
 */
export interface CoachSituation {
  loading: boolean;
  referenceError: boolean;
  saveError: boolean;
  saving: boolean;
  stage: 'route' | 'questions' | 'documents';
  hasIncome: boolean;
  routeSelected: boolean;
  routeCount: number;
  questionIndex: number;
  questionTotal: number;
  documentCount: number;
  allReady: boolean;
  riskLevel: 'low' | 'medium' | 'high' | null;
  nextAction: string | null;
}

export function deriveCoachGuide(s: CoachSituation): { mood: CoachMood; message: string } {
  if (s.loading) return { mood: 'thinking', message: 'Pulling up the latest sourced guidance…' };
  if (s.saveError) {
    return { mood: 'concerned', message: 'That change did not save, so I undid it. Please try again.' };
  }
  if (s.referenceError) {
    return {
      mood: 'concerned',
      message: 'Some reference data is unavailable, so I will not guess. Retry, or check requirements with NSFAS directly.',
    };
  }
  if (s.saving) return { mood: 'thinking', message: 'Saving that now…' };

  if (s.stage === 'route') {
    if (!s.hasIncome) {
      return { mood: 'idle', message: 'Hi, I’m Naledi, an automated guide. Start by choosing the income range closest to your household. A range is enough; I never need an exact amount.' };
    }
    if (s.routeCount > 0 && !s.routeSelected) {
      return { mood: 'happy', message: 'Thank you. Now pick the route you want to prepare for. Loans must be repaid, so compare them carefully.' };
    }
    return { mood: 'happy', message: 'Route chosen. Continue when you are ready; answer a few questions next.' };
  }

  if (s.stage === 'questions') {
    return {
      mood: 'idle',
      message: `Question ${s.questionIndex + 1} of ${s.questionTotal}. “Not sure” is a fine answer; I will flag what to confirm.`,
    };
  }

  if (s.documentCount === 0) {
    return {
      mood: 'concerned',
      message: 'I do not have verified rules for this route yet, so I will not guess. Check current requirements with NSFAS directly.',
    };
  }
  if (s.allReady) {
    return { mood: 'celebrating', message: 'Every check is ticked. Review the official instructions once more, then submit.' };
  }
  if (s.riskLevel === 'high') {
    return { mood: 'concerned', message: s.nextAction ?? 'A few things need attention before you submit.' };
  }
  if (s.riskLevel === 'medium') {
    return { mood: 'idle', message: s.nextAction ?? 'Keep working through the checks below.' };
  }
  return { mood: 'happy', message: 'You are on track. Keep working through the checks below. Ticking a box does not submit anything.' };
}
