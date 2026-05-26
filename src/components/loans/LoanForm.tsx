import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Combobox } from '@/components/ui/Combobox';
import { GlassCard } from '@/components/ui/GlassCard';
import DatePickerInput from '@/components/ui/DatePicker';
import { useCreateLoan } from '@/hooks/useLoans';
import { useFinanceStore } from '@/stores/financeStore';
import type { LoanFormValues, LoanType } from '@/types';

interface Props {
  onSuccess?: () => void;
}

export default function LoanForm({ onSuccess }: Props) {
  const { mutateAsync: createLoan, isPending } = useCreateLoan();
  const { accounts, currencies } = useFinanceStore();

  const assetAccounts = accounts.filter(
    (a) =>
      a.accounting === 'asset' &&
      !a.parentId &&
      !a.disabled &&
      !a.isHidden &&
      !['lent', 'borrowed'].includes(a.type as string)
  );

  const [type, setType] = useState<LoanType>('borrowed');
  const [counterparty, setCounterparty] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [assetAccountId, setAssetAccountId] = useState(
    assetAccounts.find((account) => account.currency === 'USD')?.id ?? ''
  );
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [formError, setFormError] = useState('');

  const isBorrow = type === 'borrowed';
  const currencyAssetAccounts = assetAccounts.filter((account) => account.currency.toUpperCase() === currency);

  const handleCurrencyChange = (nextCurrency: string) => {
    const normalizedCurrency = nextCurrency.toUpperCase();
    setCurrency(normalizedCurrency);
    setAssetAccountId((currentAccountId) => {
      const currentAccountMatchesCurrency = assetAccounts.some(
        (account) => account.id === currentAccountId && account.currency.toUpperCase() === normalizedCurrency
      );

      return currentAccountMatchesCurrency
        ? currentAccountId
        : (assetAccounts.find((account) => account.currency.toUpperCase() === normalizedCurrency)?.id ?? '');
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (!counterparty.trim()) {
      setFormError('Counterparty name is required');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }

    if (!assetAccountId) {
      setFormError(`Please select a ${currency} account`);
      return;
    }

    const selectedAssetAccount = accounts.find((account) => account.id === assetAccountId);
    if (!selectedAssetAccount || selectedAssetAccount.isHidden || selectedAssetAccount.currency.toUpperCase() !== currency) {
      setFormError(`Select a ${currency} account for this loan`);
      return;
    }

    try {
      const formValues: LoanFormValues = {
        type,
        counterparty: counterparty.trim(),
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        assetAccountId,
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
      };

      await createLoan(formValues);
      setCounterparty('');
      setAmount('');
      setCurrency('USD');
      setDescription('');
      setDueDate('');
      onSuccess?.();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to create loan'
      );
    }
  };

  const currencyOptions = currencies.map((entry) => ({
    value: entry.iso,
    label: `${entry.iso} - ${entry.name}`,
    icon: entry.icon ? <span className="text-sm">{entry.icon}</span> : undefined,
  }));

  return (
    <GlassCard className="p-6 space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4 overflow-visible">
        {/* Type Toggle */}
        <div className="flex gap-2">
          {(['borrowed', 'lent'] as LoanType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === t
                  ? t === 'borrowed'
                    ? 'bg-red-500 text-white'
                    : 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {t === 'borrowed' ? '⬇ Borrowed' : '⬆ Lent'}
            </button>
          ))}
        </div>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isBorrow
            ? 'Money comes into your account — you owe it back.'
            : 'Money leaves your account — someone owes you.'}
        </p>

        {/* Counterparty */}
        <Input
          label={isBorrow ? 'Borrowed from (name)' : 'Lent to (name)'}
          value={counterparty}
          onChange={(e) => setCounterparty(e.target.value)}
          placeholder="e.g., Alice, Bank, Friend"
          required
        />

        {/* Amount & Currency */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <Input
              label="Amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Combobox
              id="loan-currency"
              label="Currency"
              value={currency}
              onChange={handleCurrencyChange}
              options={currencyOptions.length > 0 ? currencyOptions : [{ value: 'USD', label: 'USD - US Dollar' }]}
              placeholder="Select currency"
            />
          </div>
        </div>

        {/* Asset Account Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            {isBorrow ? 'Deposit into account' : 'Withdraw from account'}
          </label>
          <select
            value={assetAccountId}
            onChange={(e) => setAssetAccountId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            required
          >
            <option value="">Select account...</option>
            {currencyAssetAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.currency})
              </option>
            ))}
          </select>
          {currencyAssetAccounts.length === 0 && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              No active {currency} accounts are available for this loan.
            </p>
          )}
        </div>

        {/* Description */}
        <Input
          label="Note (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Holiday trip funds"
        />

        {/* Due Date */}
        <div>
          <DatePickerInput
            id="loan-due-date"
            label={"Due Date (optional)"}
            value={dueDate}
            onChange={(v) => setDueDate(v)}
            placeholder="Select a due date"
          />
        </div>

        {/* Error Message */}
        {formError && (
          <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full"
        >
          {isPending
            ? 'Creating...'
            : isBorrow
              ? 'Record Borrow'
              : 'Record Lend'}
        </Button>
      </form>
    </GlassCard>
  );
}
