import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Combobox } from '../ui/Combobox';
import { Input } from '../ui/Input';
import DatePickerInput from '../ui/DatePicker';
import { useFinanceStore } from '../../stores/financeStore';
import { ACCOUNT_TRANSFER_CATEGORY_ID } from '../../utils/transactions';
import type { Transaction } from '../../types';

interface AccountTransferFormProps {
  onSubmit: (data: {
    categoryId: string;
    description: string;
    date: string;
    exchangeRate?: number;
    items: Array<{ accountId: string; debit: number; credit: number }>;
  }) => void | Promise<void>;
  onCancel: () => void;
  initial?: Transaction;
  loading?: boolean;
  error?: string;
}

export function AccountTransferForm({ onSubmit, onCancel, initial, loading, error }: AccountTransferFormProps) {
  const { accounts, currencies } = useFinanceStore();
  const assetAccounts = useMemo(
    () =>
      accounts.filter(
        (account) =>
          account.accounting === 'asset' &&
          !account.parentId &&
          !account.disabled &&
          !account.isHidden &&
          !account.isSaving &&
          account.type !== 'lent' &&
          account.type !== 'borrowed'
      ),
    [accounts]
  );

  const initialFromAccountId = initial?.items.find((item) => item.credit > 0)?.accountId ?? '';
  const initialToAccountId = initial?.items.find((item) => item.debit > 0)?.accountId ?? '';
  const initialAmount = initial?.items.find((item) => item.debit > 0)?.debit;
  const initialExchangeRate = initial?.exchangeRate;

  const [fromAccountId, setFromAccountId] = useState(initialFromAccountId);
  const [toAccountId, setToAccountId] = useState(initialToAccountId);
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : '');
  const [exchangeRate, setExchangeRate] = useState(initialExchangeRate ? String(initialExchangeRate) : '');
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(initial?.description ?? 'Account transfer');
  const [formError, setFormError] = useState('');

  const fromAccount = assetAccounts.find((account) => account.id === fromAccountId);
  const toAccount = assetAccounts.find((account) => account.id === toAccountId);
  const fromCurrency = fromAccount?.currency.toUpperCase();
  const toCurrency = toAccount?.currency.toUpperCase();
  const parsedExchangeRate = Number.parseFloat(exchangeRate);
  const transferAmount = Number.parseFloat(amount);
  const convertedAmount = Number.isFinite(transferAmount) && Number.isFinite(parsedExchangeRate)
    ? transferAmount * parsedExchangeRate
    : 0;

  const fromAccountOptions = assetAccounts.map((account) => ({
    value: account.id,
    label: `${account.name} (${account.currency})`,
  }));

  const toAccountOptions = assetAccounts
    .filter((account) => account.id !== fromAccountId)
    .map((account) => ({
      value: account.id,
      label: `${account.name} (${account.currency})`,
    }));

  const syncExchangeRate = (nextFromAccountId: string, nextToAccountId: string) => {
    const nextFromAccount = assetAccounts.find((account) => account.id === nextFromAccountId);
    const nextToAccount = assetAccounts.find((account) => account.id === nextToAccountId);

    if (!nextFromAccount || !nextToAccount) {
      return;
    }

    const nextFromRate = currencies.find((currency) => currency.iso === nextFromAccount.currency.toUpperCase())?.rateToUsd ?? 1;
    const nextToRate = currencies.find((currency) => currency.iso === nextToAccount.currency.toUpperCase())?.rateToUsd ?? 1;
    const nextRate = nextFromAccount.currency.toUpperCase() === nextToAccount.currency.toUpperCase() ? 1 : nextFromRate / nextToRate;

    setExchangeRate(String(nextRate));
  };

  const handleFromAccountChange = (nextAccountId: string) => {
    const nextFromAccount = assetAccounts.find((account) => account.id === nextAccountId);
    const nextCurrency = nextFromAccount?.currency.toUpperCase();
    const nextToAccountId = (() => {
      const currentToAccount = assetAccounts.find((account) => account.id === toAccountId);
      if (
        currentToAccount &&
        currentToAccount.id !== nextAccountId &&
        (!nextCurrency || currentToAccount.currency.toUpperCase() === nextCurrency)
      ) {
        return toAccountId;
      }

      return '';
    })();

    setFromAccountId(nextAccountId);
    setToAccountId(nextToAccountId);
    syncExchangeRate(nextAccountId, nextToAccountId);
  };

  const handleToAccountChange = (nextAccountId: string) => {
    setToAccountId(nextAccountId);
    syncExchangeRate(fromAccountId, nextAccountId);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');

    const transferAmount = Number.parseFloat(amount);
    const selectedFromAccount = assetAccounts.find((account) => account.id === fromAccountId);
    const selectedToAccount = assetAccounts.find((account) => account.id === toAccountId);
    const rate = Number.parseFloat(exchangeRate);

    if (!selectedFromAccount || !selectedToAccount || !description.trim() || !date || !amount || !exchangeRate) {
      setFormError('All fields are required');
      return;
    }

    if (selectedFromAccount.id === selectedToAccount.id) {
      setFormError('Choose two different accounts');
      return;
    }

    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }

    if (!Number.isFinite(rate) || rate <= 0) {
      setFormError('Exchange rate must be greater than 0');
      return;
    }

    const destinationAmount = transferAmount * rate;
    if (!Number.isFinite(destinationAmount) || destinationAmount <= 0) {
      setFormError('Converted amount must be greater than 0');
      return;
    }

    onSubmit({
      categoryId: ACCOUNT_TRANSFER_CATEGORY_ID,
      description: description.trim(),
      date,
      exchangeRate: rate,
      items: [
        { accountId: selectedToAccount.id, debit: destinationAmount, credit: 0 },
        { accountId: selectedFromAccount.id, debit: 0, credit: transferAmount },
      ],
    });
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
          id="transfer-from-account"
          label="From account"
          value={fromAccountId}
          onChange={handleFromAccountChange}
          options={fromAccountOptions}
          placeholder="Select source account"
        />
        <Combobox
          id="transfer-to-account"
          label="To account"
          value={toAccountId}
          onChange={handleToAccountChange}
          options={toAccountOptions}
          placeholder={fromCurrency ? `Select destination account` : 'Select destination account'}
        />
      </div>

      <Input
        id="transfer-description"
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        required
      />

      <div className="grid gap-4 md:grid-cols-2">
          <DatePickerInput
            id="transfer-date"
            label="Date"
            value={date}
            onChange={setDate}
            required
          />
        <Input
          id="transfer-amount"
          label={fromCurrency ? `Amount (${fromCurrency})` : 'Amount'}
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />
        <Input
          id="transfer-exchange-rate"
          label={fromCurrency && toCurrency ? `Exchange rate (${toCurrency} per 1 ${fromCurrency})` : 'Exchange rate'}
          type="number"
          step="0.000001"
          min="0"
          placeholder="1.000000"
          value={exchangeRate}
          onChange={(event) => setExchangeRate(event.target.value)}
          required
        />
      </div>

      <div className="rounded-xl border dark:border-white/10 border-black/10 dark:bg-white/5 bg-black/5 px-4 py-3 text-xs dark:text-slate-400 text-slate-500 space-y-1.5">
        <p>
          {fromCurrency || 'Source currency'} {Number.isFinite(transferAmount) ? transferAmount.toFixed(2) : '0.00'}
          {' '}→ {toCurrency || 'Destination currency'} {convertedAmount.toFixed(2)}
        </p>
      </div>

      {(error || formError) && <p className="text-sm text-rose-400">{error || formError}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1" disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1" loading={loading} icon={<ArrowRightLeft size={16} />}>
          {initial ? 'Update' : 'Transfer'}
        </Button>
      </div>
    </motion.form>
  );
}
