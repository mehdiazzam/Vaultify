import type { Transaction, Account } from '@/types';
import { formatCurrency } from '@/utils';

interface Props {
  transactions: Transaction[];
  accounts: Account[];
  currency?: string;
}

export default function GoalTransactionHistory({ transactions, accounts, currency }: Props) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">No goal transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
      {transactions.map((tx) => {
        const amount = tx.items.reduce((sum, item) => {
          const acc = accounts.find((a) => a.id === item.accountId);
          if (acc?.isSaving) return sum + (item.debit - item.credit);
          return sum;
        }, 0);

        const date = new Date(tx.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

        return (
          <div key={tx.id} className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-200 truncate">{tx.description || 'Goal deposit'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
              <div>{date}</div>
              <div className="font-medium">{formatCurrency(amount, currency)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
