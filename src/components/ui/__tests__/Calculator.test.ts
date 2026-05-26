import { describe, it, expect } from 'vitest';
import { evaluateExpression } from '../calcUtils';

describe('Calculator evaluateExpression', () => {
  it('evaluates simple expressions correctly', () => {
    expect(evaluateExpression('1+2')).toBe(3);
    expect(evaluateExpression('2 * (3 + 4)')).toBe(14);
    expect(evaluateExpression('10/4')).toBeCloseTo(2.5);
  });

  it('returns null for invalid input', () => {
    expect(evaluateExpression('2 + foo')).toBeNull();
    expect(evaluateExpression('')).toBeNull();
    expect(evaluateExpression('1e10000')).toBeNull();
  });
});
