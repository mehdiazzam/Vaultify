import type { Loan } from '@/types';

interface Props {
  loan: Loan;
}

export default function LoanTransactionHistory({ loan }: Props) {
  if (!loan.transactions || loan.transactions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-center py-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          No transactions yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {loan.transactions.map((tx, index, arr) => {
        const isOpening = index === 0;
        const txAmount = tx!.items.reduce((sum, item) => sum + item.debit, 0);
        const cumulativeAmount =
          arr
            .slice(0, index + 1)
            .reduce((sum, t) => sum + t!.items.reduce((s, i) => s + i.debit, 0), 0);

        const dateObj = new Date(tx!.date);
        const dateStr = dateObj.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        return (
          <div
            key={tx!.id}
            className="flex gap-2 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full ${
                  isOpening
                    ? 'bg-blue-500'
                    : 'bg-green-500'
                }`}
              />
              {index < arr.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 mt-1" />
              )}
            </div>

            {/* Transaction details */}
            <div className="flex-1 pt-0.5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {isOpening ? 'Loan Created' : 'Repayment'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {dateStr}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {loan.currency} {txAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total: {loan.currency} {cumulativeAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              {tx!.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {tx!.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
