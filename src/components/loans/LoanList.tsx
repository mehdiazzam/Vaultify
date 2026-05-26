import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import { GlassCard } from '@/components/ui/GlassCard';
import LoanCard from './LoanCard';
import LoanTransactionHistory from './LoanTransactionHistory';
import type { Loan } from '@/types';

interface Props {
  loans: Loan[];
  isLoading?: boolean;
  onRepaymentSuccess?: () => void;
  openHistoryLoanId?: string | null;
  onToggleHistory?: (loanId: string) => void;
}

export default function LoanList({
  loans,
  isLoading = false,
  onRepaymentSuccess,
  openHistoryLoanId,
  onToggleHistory,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-56 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No loans found. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {loans.map((loan) => (
        <div
          key={loan.id}
          className="grid gap-4 lg:grid-cols-2 lg:items-start"
        >
          <LoanCard
            loan={loan}
            onRepaymentSuccess={onRepaymentSuccess}
            isHistoryOpen={openHistoryLoanId === loan.id}
            onToggleHistory={onToggleHistory}
          />

          <AnimatePresence mode="popLayout">
            {openHistoryLoanId === loan.id && (
              <motion.div
                key={`${loan.id}-history`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
              >
                <GlassCard className="h-[18rem] p-5 flex flex-col overflow-hidden w-full">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{loan.counterparty}</p>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleHistory?.(loan.id)}
                      aria-label="Close transaction history"
                      className="inline-flex size-9 items-center justify-center rounded-full bg-black/5 text-gray-500 transition-colors hover:bg-black/10 hover:text-gray-900 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                    <LoanTransactionHistory loan={loan} />
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
