import type { PreparationItem } from '../types';

export const preparationItems: readonly PreparationItem[] = [
  { id: 'identity', text: 'Certified copy of ID or passport' },
  { id: 'results', text: 'Latest available school results' },
  { id: 'certificate', text: 'Final school-leaving certificate, if available' },
  { id: 'address', text: 'Proof of address or residence, if requested' },
  { id: 'guardian', text: 'Parent or guardian ID' },
  { id: 'payment', text: 'Application payment proof, if a fee is required' },
  {
    id: 'additional',
    text: 'Portfolio, test results or additional programme documents, if required',
  },
];
