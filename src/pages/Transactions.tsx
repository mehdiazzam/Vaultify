import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { TransactionSkeleton } from '../components/ui/Skeleton';
import { IncomeTrxForm } from '../components/transactions/IncomeTrxForm';
import { ExpenseTrxForm } from '../components/transactions/ExpenseTrxForm';
import { GoalTrxForm } from '../components/transactions/GoalTrxForm';
import { AccountTransferForm } from '../components/transactions/AccountTransferForm';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { useFinanceStore } from '../stores/financeStore';
import PageContainer from '@/components/layout/PageContainer';
import { useGlobalActions } from '../hooks/useGlobalActions';
import useTransactions, { useUpdateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { staggerItem } from '../animations/variants';
import type { Transaction, TransactionItem as TransactionItemType } from '../types';
import { isAccountTransferTransaction } from '../utils/transactions';

export default function Transactions() {
  const { searchQuery, selectedCategoryId, transactions: storeTransactions } = useFinanceStore();
  const { data: fetchedTransactions = [], isLoading, error } = useTransactions();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const { openAction } = useGlobalActions();
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [formError, setFormError] = useState('');

  const transactionsSource = fetchedTransactions.length > 0 ? fetchedTransactions : storeTransactions;

  const filtered = transactionsSource.filter((t) => {
    const matchesSearch = !searchQuery || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryId === 'all' || t.categoryId === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  const isSaving = updateTransaction.isPending;

  const handleEdit = async (data: { categoryId: string; description: string; date: string; relatedGoalId?: string; exchangeRate?: number; items: TransactionItemType[] }) => {
    if (editingTx) {
      setFormError('');
      try {
        await updateTransaction.mutateAsync({ id: editingTx.id, data });
        setEditingTx(null);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Could not update transaction.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction.mutateAsync(id);
    } catch {
      setFormError('Could not delete transaction.');
    }
  };

  return (
    <PageContainer>
      <motion.div variants={staggerItem} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white text-slate-900">Transactions</h1>
          <p className="text-sm dark:text-slate-500 text-slate-500 mt-0.5">{filtered.length} transactions found</p>
        </div>
      </motion.div>
      {(error || formError) && (
        <motion.div variants={staggerItem}>
          <GlassCard>
            <p className="text-sm text-rose-400">{formError || error?.message}</p>
          </GlassCard>
        </motion.div>
      )}

      <motion.div variants={staggerItem}>
        <TransactionFilters />
      </motion.div>

      <motion.div variants={staggerItem}>
        <GlassCard padding="none" className="overflow-hidden">
          {isLoading ? (
            <div className="divide-y dark:divide-white/4 divide-black/4">
              {Array.from({ length: 5 }, (_, index) => <TransactionSkeleton key={index} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No transactions found"
              description="Add your first transaction or adjust the filters"
              action={<Button onClick={() => openAction('expense')} icon={<Plus size={16} />} size="sm">Add Transaction</Button>}
            />
          ) : (
            <div className="divide-y dark:divide-white/4 divide-black/4">
              <AnimatePresence>
                {filtered.map((t) => (
                  <TransactionItem
                    key={t.id}
                    transaction={t}
                    onEdit={(tx) => { setFormError(''); setEditingTx(tx); }}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>
      </motion.div>

      <Modal
        open={!!editingTx}
        onClose={() => setEditingTx(null)}
        title={`Edit ${
          editingTx && isAccountTransferTransaction(editingTx)
            ? 'Account Transfer'
            : editingTx?.relatedGoalId
              ? 'Goal Collection'
              : editingTx?.items.some((item) => item.debit > item.credit)
                ? 'Expense'
                : 'Income'
        }`}
        size="lg"
      >
        {editingTx && (
          <>
            {isAccountTransferTransaction(editingTx) ? (
              <AccountTransferForm
                onSubmit={handleEdit}
                onCancel={() => setEditingTx(null)}
                loading={isSaving}
                error={formError}
                initial={editingTx}
              />
            ) : editingTx.relatedGoalId ? (
              <GoalTrxForm
                onSubmit={handleEdit}
                onCancel={() => setEditingTx(null)}
                loading={isSaving}
                error={formError}
                initial={editingTx}
              />
            ) : (
              <>
                {editingTx.items.some(i => i.debit > i.credit) ? (
                  <ExpenseTrxForm
                    onSubmit={handleEdit}
                    onCancel={() => setEditingTx(null)}
                    loading={isSaving}
                    error={formError}
                    initial={editingTx}
                  />
                ) : (
                  <IncomeTrxForm
                    onSubmit={handleEdit}
                    onCancel={() => setEditingTx(null)}
                    loading={isSaving}
                    error={formError}
                    initial={editingTx}
                  />
                )}
              </>
            )}
          </>
        )}
      </Modal>
    </PageContainer>
  );
}
