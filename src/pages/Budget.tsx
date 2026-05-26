import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useFinanceStore } from '../stores/financeStore';
import { useFinanceData } from '../hooks/useFinanceData';
import { useGlobalActions } from '../hooks/useGlobalActions';
import { useBudgets } from '../hooks/useBudgets';
import { useTransactions } from '../hooks/useTransactions';
import { staggerItem } from '../animations/variants';
import PageContainer from '@/components/layout/PageContainer';
import { formatCurrency } from '../utils';
import { Plus, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Budget() {
  const { budgets: storeBudgets, transactions: storeTransactions, accounts, categories } = useFinanceStore();
  const { error } = useFinanceData();
  const { openAction } = useGlobalActions();

  const { data: budgets = [] } = useBudgets();
  const { data: transactions = [] } = useTransactions();

  const budgetsSource = budgets.length > 0 ? budgets : storeBudgets;
  const transactionsSource = transactions.length > 0 ? transactions : storeTransactions;

  // Calculate spending per category
  const budgetsWithSpending = useMemo(() => {
    const categorySpending: Record<string, number> = {};
    const expenseAccounts = accounts.filter((a) => a.accounting === 'expense' && !a.isHidden).map((a) => a.id);

    transactionsSource.forEach((tx) => {
      const expenseItems = tx.items.filter((item) => expenseAccounts.includes(item.accountId));
      const categoryTotal = expenseItems.reduce((sum, item) => sum + item.debit, 0);
      categorySpending[tx.categoryId] = (categorySpending[tx.categoryId] ?? 0) + categoryTotal;
    });

    return budgetsSource.map((budget) => ({
      ...budget,
      spent: categorySpending[budget.categoryId] ?? 0,
    }));
  }, [budgetsSource, transactionsSource, accounts]);

  return (
    <PageContainer>
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white text-slate-900">Budgets</h1>
          <p className="text-sm dark:text-slate-500 text-slate-500 mt-0.5">Set spending limits and track expenses by category</p>
        </div>
        <Button onClick={() => openAction('budget')} icon={<Plus size={16} />} size="sm">
          New Budget
        </Button>
      </motion.div>

      {error && (
        <motion.div variants={staggerItem}>
          <GlassCard>
            <p className="text-sm text-rose-400">{error.message}</p>
          </GlassCard>
        </motion.div>
      )}

      {/* Budget Cards */}
      <motion.div variants={staggerItem}>
        <h2 className="text-sm font-medium dark:text-slate-400 text-slate-600 mb-3 uppercase tracking-wider">Budgets</h2>
        {budgetsWithSpending.length === 0 ? (
          <GlassCard>
            <EmptyState
              title="No budgets yet"
              description="Create budgets to track spending limits here"
              action={<Button onClick={() => openAction('budget')} icon={<Plus size={16} />} size="sm">New Budget</Button>}
            />
          </GlassCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetsWithSpending.map((b) => {
            const categoryName = categories.find((c) => c.id === b.categoryId)?.name ?? 'Unknown';
            const currency = b.currency ?? 'USD';
            const pct = b.amount > 0 ? Math.min((b.spent / b.amount) * 100, 100) : 0;
            const isOver = b.spent > b.amount * 0.9;
            const color = isOver ? '#fb7185' : pct > 60 ? '#fbbf24' : '#34d399';

            return (
              <motion.div key={b.id} variants={staggerItem}>
                <GlassCard className="relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium dark:text-slate-200 text-slate-800">{categoryName}</h3>
                      <p className="text-xs dark:text-slate-500 text-slate-500 mt-0.5">
                        {formatCurrency(b.spent, currency)} of {formatCurrency(b.amount, currency)}
                      </p>
                    </div>
                    <ProgressRing progress={pct} size={48} strokeWidth={4} color={color}>
                      <span className="text-[10px] font-bold" style={{ color }}>{Math.round(pct)}%</span>
                    </ProgressRing>
                  </div>
                  <div className="h-2 rounded-full dark:bg-white/5 bg-black/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-3">
                    {isOver ? (
                      <>
                        <AlertTriangle size={12} className="text-rose-400" />
                        <span className="text-[11px] text-rose-400">Near limit — slow down spending</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={12} className="text-emerald-400" />
                        <span className="text-[11px] text-emerald-400">{formatCurrency(b.amount - b.spent, currency)} remaining</span>
                      </>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
          </div>
        )}
      </motion.div>

    </PageContainer>
  );
}
