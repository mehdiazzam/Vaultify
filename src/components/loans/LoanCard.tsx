import { useState } from 'react';
import { ChevronDown, CreditCard } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import RepaymentForm from './RepaymentForm';
import type { Loan } from '@/types';

interface Props {
  loan: Loan;
  onRepaymentSuccess?: () => void;
  isHistoryOpen?: boolean;
  onToggleHistory?: (loanId: string) => void;
}

const statusColors: Record<Loan['status'], string> = {
  active: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  partially_repaid:
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  settled: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function LoanCard({ loan, onRepaymentSuccess, isHistoryOpen = false, onToggleHistory }: Props) {
  const [showRepay, setShowRepay] = useState(false);

  const progress = ((loan.amountRepaid ?? 0) / loan.amount) * 100;
  const isBorrow = loan.type === 'borrowed';

  return (
    <GlassCard className="min-h-[18rem] w-full p-5 flex flex-col">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  isBorrow
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                }`}
              >
                {isBorrow ? '⬇ Borrowed' : '⬆ Lent'}
              </span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {loan.counterparty}
            </p>
            {loan.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {loan.description}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {loan.currency} {loan.amount.toFixed(2)}
            </p>
            <span className={`text-xs px-2 py-1 rounded-full inline-block ${statusColors[loan.status]}`}>
              {loan.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="space-y-3 mt-auto pt-4">
          <div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Repaid: {loan.currency} {(loan.amountRepaid ?? 0).toFixed(2)}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {loan.dueDate && loan.status !== 'settled' && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Due: {
                  typeof loan.dueDate === 'string'
                    ? new Date(loan.dueDate).toLocaleDateString()
                    : typeof loan.dueDate?.toDate === 'function'
                      ? loan.dueDate.toDate().toLocaleDateString()
                      : 'N/A'
                }
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {loan.status !== 'settled' && (
              <>
                <button
                  onClick={() => setShowRepay(!showRepay)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm w-fit"
                >
                  <CreditCard className="size-4" />
                  {showRepay ? 'Cancel' : 'Record Repayment'}
                </button>
                {showRepay && (
                  <RepaymentForm
                    loan={loan}
                    onSuccess={() => {
                      setShowRepay(false);
                      onRepaymentSuccess?.();
                    }}
                  />
                )}
              </>
            )}

            <button
              onClick={() => onToggleHistory?.(loan.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span>Transaction History</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
