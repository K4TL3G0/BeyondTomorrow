import { INSTITUTIONS } from '@beyond-tomorrow/engine';

export const APS_INSTITUTIONS = INSTITUTIONS.filter((institution) =>
  !/\btvet\b/i.test(institution.name),
);
