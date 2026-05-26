import type { Transaction } from '../types';

export const ACCOUNT_TRANSFER_CATEGORY_ID = 'account-transfer';

export function isAccountTransferTransaction(transaction: Pick<Transaction, 'categoryId'>): boolean {
  return transaction.categoryId === ACCOUNT_TRANSFER_CATEGORY_ID;
}
