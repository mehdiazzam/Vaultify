import { collection, doc, runTransaction, serverTimestamp, getDocs, query, where, Timestamp } from 'firebase/firestore';
import type { FieldValue } from 'firebase/firestore';
import type { Loan, LoanFormValues, RepaymentFormValues, Transaction } from '../../types';
import { requireDb, mapDoc, getAccountById } from './helpers';
import { getOrCreateLoanAccounts } from './accounts';
import { createLoanWithTransaction, applyRepaymentTransaction } from './atomic';

function getTransactionSortKey(transaction: Transaction): number {
  if (transaction.createdAt instanceof Timestamp) {
    return transaction.createdAt.toMillis();
  }

  const parsedDate = Date.parse(transaction.date);
  return Number.isNaN(parsedDate) ? 0 : parsedDate;
}

function sortLoanTransactions(transactions: Transaction[] = []): Transaction[] {
  return [...transactions].sort((left, right) => {
    const sortDelta = getTransactionSortKey(left) - getTransactionSortKey(right);
    if (sortDelta !== 0) {
      return sortDelta;
    }

    return left.id.localeCompare(right.id);
  });
}

export async function createLoan(userId: string, values: LoanFormValues): Promise<string> {
  const loanCurrency = values.currency.toUpperCase();
  const selectedAssetAccount = await getAccountById(values.assetAccountId);
  if (!selectedAssetAccount || selectedAssetAccount.userId !== userId) {
    throw new Error('Select a valid account for this loan.');
  }
  if (selectedAssetAccount.currency.toUpperCase() !== loanCurrency) {
    throw new Error(`Select a ${loanCurrency} account for this loan.`);
  }

  const { loanPayableId, loanReceivableId } = await getOrCreateLoanAccounts(userId, loanCurrency);
  const { type, assetAccountId, amount } = values;

  const items =
    type === 'borrowed'
      ? [
          { accountId: assetAccountId, debit: amount, credit: 0 },
          { accountId: loanPayableId, debit: 0, credit: amount },
        ]
      : [
          { accountId: loanReceivableId, debit: amount, credit: 0 },
          { accountId: assetAccountId, debit: 0, credit: amount },
        ];

  const loanData: Omit<Loan, 'id' | 'createdAt'> = {
    userId,
    type,
    counterparty: values.counterparty,
    amount,
    currency: loanCurrency,
    ...(values.description && { description: values.description }),
    ...(values.dueDate && { dueDate: values.dueDate }),
    status: 'active',
  };

  const txData = {
    userId,
    categoryId: type === 'borrowed' ? 'borrow' : 'lend',
    description:
      values.description ?? `${type === 'borrowed' ? 'Borrowed from' : 'Lent to'} ${values.counterparty}`,
    date: new Date().toISOString().slice(0, 10),
    items,
  };

  const loanId = await createLoanWithTransaction(loanData, txData);
  return loanId;
}

export async function recordRepayment(userId: string, loan: Loan, values: RepaymentFormValues): Promise<void> {
  const loanCurrency = loan.currency.toUpperCase();
  const selectedAssetAccount = await getAccountById(values.assetAccountId);
  if (!selectedAssetAccount || selectedAssetAccount.userId !== userId) {
    throw new Error('Select a valid repayment account.');
  }
  if (selectedAssetAccount.currency.toUpperCase() !== loanCurrency) {
    throw new Error(`Repay this loan from a ${loanCurrency} account.`);
  }

  const { loanPayableId, loanReceivableId } = await getOrCreateLoanAccounts(userId, loanCurrency);
  const { amount, assetAccountId } = values;
  const remaining = loan.amount - (loan.amountRepaid ?? 0);

  if (amount > remaining) {
    throw new Error(
      `Repayment of ${amount} exceeds remaining balance of ${remaining}.`
    );
  }

  const items =
    loan.type === 'borrowed'
      ? [
          { accountId: loanPayableId, debit: amount, credit: 0 },
          { accountId: assetAccountId, debit: 0, credit: amount },
        ]
      : [
          { accountId: assetAccountId, debit: amount, credit: 0 },
          { accountId: loanReceivableId, debit: 0, credit: amount },
        ];

  const newAmountRepaid = (loan.amountRepaid ?? 0) + amount;
  const newStatus: Loan['status'] =
    newAmountRepaid >= loan.amount ? 'settled' : 'partially_repaid';

  const description =
    loan.type === 'borrowed' ? `Repayment to ${loan.counterparty}` : `Received repayment from ${loan.counterparty}`;

  const repaymentData = {
    userId,
    categoryId: loan.type === 'borrowed' ? 'borrow' : 'lend',
    description,
    date: new Date().toISOString().slice(0, 10),
    items,
  };

  await applyRepaymentTransaction(loan.id, { status: newStatus }, repaymentData as Transaction);
}

export async function fetchLoans(userId: string): Promise<Loan[]> {
  const snap = await getDocs(
    query(collection(requireDb(), 'loans'), where('userId', '==', userId))
  );

  const loanTransactions = (await getDocs(
    query(
      collection(requireDb(), 'transactions'),
      where('userId', '==', userId),
      where('relatedLoanId', '!=', '')
    )
  )).docs.reduce((acc, docSnap) => {
    const data = mapDoc<Transaction>(docSnap);
    const loanId = data.relatedLoanId as string;

    if (!acc[loanId]) {
      acc[loanId] = [];
    }

    acc[loanId].push(data);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return snap.docs.map((d) => {
    const mapped = mapDoc<Loan>(d);
    const transactions = sortLoanTransactions(loanTransactions[d.id]);

    return {
      ...mapped,
      createdAt: mapped.createdAt instanceof Timestamp ? mapped.createdAt.toDate() : mapped.createdAt,
      dueDate: mapped.dueDate instanceof Timestamp ? mapped.dueDate.toDate() : mapped.dueDate,
      updatedAt: mapped.updatedAt instanceof Timestamp ? mapped.updatedAt.toDate() : mapped.updatedAt,
      amountRepaid: transactions.slice(1).reduce(
        (sum, tx) => sum + tx.items.reduce((itemSum, item) => itemSum + item.credit, 0),
        0
      ),
      transactions,
    } as Loan;
  });
}
