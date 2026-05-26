import { describe, it, expect } from 'vitest';
import { ACTION_SHORTCUTS, GLOBAL_ACTIONS_BY_ID } from '../registry';

describe('ACTION_SHORTCUTS registry', () => {
  it('maps transfer and calculator shortcuts correctly and omits empty keys', () => {
    // transfer should map to 'transfer' via key 'y'
    expect(ACTION_SHORTCUTS['y']).toBe('transfer');
    // calculator should map to 'calculator' via key 'c'
    expect(ACTION_SHORTCUTS['c']).toBe('calculator');
    // loan action should exist but with empty shortcut (not present in mapping)
    const loan = GLOBAL_ACTIONS_BY_ID['add-loan'];
    expect(loan).toBeDefined();
    expect(loan.shortcutKey).toBe('');
    expect(ACTION_SHORTCUTS['']).toBeUndefined();
  });
});
