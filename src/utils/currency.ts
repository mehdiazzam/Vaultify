import type { Account, Transaction, TransactionItem, Currency } from '../types';

export function formatCurrency(amount: number, currency = 'USD', compact = false): string {
  if (compact && Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getAccountRate(account: Account | undefined, currencies: Currency[]): number {
  if (!account) return 1;
  // Look up the currency from the currencies array using the account's currency field
  const currency = currencies.find((c) => c.iso === account.currency);
  return currency?.rateToUsd ?? 1;
}

export function convertItemToUsd(item: TransactionItem, accounts: Account[], currencies: Currency[]): number {
  const acc = accounts.find((a) => a.id === item.accountId);
  const rate = getAccountRate(acc, currencies);
  const value = item.debit > 0 ? item.debit : item.credit;
  return value * rate;
}

export function convertTransactionToUsd(transaction: Transaction, accounts: Account[], currencies: Currency[]): number {
  const debit = transaction.items.reduce((sum, it) => sum + (it.debit > 0 ? convertItemToUsd(it, accounts, currencies) : 0), 0);
  if (debit > 0) return debit;
  return transaction.items.reduce((sum, it) => sum + (it.credit > 0 ? convertItemToUsd(it, accounts, currencies) : 0), 0);
}

export function isTransactionIncome(transaction: Transaction, accounts: Account[]): boolean {
  return transaction.items.some((item) => {
    const acc = accounts.find((a) => a.id === item.accountId);
    return acc?.accounting === 'income' && item.credit > 0;
  });
}
