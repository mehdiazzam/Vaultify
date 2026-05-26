import { useState } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import { IncomeTrxForm } from '../transactions/IncomeTrxForm';
import { ExpenseTrxForm } from '../transactions/ExpenseTrxForm';
import { GoalTrxForm } from '../transactions/GoalTrxForm';
import { AccountTransferForm } from '../transactions/AccountTransferForm';
import AccountForm from '../accounts/AccountForm';
import { BudgetForm } from '../budget/BudgetForm';
import { SavingsGoalForm } from '../budget/SavingsGoalForm';
import LoanForm from '../loans/LoanForm';
import Calculator from './Calculator';
import { useGlobalActions } from '../../hooks/useGlobalActions';
import { GLOBAL_ACTIONS_BY_ID } from '../../actions/registry';
import type { GlobalActionId } from '../../actions/types';
import { useFinanceData } from '../../hooks/useFinanceData';

interface ActionFormError {
  actionId: GlobalActionId;
  message: string;
}

export function GlobalActionModals() {
  const { activeAction, closeAction } = useGlobalActions();
  const {
    createTransaction,
    createBudget,
    createSavingsGoal,
  } = useFinanceData();
  const [formError, setFormError] = useState<ActionFormError | null>(null);

  if (!activeAction) return null;

  const action = GLOBAL_ACTIONS_BY_ID[activeAction];
  if (!action) {
    return null;
  }
  if (activeAction === 'calculator') {
    return <Calculator onClose={closeAction} />;
  }
  const formErrorMessage = formError?.actionId === activeAction ? formError.message : '';

  const handleCreateIncome = async (data: {
    categoryId: string;
    description: string;
    date: string;
    items: Array<{ accountId: string; debit: number; credit: number }>;
  }) => {
    setFormError(null);
    try {
      await createTransaction.mutateAsync(data);
      closeAction();
    } catch (err) {
      setFormError({
        actionId: activeAction,
        message: err instanceof Error ? err.message : 'Could not save income transaction.',
      });
    }
  };

  const handleCreateExpense = async (data: {
    categoryId: string;
    description: string;
    date: string;
    items: Array<{ accountId: string; debit: number; credit: number }>;
  }) => {
    setFormError(null);
    try {
      await createTransaction.mutateAsync(data);
      closeAction();
    } catch (err) {
      setFormError({
        actionId: activeAction,
        message: err instanceof Error ? err.message : 'Could not save expense transaction.',
      });
    }
  };

  const handleCreateTransfer = async (data: {
    categoryId: string;
    description: string;
    date: string;
    exchangeRate?: number;
    items: Array<{ accountId: string; debit: number; credit: number }>;
  }) => {
    setFormError(null);
    try {
      await createTransaction.mutateAsync(data);
      closeAction();
    } catch (err) {
      setFormError({
        actionId: activeAction,
        message: err instanceof Error ? err.message : 'Could not save account transfer.',
      });
    }
  };

  const handleCreateGoalTransaction = async (data: {
    categoryId: string;
    description: string;
    date: string;
    relatedGoalId: string;
    items: Array<{ accountId: string; debit: number; credit: number }>;
  }) => {
    setFormError(null);
    try {
      await createTransaction.mutateAsync(data);
      closeAction();
    } catch (err) {
      setFormError({
        actionId: activeAction,
        message: err instanceof Error ? err.message : 'Could not save goal transaction.',
      });
    }
  };

  const handleCreateBudget = async (data: {
    categoryId: string;
    amount: number;
    recurring: 'weekly' | 'monthly' | 'annual';
    currency: string;
  }) => {
    setFormError(null);
    try {
      await createBudget.mutateAsync(data);
      closeAction();
    } catch (err) {
      setFormError({
        actionId: activeAction,
        message: err instanceof Error ? err.message : 'Could not save budget.',
      });
    }
  };

  const handleCreateSavingsGoal = async (data: {
    title: string;
    description: string;
    amount: number;
    deadline: string;
    icon: string;
    color: string;
    currency: string;
  }) => {
    setFormError(null);
    try {
      await createSavingsGoal.mutateAsync(data);
      closeAction();
    } catch (err) {
      setFormError({
        actionId: activeAction,
        message: err instanceof Error ? err.message : 'Could not save savings goal.',
      });
    }
  };

  return (
    <Modal
      open={Boolean(activeAction)}
      onClose={closeAction}
      title={action.modalTitle}
      size="lg"
    >
      {activeAction === 'income' && (
        <IncomeTrxForm
          onSubmit={handleCreateIncome}
          onCancel={closeAction}
          loading={createTransaction.isPending}
          error={formErrorMessage}
        />
      )}
      {activeAction === 'expense' && (
        <ExpenseTrxForm
          onSubmit={handleCreateExpense}
          onCancel={closeAction}
          loading={createTransaction.isPending}
          error={formErrorMessage}
        />
      )}
      {activeAction === 'transfer' && (
        <AccountTransferForm
          onSubmit={handleCreateTransfer}
          onCancel={closeAction}
          loading={createTransaction.isPending}
          error={formErrorMessage}
        />
      )}
      {activeAction === 'goal-transaction' && (
        <GoalTrxForm
          onSubmit={handleCreateGoalTransaction}
          onCancel={closeAction}
          loading={createTransaction.isPending}
          error={formErrorMessage}
        />
      )}
      {activeAction === 'account' && (
        <div className="space-y-4">
          {formErrorMessage && <p className="text-sm text-rose-400">{formErrorMessage}</p>}
          <AccountForm onSuccess={closeAction} />
          <div className="pt-2">
            <Button type="button" variant="secondary" onClick={closeAction} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}
      {activeAction === 'budget' && (
        <BudgetForm
          onSubmit={handleCreateBudget}
          onCancel={closeAction}
          loading={createBudget.isPending}
          error={formErrorMessage}
        />
      )}
      {activeAction === 'savings-goal' && (
        <SavingsGoalForm
          onSubmit={handleCreateSavingsGoal}
          onCancel={closeAction}
          loading={createSavingsGoal.isPending}
          error={formErrorMessage}
        />
      )}
      {activeAction === 'add-loan' && (
        <LoanForm onSuccess={closeAction} />
      )}
    </Modal>
  );
}
