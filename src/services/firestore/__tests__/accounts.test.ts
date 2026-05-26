import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUserCollectionMock: vi.fn(),
}));

vi.mock('../helpers', () => ({
  getUserCollection: mocks.getUserCollectionMock,
}));

import { getAccounts } from '../accounts';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getAccounts', () => {
  it('filters hidden accounts by default', async () => {
    mocks.getUserCollectionMock.mockResolvedValueOnce([
      { id: 'visible', name: 'Visible', isHidden: false },
      { id: 'hidden', name: 'Hidden', isHidden: true },
    ]);

    await expect(getAccounts('user-1')).resolves.toEqual([
      { id: 'visible', name: 'Visible', isHidden: false },
    ]);
  });

  it('can include hidden accounts for finance aggregation', async () => {
    mocks.getUserCollectionMock.mockResolvedValueOnce([
      { id: 'visible', name: 'Visible', isHidden: false },
      { id: 'hidden', name: 'Hidden', isHidden: true },
    ]);

    await expect(getAccounts('user-1', true)).resolves.toEqual([
      { id: 'visible', name: 'Visible', isHidden: false },
      { id: 'hidden', name: 'Hidden', isHidden: true },
    ]);
  });
});
