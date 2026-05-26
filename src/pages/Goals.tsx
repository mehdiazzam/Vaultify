import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useFinanceStore } from '../stores/financeStore';
import { useFinanceData } from '../hooks/useFinanceData';
import { useGoals, useDeleteGoalWithTransactions } from '../hooks/useGoals';
import { useTransactions } from '../hooks/useTransactions';
import GoalCard from '@/components/goals/GoalCard';
import { useGlobalActions } from '../hooks/useGlobalActions';
import { staggerItem } from '../animations/variants';
import PageContainer from '@/components/layout/PageContainer';
import { Plus } from 'lucide-react';

export default function Goals() {
  const { savingsGoals: storeGoals, transactions: storeTransactions, accounts } = useFinanceStore();
  const { error } = useFinanceData();
  const { openAction, openActionForGoal } = useGlobalActions();

  // Prefer freshly fetched goals and transactions via hooks when available
  const { data: goals = [] } = useGoals();
  // Request transactions including goal-linked transactions for accurate progress and history
  const { data: transactions = [] } = useTransactions({ includeGoalTransactions: true });
  const deleteGoal = useDeleteGoalWithTransactions();

  const savingsGoals = goals.length > 0 ? goals : storeGoals;
  const transactionsSource = transactions.length > 0 ? transactions : storeTransactions;

  // Compute progress for each goal from transactions
  const goalsWithProgress = useMemo(() => {
    return savingsGoals.map((goal) => {
      const currency = goal.currency ?? 'USD';
      const saved = transactionsSource
        .filter((tx) => tx.relatedGoalId === goal.id)
        .reduce((sum, tx) => {
          return (
            sum +
            tx.items.reduce((s, item) => {
              const acc = accounts.find((a) => a.id === item.accountId);
              if (acc?.isSaving) return s + (item.debit - item.credit);
              return s;
            }, 0)
          );
        }, 0);

      const pct = goal.amount > 0 ? Math.min((saved / goal.amount) * 100, 100) : 0;
      const remaining = Math.max(goal.amount - saved, 0);

      return {
        ...goal,
        saved,
        pct,
        remaining,
        currency,
      };
    });
  }, [savingsGoals, transactionsSource, accounts]);

  return (
    <PageContainer>
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white text-slate-900">Savings Goals</h1>
          <p className="text-sm dark:text-slate-500 text-slate-500 mt-0.5">Track your savings objectives and progress</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button onClick={() => openAction('savings-goal')} icon={<Plus size={16} />} size="sm">
            New Goal
          </Button>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={staggerItem}>
          <GlassCard>
            <p className="text-sm text-rose-400">{error.message}</p>
          </GlassCard>
        </motion.div>
      )}

      {/* Savings Goals Grid */}
      <motion.div variants={staggerItem}>
        {goalsWithProgress.length === 0 ? (
          <GlassCard>
            <EmptyState
              title="No savings goals yet"
              description="Create savings goals to track your progress towards your financial objectives"
              action={<Button onClick={() => openAction('savings-goal')} icon={<Plus size={16} />} size="sm">Create Goal</Button>}
            />
          </GlassCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goalsWithProgress.map((goal) => (
              <motion.div key={goal.id} variants={staggerItem}>
                <GoalCard
                  goal={goal}
                  transactions={transactionsSource.filter((tx) => tx.relatedGoalId === goal.id)}
                  accounts={accounts}
                  openActionForGoal={openActionForGoal}
                  deleteGoal={deleteGoal}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}
