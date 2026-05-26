import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Combobox } from '../ui/Combobox';
import { useFinanceStore } from '../../stores/financeStore';
import type { RecurringPeriod } from '../../types';

interface Props {
  onSubmit: (data: { categoryId: string; amount: number; recurring: RecurringPeriod; currency: string }) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

const recurringOptions: { value: RecurringPeriod; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

export function BudgetForm({ onSubmit, onCancel, loading, error }: Props) {
  const { categories, currencies } = useFinanceStore();
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [recurring, setRecurring] = useState<RecurringPeriod>('monthly');
  const [currency, setCurrency] = useState('USD');

  const categoryOptions = categories.map((cat) => ({ value: cat.id, label: cat.name }));
  const currencyOptions = currencies.map((entry) => ({
    value: entry.iso,
    label: `${entry.iso} - ${entry.name}`,
    icon: entry.icon ? <span className="text-sm">{entry.icon}</span> : undefined,
  }));

  const selectedCurrency = currencies.some((entry) => entry.iso === currency) ? currency : (currencies[0]?.iso ?? 'USD');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!categoryId || !amount) return;

    onSubmit({
      categoryId,
      amount: Number.parseFloat(amount),
      recurring,
      currency,
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4 overflow-visible"
    >
      <Combobox
        id="category"
        label="Category"
        value={categoryId}
        onChange={setCategoryId}
        options={categoryOptions}
        placeholder="Select category"
      />
      <Input
        id="amount"
        label="Budget amount"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        required
      />
      <Combobox
        id="currency"
        label="Currency"
        value={selectedCurrency}
        onChange={setCurrency}
        options={currencyOptions.length > 0 ? currencyOptions : [{ value: 'USD', label: 'USD - US Dollar' }]}
        placeholder="Select currency"
      />
      <Combobox
        id="recurring"
        label="Recurring period"
        value={recurring}
        onChange={(value) => setRecurring(value as RecurringPeriod)}
        options={recurringOptions}
        placeholder="Select period"
      />
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1" disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1" loading={loading}>
          Create Budget
        </Button>
      </div>
    </motion.form>
  );
}
