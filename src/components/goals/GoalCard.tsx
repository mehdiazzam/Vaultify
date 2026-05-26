import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Button } from '@/components/ui/Button';
import GoalTransactionHistory from '@/components/goals/GoalTransactionHistory';
import { Trash, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/utils';
import type { SavingsGoal, Transaction, Account } from '@/types';
import type { GlobalActionId } from '@/actions/types';

interface Props {
  goal: SavingsGoal & { saved: number; pct: number; remaining: number; currency?: string };
  transactions: Transaction[];
  accounts: Account[];
  openActionForGoal: (action: GlobalActionId, id?: string | null) => void;
  deleteGoal: { mutateAsync: (id: string) => Promise<void> };
}

export default function GoalCard({ goal, transactions, accounts, openActionForGoal, deleteGoal }: Props) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <GlassCard className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${goal.color}15` }}>
          <span className="text-lg">{goal.icon === 'Shield' ? '🛡️' : goal.icon === 'Plane' ? '✈️' : '💻'}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium dark:text-slate-200 text-slate-800">{goal.title}</h3>
          <p className="text-[11px] dark:text-slate-500 text-slate-500">Due {goal.deadline}</p>
        </div>
      </div>

      {goal.description && (
        <p className="text-xs dark:text-slate-500 text-slate-400 mb-4">{goal.description}</p>
      )}

      <div className="flex items-end justify-between mb-3">
        <div>
          <span className="text-lg font-bold dark:text-white text-slate-900">{formatCurrency(goal.saved, goal.currency)}</span>
          <p className="text-xs dark:text-slate-500 text-slate-500">of {formatCurrency(goal.amount, goal.currency)}</p>
        </div>
        <ProgressRing progress={goal.pct} size={48} strokeWidth={4} color={goal.color}>
          <span className="text-[10px] font-bold" style={{ color: goal.color }}>{Math.round(goal.pct)}%</span>
        </ProgressRing>
      </div>

      <div className="h-2 rounded-full dark:bg-white/5 bg-black/5 overflow-hidden mb-3">
        <div
          className="h-full rounded-full"
          style={{ background: goal.color, width: `${goal.pct}%`, transition: 'width 1s ease-out' }}
        />
      </div>

      <div className="text-xs dark:text-slate-400 text-slate-600 font-medium">{goal.remaining > 0 ? `${formatCurrency(goal.remaining, goal.currency)} remaining` : '🎉 Goal achieved!'}</div>

      <div className="flex items-center mt-4 pt-4 w-full">
        <div className="flex-1">
          <Button size="sm" variant="danger" className="w-full text-left" onClick={async () => {
            if (!confirm('Delete this goal and remove all related transactions? This cannot be undone.')) return;
            try {
              await deleteGoal.mutateAsync(goal.id);
            } catch (err) {
               
              console.error('Failed to delete goal:', err);
              alert(err instanceof Error ? err.message : 'Failed to delete goal');
            }
          }}>
            <Trash size={14} className="mr-2" />Delete
          </Button>
        </div>

        <div className="flex-1">
          <Button size="sm" variant="secondary" className="w-full ml-2" onClick={() => openActionForGoal('goal-transaction', goal.id)}>
            Add Funds
            <Plus size={14} className="ml-2" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={() => setShowHistory((s) => !s)}
          className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:dark:text-white"
        >
          <span>Transactions</span>
          {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {showHistory && (
        <div className="mt-3">
          <GoalTransactionHistory transactions={transactions} accounts={accounts} currency={goal.currency} />
        </div>
      )}
    </GlassCard>
  );
}
