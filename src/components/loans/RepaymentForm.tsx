import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { useRecordRepayment } from '@/hooks/useLoans';
import { useFinanceStore } from '@/stores/financeStore';
import type { Loan } from '@/types';

interface Props {
  loan: Loan;
  onSuccess?: () => void;
}

export default function RepaymentForm({ loan, onSuccess }: Props) {
  const { mutateAsync: recordRepayment, isPending } = useRecordRepayment();
  const { accounts } = useFinanceStore();
  const loanCurrency = loan.currency.toUpperCase();

  const assetAccounts = accounts.filter(
    (a) =>
      a.accounting === 'asset' &&
      !a.parentId &&
      !a.disabled &&
      !a.isHidden &&
      a.currency.toUpperCase() === loanCurrency &&
      !['lent', 'borrowed'].includes(a.type as string)
  );

  const remaining = loan.amount - (loan.amountRepaid ?? 0);
  const [amount, setAmount] = useState(remaining.toFixed(2));
  const [assetAccountId, setAssetAccountId] = useState(
    assetAccounts[0]?.id ?? ''
  );
  const [formError, setFormError] = useState('');

  const label =
    loan.type === 'borrowed'
      ? 'Repay from account'
      : 'Receive into account';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    const repayAmount = parseFloat(amount);

    if (!assetAccountId) {
      setFormError(`Please select a ${loanCurrency} account`);
      return;
    }

    const selectedAccount = accounts.find((account) => account.id === assetAccountId);
    if (!selectedAccount || selectedAccount.isHidden || selectedAccount.currency.toUpperCase() !== loanCurrency) {
      setFormError(`Repay this loan from a ${loanCurrency} account`);
      return;
    }

    if (repayAmount <= 0) {
      setFormError('Repayment amount must be greater than 0');
      return;
    }

    if (repayAmount > remaining) {
      setFormError(
        `Repayment cannot exceed remaining balance of ${remaining.toFixed(2)}`
      );
      return;
    }

    try {
      await recordRepayment({
        loan,
        values: {
          loanId: loan.id,
          assetAccountId,
          amount: repayAmount,
        },
      });
      setAmount(remaining.toFixed(2));
      onSuccess?.();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to record repayment'
      );
    }
  };

  return (
    <GlassCard className="p-4 space-y-4 bg-blue-50 dark:bg-blue-950">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Remaining Balance Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {loan.currency} {remaining.toFixed(2)}
          </p>
        </div>

        {/* Repayment Amount */}
        <Input
          label="Repayment Amount"
          type="number"
          min="0"
          max={remaining}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />

        {/* Account Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            {label}
          </label>
          <select
            value={assetAccountId}
            onChange={(e) => setAssetAccountId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            required
          >
            <option value="">Select account...</option>
            {assetAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.currency})
              </option>
            ))}
          </select>
          {assetAccounts.length === 0 && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              No active {loanCurrency} accounts are available for this payment.
            </p>
          )}
        </div>

        {/* Error Message */}
        {formError && (
          <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
        )}

        {/* Submit Button */}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Recording...' : 'Record Repayment'}
        </Button>
      </form>
    </GlassCard>
  );
}
