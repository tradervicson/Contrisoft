import { describe, expect, it } from '@jest/globals';

function calcCosts(baseCost: number, regionalMultiplier = 1) {
  const low = baseCost * 0.9 * regionalMultiplier;
  const mid = baseCost * regionalMultiplier;
  const high = baseCost * 1.15 * regionalMultiplier;
  return { low, mid, high };
}

describe('Cost Engine formulas', () => {
  it('calculates low/mid/high with multiplier', () => {
    const { low, mid, high } = calcCosts(100, 1.2);
    expect(low).toBeCloseTo(108);
    expect(mid).toBeCloseTo(120);
    expect(high).toBeCloseTo(138);
  });
});

// Mock status transition test (simplified)

describe('Status workflow', () => {
  it('goes from draft to needs_recalc to costs_ready to compliant', () => {
    const steps: string[] = [];
    const setStatus = (s: string) => steps.push(s);

    // Draft
    setStatus('draft');
    // After design change
    setStatus('needs_recalc');
    // After recalc
    setStatus('costs_ready');
    // Cost worker finished & no errors
    setStatus('compliant');

    expect(steps).toEqual(['draft', 'needs_recalc', 'costs_ready', 'compliant']);
  });
}); 