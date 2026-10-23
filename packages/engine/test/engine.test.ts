import { describe, expect, it } from 'vitest';
import {
  calculateAps,
  calculateForInstitution,
  convertMark,
  DEFAULT_CONFIG,
  configFromRows,
  INSTITUTIONS,
  isValidMark,
  pointsForMark,
} from '../src';

describe('configFromRows', () => {
  it('reads known keys and falls back to defaults', () => {
    const cfg = configFromRows([{ key: 'close_aps_margin', value: '4' }]);
    expect(cfg.closeApsMargin).toBe(4);
    expect(cfg.wFit).toBe(DEFAULT_CONFIG.wFit);
  });
});

describe('pointsForMark', () => {
  const bands = [
    { minMark: 70, maxMark: 100, points: 6 },
    { minMark: 0, maxMark: 69, points: 1 },
  ];
  it('maps a percentage to points', () => {
    expect(pointsForMark(75, bands)).toBe(6);
    expect(pointsForMark(10, bands)).toBe(1);
  });
});

describe('APS calculator', () => {
  const entries = [
    { name: 'English Home Language', percent: 70, counted: true },
    { name: 'Mathematics', percent: 65, counted: true },
    { name: 'Physical Sciences', percent: 80, counted: true },
    { name: 'Life Sciences', percent: 75, counted: true },
    { name: 'Geography', percent: 90, counted: true },
    { name: 'History', percent: 60, counted: true },
    { name: 'Life Orientation', percent: 90, counted: true },
  ];

  it('validates percentages and converts standard and UFS bands', () => {
    expect(isValidMark(0)).toBe(true);
    expect(isValidMark(100)).toBe(true);
    expect(isValidMark(-1)).toBe(false);
    expect(isValidMark(100.1)).toBe(false);
    expect(convertMark(29)).toBe(1);
    expect(convertMark(30)).toBe(2);
    expect(convertMark(80)).toBe(7);
    expect(convertMark(29, 'ufs')).toBe(0);
    expect(convertMark(90, 'ufs')).toBe(8);
  });

  it('totals counted subjects while retaining excluded rows in the breakdown', () => {
    const result = calculateAps([
      { name: 'English', percent: 80, counted: true },
      { name: 'History', percent: 90, counted: false },
    ]);
    expect(result.total).toBe(7);
    expect(result.countedSubjects).toBe(1);
    expect(result.breakdown[1]?.aps).toBe(0);
  });

  it('applies institution-specific subject rules and exposes the corrected Venda id', () => {
    const uj = INSTITUTIONS.find((institution) => institution.id === 'uj');
    const uct = INSTITUTIONS.find((institution) => institution.id === 'uct');
    const uctScience = INSTITUTIONS.find((institution) => institution.id === 'uct-science');
    const wits = INSTITUTIONS.find((institution) => institution.id === 'wits');
    const venda = INSTITUTIONS.find((institution) => institution.id === 'univen');
    expect(uj && calculateForInstitution(uj, entries).total).toBe(36);
    expect(uct && calculateForInstitution(uct, entries).total).toBe(440);
    expect(uctScience && calculateForInstitution(uctScience, entries).total).toBe(585);
    expect(wits && calculateForInstitution(wits, entries).total).toBe(44);
    expect(convertMark(29, 'univen')).toBe(1);
    expect(venda?.scheme).toMatchObject({ type: 'standard', excludeLO: true, scale: 'univen' });
    expect(INSTITUTIONS.some((institution) => institution.id === 'uni venda')).toBe(false);
  });
});

// Hand-compute five fictional students BEFORE writing the engine, then turn
// these todos into real tests. Include one exactly at a cut-off and one on an
// income-threshold boundary. They double as your demo personas.
describe('personas (write expected results by hand first)', () => {
  it.todo('Persona 1: comfortably qualifies');
  it.todo('Persona 2: exactly at the APS cut-off');
  it.todo('Persona 3: close, short by 2 APS points');
  it.todo('Persona 4: not yet, Maths too low, what-if unlocks courses');
  it.todo('Persona 5: income bracket on the NSFAS threshold boundary');
});
