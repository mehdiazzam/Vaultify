import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getTransactionsMock: vi.fn(),
  getBudgetsMock: vi.fn(),
  getSavingsGoalsMock: vi.fn(),
  getUserCollectionMock: vi.fn(),
  getAccountsMock: vi.fn(),
  getCategoriesMock: vi.fn(),
  getCurrenciesMock: vi.fn(),
}));

vi.mock('../transactions', () => ({
  getTransactions: mocks.getTransactionsMock,
}));

vi.mock('../budgets', () => ({
  getBudgets: mocks.getBudgetsMock,
}));

vi.mock('../savings', () => ({
  getSavingsGoals: mocks.getSavingsGoalsMock,
}));

vi.mock('../categories', () => ({
  getCategories: mocks.getCategoriesMock,
  getCurrencies: mocks.getCurrenciesMock,
}));

vi.mock('../accounts', () => ({
  getAccounts: mocks.getAccountsMock,
}));

vi.mock('../helpers', () => ({
  getUserCollection: mocks.getUserCollectionMock,
}));

import { getFinanceData } from '../finance';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getTransactionsMock.mockResolvedValue([]);
  mocks.getBudgetsMock.mockResolvedValue([]);
  mocks.getSavingsGoalsMock.mockResolvedValue([]);
  mocks.getUserCollectionMock.mockResolvedValue([]);
  mocks.getAccountsMock.mockResolvedValue([{ id: 'visible' }, { id: 'hidden', isHidden: true }]);
  mocks.getCategoriesMock.mockResolvedValue([]);
  mocks.getCurrenciesMock.mockResolvedValue([]);
});

describe('getFinanceData', () => {
  it('loads hidden accounts for finance aggregation', async () => {
    const result = await getFinanceData('user-1');

    expect(mocks.getAccountsMock).toHaveBeenCalledWith('user-1', true);
    expect(result.accounts).toEqual([{ id: 'visible' }, { id: 'hidden', isHidden: true }]);
  });
});
