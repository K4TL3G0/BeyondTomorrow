import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, configFromRows, pointsForMark } from '../src';

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
