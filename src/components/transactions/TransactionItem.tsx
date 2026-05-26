import { motion } from 'framer-motion';
import { Trash2, Edit3 } from 'lucide-react';
import { cn, formatCurrency, formatRelativeDate } from '../../utils';
import { isAccountTransferTransaction } from '../../utils/transactions';
import { staggerItem } from '../../animations/variants';
import { useFinanceStore } from '../../stores/financeStore';
import type { Transaction } from '../../types';

interface Props {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionItem({ transaction: t, onEdit, onDelete }: Props) {
  const { accounts, categories } = useFinanceStore();
  const isTransfer = isAccountTransferTransaction(t);
  
  // Determine if this is income, expense or saving-neutral based on accounts
  const totalDebit = t.items.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = t.items.reduce((sum, item) => sum + item.credit, 0);
  const amount = totalDebit || totalCredit;
  const displayItem = t.items.find((i) => i.debit > 0) ?? t.items.find((i) => i.credit > 0);
  const displayAccount = displayItem ? accounts.find((a) => a.id === displayItem.accountId) : undefined;
  const displayCurrency = displayAccount?.currency ?? 'USD';
  const isSaving = t.items.some((i) => {
    const account = accounts.find((a) => a.id === i.accountId);
    return account?.isSaving;
  });
  const isIncome = !isSaving && totalCredit > 0 && accounts.some((a) => a.id === t.items.find((i) => i.credit > 0)?.accountId && a.accounting === 'income');
  const transferCreditItem = isTransfer ? t.items.find((item) => item.credit > 0) : undefined;
  const transferDebitItem = isTransfer ? t.items.find((item) => item.debit > 0) : undefined;
  const transferCreditAccount = transferCreditItem ? accounts.find((account) => account.id === transferCreditItem.accountId) : undefined;
  const transferDebitAccount = transferDebitItem ? accounts.find((account) => account.id === transferDebitItem.accountId) : undefined;
  const transferRate = t.exchangeRate ?? (transferCreditItem && transferDebitItem && transferCreditItem.credit > 0 ? transferDebitItem.debit / transferCreditItem.credit : 1);
  const transferLabel = transferCreditItem && transferCreditAccount && transferDebitItem && transferDebitAccount
    ? `${formatCurrency(transferCreditItem.credit, transferCreditAccount.currency)} → ${formatCurrency(transferDebitItem.debit, transferDebitAccount.currency)}`
    : formatCurrency(amount, displayCurrency);
  const transferDetails = transferCreditAccount && transferDebitAccount
    ? `${transferCreditAccount.currency} → ${transferDebitAccount.currency}`
    : '';

  const categoryName = categories.find((c) => c.id === t.categoryId)?.name ?? 'Unknown';

  return (
    <motion.div
      variants={staggerItem}
      layout
      className={cn(
        'group flex flex-col gap-3 rounded-2xl px-4 py-4 transition-all duration-200 md:flex-row md:items-center md:gap-4 md:px-5',
        'dark:hover:bg-white/3 hover:bg-black/3 hover:shadow-sm'
      )}
    >
      <div
        className={cn(
          'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border',
          isTransfer
            ? 'bg-sky-500/10 text-sky-400 border-sky-500/15'
            : isSaving
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/15'
              : isIncome
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/15'
        )}
      >
        <span className="text-lg">{isTransfer ? '↔' : isSaving ? '●' : isIncome ? '↗' : '↙'}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2 flex-wrap">
          <p className="text-sm md:text-[15px] font-semibold dark:text-slate-100 text-slate-900 truncate">
            {t.description || categoryName}
          </p>
          {isTransfer && (
            <span className="inline-flex items-center rounded-full border border-sky-500/15 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-sky-400">
              Transfer
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400 dark:text-slate-500">
          <span>{categoryName}</span>
          <span>•</span>
          <span>{formatRelativeDate(t.date)}</span>
          {isTransfer && transferDetails && (
            <>
              <span>•</span>
              <span>{transferDetails}</span>
            </>
          )}
          {isTransfer && transferRate !== 1 && (
            <>
              <span>•</span>
              <span>Rate {transferRate.toFixed(6)}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-row items-center justify-between gap-2 text-right md:flex-col md:items-end md:gap-1">
        <span className={cn(
          'text-sm md:text-[15px] font-semibold tabular-nums',
          isTransfer ? 'text-sky-400' : isSaving ? 'text-amber-400' : isIncome ? 'text-emerald-400' : 'text-rose-400'
        )}>
          {isTransfer ? transferLabel : `${isSaving ? '' : isIncome ? '+' : '-'}${formatCurrency(amount, displayCurrency)}`}
        </span>
        {isTransfer && transferCreditAccount && transferDebitAccount && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {formatCurrency(transferCreditItem?.credit ?? 0, transferCreditAccount.currency)}
          </span>
        )}
      </div>
      <div className="flex shrink-0 gap-1 self-end opacity-100 transition-opacity md:opacity-0 md:self-auto md:group-hover:opacity-100">
        <button
          onClick={() => onEdit(t)}
          className="p-2 rounded-xl border border-transparent dark:text-slate-500 text-slate-400 cursor-pointer transition-colors hover:dark:bg-white/5 hover:bg-black/5 hover:dark:text-slate-200 hover:text-slate-700"
        >
          <Edit3 size={14} />
        </button>
        <button
          onClick={() => onDelete(t.id)}
          className="p-2 rounded-xl border border-transparent hover:bg-rose-500/10 text-rose-400 cursor-pointer transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
