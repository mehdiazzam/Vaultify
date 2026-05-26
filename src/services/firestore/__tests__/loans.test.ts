import { Timestamp } from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  collectionMock: vi.fn(),
  docMock: vi.fn(),
  getDocsMock: vi.fn(),
  queryMock: vi.fn(),
  whereMock: vi.fn(),
  getOrCreateLoanAccountsMock: vi.fn(),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');

  return {
    ...actual,
    collection: mocks.collectionMock,
    doc: mocks.docMock,
    getDocs: mocks.getDocsMock,
    query: mocks.queryMock,
    where: mocks.whereMock,
  };
});

vi.mock('../helpers', () => ({
  requireDb: vi.fn(() => ({})),
  mapDoc: vi.fn((snapshotDoc: { id: string; data: () => Record<string, unknown> }) => ({
    id: snapshotDoc.id,
    ...snapshotDoc.data(),
  })),
  getAccountById: vi.fn(),
}));

vi.mock('../accounts', () => ({
  getOrCreateLoanAccounts: mocks.getOrCreateLoanAccountsMock,
}));

import { fetchLoans } from '../loans';

interface MockDoc<T> {
  id: string;
  data: () => T;
}

interface MockSnapshot<T> {
  docs: Array<MockDoc<T>>;
}

function makeDoc<T extends Record<string, unknown>>(id: string, data: T): MockDoc<T> {
  return {
    id,
    data: () => data,
  };
}

function makeSnapshot<T extends Record<string, unknown>>(docs: Array<MockDoc<T>>): MockSnapshot<T> {
  return { docs };
}

function makeTimestamp(value: string): Timestamp {
  return Timestamp.fromDate(new Date(value));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchLoans', () => {
  it('sorts loan transactions chronologically and excludes the opening entry from amountRepaid', async () => {
    const loanData = {
      userId: 'user-1',
      type: 'borrowed' as const,
      counterparty: 'Alice',
      amount: 100,
      currency: 'USD',
      status: 'active' as const,
      createdAt: makeTimestamp('2026-05-01T09:00:00.000Z'),
    };

    const openingTransaction = {
      userId: 'user-1',
      categoryId: 'borrow',
      description: 'Borrowed from Alice',
      date: '2026-05-01',
      items: [
        { accountId: 'asset-account', debit: 100, credit: 0 },
        { accountId: 'loan-payable', debit: 0, credit: 100 },
      ],
      relatedLoanId: 'loan-1',
      createdAt: makeTimestamp('2026-05-01T09:00:00.000Z'),
    };

    const firstRepayment = {
      userId: 'user-1',
      categoryId: 'borrow',
      description: 'Repayment to Alice',
      date: '2026-05-08',
      items: [
        { accountId: 'loan-payable', debit: 25, credit: 0 },
        { accountId: 'asset-account', debit: 0, credit: 25 },
      ],
      relatedLoanId: 'loan-1',
      createdAt: makeTimestamp('2026-05-08T09:00:00.000Z'),
    };

    const secondRepayment = {
      userId: 'user-1',
      categoryId: 'borrow',
      description: 'Repayment to Alice',
      date: '2026-05-15',
      items: [
        { accountId: 'loan-payable', debit: 15, credit: 0 },
        { accountId: 'asset-account', debit: 0, credit: 15 },
      ],
      relatedLoanId: 'loan-1',
      createdAt: makeTimestamp('2026-05-15T09:00:00.000Z'),
    };

    mocks.getDocsMock
      .mockResolvedValueOnce(makeSnapshot([makeDoc('loan-1', loanData)]))
      .mockResolvedValueOnce(
        makeSnapshot([
          makeDoc('tx-repayment-2', secondRepayment),
          makeDoc('tx-opening', openingTransaction),
          makeDoc('tx-repayment-1', firstRepayment),
        ])
      );

    const loans = await fetchLoans('user-1');

    expect(loans).toHaveLength(1);
    expect(loans[0].amountRepaid).toBe(40);
    expect(loans[0].transactions?.map((transaction) => transaction.id)).toEqual([
      'tx-opening',
      'tx-repayment-1',
      'tx-repayment-2',
    ]);
  });

  it('returns zero repaid amount when only the opening transaction exists', async () => {
    const loanData = {
      userId: 'user-1',
      type: 'lent' as const,
      counterparty: 'Bob',
      amount: 80,
      currency: 'USD',
      status: 'active' as const,
      createdAt: makeTimestamp('2026-05-02T09:00:00.000Z'),
    };

    const openingTransaction = {
      userId: 'user-1',
      categoryId: 'lend',
      description: 'Lent to Bob',
      date: '2026-05-02',
      items: [
        { accountId: 'loan-receivable', debit: 80, credit: 0 },
        { accountId: 'asset-account', debit: 0, credit: 80 },
      ],
      relatedLoanId: 'loan-2',
      createdAt: makeTimestamp('2026-05-02T09:00:00.000Z'),
    };

    mocks.getDocsMock
      .mockResolvedValueOnce(makeSnapshot([makeDoc('loan-2', loanData)]))
      .mockResolvedValueOnce(makeSnapshot([makeDoc('tx-opening', openingTransaction)]));

    const loans = await fetchLoans('user-1');

    expect(loans).toHaveLength(1);
    expect(loans[0].amountRepaid).toBe(0);
    expect(loans[0].transactions).toHaveLength(1);
  });
});
