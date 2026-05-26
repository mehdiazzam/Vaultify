import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  collectionMock: vi.fn(),
  docMock: vi.fn(),
  runTransactionMock: vi.fn(),
  requireDbMock: vi.fn(),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    collection: mocks.collectionMock,
    doc: mocks.docMock,
    runTransaction: mocks.runTransactionMock,
  };
});

vi.mock('../helpers', () => ({
  requireDb: mocks.requireDbMock,
}));

import { createLoanWithTransaction, applyRepaymentTransaction } from '../atomic';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('atomic helpers', () => {
  it('createLoanWithTransaction sets loan and transaction in a runTransaction', async () => {
    let docCounter = 1;
    mocks.docMock.mockImplementation(() => ({ id: `doc-${docCounter++}` }));

    const txCalls: Array<{ method: string; ref: { id: string }; data?: any }> = [];

    mocks.runTransactionMock.mockImplementation(async (_db, callback) => {
      const fakeTx = {
        set: (ref: { id: string }, data: any) => txCalls.push({ method: 'set', ref, data }),
        update: (ref: { id: string }, data: any) => txCalls.push({ method: 'update', ref, data }),
      };
      await callback(fakeTx);
      return Promise.resolve();
    });

    const loanData = { userId: 'u1', type: 'borrowed', counterparty: 'Bob', amount: 50, currency: 'USD', status: 'active' } as any;
    const txData = { userId: 'u1', categoryId: 'borrow', description: 'd', date: '2020-01-01', items: [] } as any;

    const loanId = await createLoanWithTransaction(loanData, txData);
    expect(loanId).toBeDefined();
    expect(txCalls.filter((c) => c.method === 'set').length).toBe(2);
    // The transaction payload should include relatedLoanId equal to created loan id
    const txSet = txCalls.find((c) => c.method === 'set' && c.data?.relatedLoanId);
    expect(txSet).toBeTruthy();
    expect(txSet!.data.relatedLoanId).toBe(loanId);
  });

  it('applyRepaymentTransaction writes tx and updates loan', async () => {
    mocks.docMock.mockImplementation(() => ({ id: 'loan-doc' }));
    const txCalls: Array<{ method: string; ref: { id: string }; data?: any }> = [];

    mocks.runTransactionMock.mockImplementation(async (_db, callback) => {
      const fakeTx = {
        set: (ref: { id: string }, data: any) => txCalls.push({ method: 'set', ref, data }),
        update: (ref: { id: string }, data: any) => txCalls.push({ method: 'update', ref, data }),
      };
      await callback(fakeTx);
      return Promise.resolve();
    });

    await applyRepaymentTransaction('loan-doc', { status: 'partially_repaid' } as any, { userId: 'u1', categoryId: 'borrow', description: 'repay', date: '2020-01-02', items: [] } as any);

    expect(txCalls.find((c) => c.method === 'set')).toBeTruthy();
    const updateCall = txCalls.find((c) => c.method === 'update');
    expect(updateCall).toBeTruthy();
    expect(updateCall!.data).toHaveProperty('status', 'partially_repaid');
  });
});
