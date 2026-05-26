import { useMemo, useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { motion } from 'framer-motion';
import { Input } from '../ui/Input';
import DatePickerInput from '../ui/DatePicker';
import { Combobox } from '../ui/Combobox';
import { Button } from '../ui/Button';
import { useFinanceStore } from '../../stores/financeStore';
import type { Transaction } from '../../types';

interface Props {
  onSubmit: (data: { categoryId: string; description: string; date: string; relatedGoalId: string; items: Array<{ accountId: string; debit: number; credit: number }> }) => void | Promise<void>;
  onCancel: () => void;
  initial?: Transaction;
  loading?: boolean;
  error?: string;
}

export function GoalTrxForm({ onSubmit, onCancel, initial, loading, error }: Props) {
  const { accounts, savingsGoals } = useFinanceStore();

  const initialAssetAccountId = initial?.items.find((item) => item.credit > 0)?.accountId ?? '';
  const initialAmount = initial?.items.find((item) => item.debit > 0);

  const [description, setDescription] = useState(initial?.description ?? '');
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().split('T')[0]);
  const [assetAccountId, setAssetAccountId] = useState(initialAssetAccountId);
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount.debit) : '');
  const activeGoalId = useUIStore((s) => s.activeGoalId);
  const [relatedGoalId, setRelatedGoalId] = useState<string>(initial?.relatedGoalId ?? activeGoalId ?? '');
  const [formError, setFormError] = useState('');

  const savingsGoalOptions = savingsGoals.map((g) => ({ value: g.id, label: g.title }));
  const selectedGoal = useMemo(
    () => savingsGoals.find((goal) => goal.id === relatedGoalId),
    [relatedGoalId, savingsGoals]
  );
  const selectedGoalCurrency = selectedGoal ? (selectedGoal.currency ?? 'USD').toUpperCase() : undefined;
  const assetAccountOptions = accounts
    .filter(
      (a) =>
        a.accounting === 'asset' &&
        !a.parentId &&
        !a.disabled &&
        !a.isHidden &&
        (!selectedGoalCurrency || a.currency.toUpperCase() === selectedGoalCurrency)
    )
    .map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }));

  const handleGoalChange = (goalId: string) => {
    const nextGoal = savingsGoals.find((goal) => goal.id === goalId);
    const nextGoalCurrency = nextGoal ? (nextGoal.currency ?? 'USD').toUpperCase() : undefined;
    setRelatedGoalId(goalId);
    setAssetAccountId((currentAccountId) => {
      const currentAccountMatchesCurrency = accounts.some(
        (account) =>
          account.id === currentAccountId &&
          account.accounting === 'asset' &&
          !account.parentId &&
          !account.disabled &&
          !account.isHidden &&
          (!nextGoalCurrency || account.currency.toUpperCase() === nextGoalCurrency)
      );

      return currentAccountMatchesCurrency ? currentAccountId : '';
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!description || !amount || !assetAccountId || !relatedGoalId) {
      setFormError('All fields are required');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }

    const selectedAsset = accounts.find((a) => a.id === assetAccountId);
    if (!selectedAsset || selectedAsset.isHidden) {
      setFormError('Select a valid asset account');
      return;
    }

    if (selectedGoalCurrency && selectedAsset.currency.toUpperCase() !== selectedGoalCurrency) {
      setFormError(`Select a ${selectedGoalCurrency} account for this goal payment`);
      return;
    }

    const savingChild = accounts.find((a) => a.parentId === selectedAsset.id && a.isSaving && !a.isHidden);
    if (!savingChild) {
      setFormError('No saving child account found for selected asset');
      return;
    }

    const items = [
      { accountId: savingChild.id, debit: numAmount, credit: 0 },
      { accountId: selectedAsset.id, debit: 0, credit: numAmount },
    ];

    const payload = {
      categoryId: '', // Goal transactions don't use categories
      description,
      date,
      relatedGoalId,
      items,
    };

    onSubmit(payload);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5 max-w-xl mx-auto overflow-visible"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Combobox
          id="asset-account"
          label="Asset account"
          value={assetAccountId}
          onChange={setAssetAccountId}
          options={assetAccountOptions}
          placeholder="Select asset account"
        />
        <Combobox
          id="related-goal"
          label="Savings goal"
          value={relatedGoalId}
          onChange={handleGoalChange}
          options={savingsGoalOptions}
          placeholder="Select goal"
        />
      </div>
      {selectedGoalCurrency && assetAccountOptions.length === 0 && (
        <p className="-mt-3 text-xs text-rose-400">
          No active {selectedGoalCurrency} accounts are available for this goal payment.
        </p>
      )}

      <Input
        id="description"
        label="Description"
        placeholder="What is this savings for?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <div className="grid gap-4 md:grid-cols-2">
        <DatePickerInput
            id="date"
            label="Date"
            value={date}
            onChange={(d) => setDate(d)}
            required
          />
        <Input
          id="amount"
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      {(error || formError) && (
        <p className="text-sm text-rose-400">{error || formError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1" disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1" loading={loading}>
          {initial ? 'Update' : 'Add'} Transaction
        </Button>
      </div>
    </motion.form>
  );
}
