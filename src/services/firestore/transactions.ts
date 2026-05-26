import { collection, addDoc, updateDoc, deleteDoc, query, where, getDocs, doc } from 'firebase/firestore';
import type { Transaction } from '../../types';
import { requireDb, mapDoc } from './helpers';
import { TRANSACTIONS } from './constants';

export type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>;

export const getTransactions = async (
  userId: string,
  options?: { includeLoanRepayments?: boolean; includeGoalTransactions?: boolean }
): Promise<Transaction[]> => {
  const includeLoanRepayments = options?.includeLoanRepayments ?? true;
  const includeGoalTransactions = options?.includeGoalTransactions ?? true;

  const q = query(
    collection(requireDb(), TRANSACTIONS),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);

  const results = snap.docs.map((snapshotDoc) => mapDoc<Transaction>(snapshotDoc));

  const filtered = results.filter((t) => {
    if (!includeLoanRepayments && t.relatedLoanId) return false;
    if (!includeGoalTransactions && t.relatedGoalId) return false;
    return true;
  });

  return filtered.sort((a, b) => b.date.localeCompare(a.date));
};

export const addTransaction = async (data: TransactionInput): Promise<string> => {
  const ref = await addDoc(collection(requireDb(), TRANSACTIONS), {
    ...data,
    createdAt: new Date(),
  });

  return ref.id;
};

/**
 * Create a transaction that is explicitly linked to a loan or goal.
 * Ensures the contract for linked transactions is respected.
 */
export const createLinkedTransaction = async (data: TransactionInput & { relatedLoanId?: string; relatedGoalId?: string }): Promise<string> => {
  if (!data.relatedLoanId && !data.relatedGoalId) {
    throw new Error('createLinkedTransaction requires relatedLoanId or relatedGoalId');
  }

  return await addTransaction(data);
};

export const updateTransaction = async (id: string, data: Partial<TransactionInput>): Promise<void> => {
  await updateDoc(doc(requireDb(), TRANSACTIONS, id), data);
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await deleteDoc(doc(requireDb(), TRANSACTIONS, id));
};

export const deleteTransactionsByGoal = async (userId: string, goalId: string): Promise<void> => {
  const q = query(
    collection(requireDb(), TRANSACTIONS),
    where('userId', '==', userId),
    where('relatedGoalId', '==', goalId)
  );

  const snap = await getDocs(q);
  const deletes = snap.docs.map((d) => deleteDoc(doc(requireDb(), TRANSACTIONS, d.id)));
  await Promise.all(deletes);
};
