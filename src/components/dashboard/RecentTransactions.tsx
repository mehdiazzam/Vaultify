import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency, formatRelativeDate } from '../../utils';
import { staggerContainer, staggerItem } from '../../animations/variants';
import { useFinanceStore } from '../../stores/financeStore';
import type { Transaction } from '../../types';

interface Props {
  transactions: Transaction[];
  currency?: string;
}

export function RecentTransactions({ transactions, currency = 'USD' }: Props) {
  const { accounts, categories } = useFinanceStore();
  const recent = transactions.slice(0, 6);

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
        <h3 className="text-sm font-medium dark:text-slate-400 text-slate-600">Recent Transactions</h3>
        <span className="text-xs dark:text-slate-600 text-slate-400">{transactions.length} total</span>
      </div>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="divide-y dark:divide-white/4 divide-black/4"
      >
        {recent.length === 0 ? (
          <EmptyState title="No transactions yet" description="Add a transaction to see recent activity" />
        ) : recent.map((t) => {
          const totalDebit = t.items.reduce((sum, item) => sum + item.debit, 0);
          const totalCredit = t.items.reduce((sum, item) => sum + item.credit, 0);
          const amount = totalDebit || totalCredit;
          const isIncome = totalCredit > 0 && accounts.some((a) => a.id === t.items.find((i) => i.credit > 0)?.accountId && a.accounting === 'income');
          const categoryName = categories.find((c) => c.id === t.categoryId)?.name ?? 'Unknown';
          const Icon = isIncome ? TrendingUp : TrendingDown;

          return (
            <motion.div
              key={t.id}
              variants={staggerItem}
              className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-black/2 dark:hover:bg-white/2 sm:items-center sm:gap-4 sm:px-5"
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: isIncome ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)' }}
              >
                <Icon size={15} style={{ color: isIncome ? '#34d399' : '#fb7185' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium dark:text-slate-200 text-slate-800 truncate">{t.description}</p>
                <p className="text-[11px] dark:text-slate-600 text-slate-400">
                  {categoryName} · {formatRelativeDate(t.date)}
                </p>
              </div>
              <span className={`shrink-0 text-sm font-semibold tabular-nums ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(amount, currency)}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </GlassCard>
  );
}
