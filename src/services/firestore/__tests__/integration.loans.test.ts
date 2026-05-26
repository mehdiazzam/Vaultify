import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Loan, LoanFormValues, RepaymentFormValues } from '@/types';

const mocks = vi.hoisted(() => ({
  collectionMock: vi.fn(),
  docMock: vi.fn(),
  runTransactionMock: vi.fn(),
  getAccountByIdMock: vi.fn(),
  getOrCreateLoanAccountsMock: vi.fn(),
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
  mapDoc: vi.fn((d) => ({ id: d.id, ...d.data?.() })),
  getAccountById: mocks.getAccountByIdMock,
}));

vi.mock('../accounts', () => ({
  getOrCreateLoanAccounts: mocks.getOrCreateLoanAccountsMock,
}));

import { createLoan, recordRepayment } from '../loans';

type TxCall = {
  method: 'set' | 'update';
  ref: { id: string };
  data?: unknown;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('loans integration (mocked firestore transactions)', () => {
  it('creates a loan and records a subsequent repayment', async () => {
    // Doc id generator
    let docCounter = 1;
    mocks.docMock.mockImplementation(() => {
      const id = `doc-${docCounter++}`;
      return { id };
    });

    // getAccountById returns valid asset account
    mocks.getAccountByIdMock.mockResolvedValue({ id: 'asset-account', userId: 'user-1', currency: 'USD' });

    // loan accounts
    mocks.getOrCreateLoanAccountsMock.mockResolvedValue({ loanPayableId: 'loan-payable', loanReceivableId: 'loan-receivable' });

    // runTransaction should call the callback synchronously with a fake tx that records calls
    const txCalls: TxCall[] = [];

    mocks.runTransactionMock.mockImplementation(async (_db, callback: (tx: { set: (ref: { id: string }, data: unknown) => void; update: (ref: { id: string }, data: unknown) => void }) => Promise<void>) => {
      const fakeTx = {
        set: (ref: { id: string }, data: unknown) => txCalls.push({ method: 'set', ref, data }),
        update: (ref: { id: string }, data: unknown) => txCalls.push({ method: 'update', ref, data }),
      };

      await callback(fakeTx);
      return Promise.resolve();
    });

    const loanValues: LoanFormValues = {
      type: 'borrowed',
      counterparty: 'Alice',
      amount: 100,
      currency: 'USD',
      assetAccountId: 'asset-account',
      description: 'Test loan',
    };

    const loanId = await createLoan('user-1', loanValues);
    expect(loanId).toBeDefined();

    // Expect two set calls during createLoan (loan doc + transaction)
    expect(txCalls.filter(c => c.method === 'set').length).toBe(2);

    // Prepare a loan object to pass to recordRepayment
    const loanObj: Loan = {
      id: loanId,
      userId: 'user-1',
      type: 'borrowed',
      counterparty: 'Alice',
      amount: 100,
      currency: 'USD',
      amountRepaid: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Clear previous calls
    txCalls.length = 0;

    // record repayment of 30
    const repaymentValues: RepaymentFormValues = {
      loanId,
      assetAccountId: 'asset-account',
      amount: 30,
    };

    await recordRepayment('user-1', loanObj, repaymentValues);

    // Expect a set (transaction) and an update (loan status)
    expect(txCalls.find(c => c.method === 'set')).toBeTruthy();
    const updateCall = txCalls.find(c => c.method === 'update');
    expect(updateCall).toBeTruthy();
    expect(updateCall!.data).toHaveProperty('status', 'partially_repaid');
  });
});
