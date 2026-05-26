import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import type { SavingsGoal } from '../../types';
import { requireDb, getUserCollection } from './helpers';
import * as transactions from './transactions';
import { SAVINGS_GOALS } from './constants';

export type SavingsGoalInput = Omit<SavingsGoal, 'id'>;

export const getSavingsGoals = async (userId: string): Promise<SavingsGoal[]> => {
  return getUserCollection<SavingsGoal>(SAVINGS_GOALS, userId);
};

export const addSavingsGoal = async (data: SavingsGoalInput): Promise<string> => {
  const ref = await addDoc(collection(requireDb(), SAVINGS_GOALS), data);
  return ref.id;
};

export const updateSavingsGoal = async (id: string, data: Partial<SavingsGoalInput>): Promise<void> => {
  await updateDoc(doc(requireDb(), SAVINGS_GOALS, id), data);
};

export const deleteSavingsGoal = async (id: string): Promise<void> => {
  await deleteDoc(doc(requireDb(), SAVINGS_GOALS, id));
};

export const deleteGoalAndTransactions = async (userId: string, goalId: string): Promise<void> => {
  await transactions.deleteTransactionsByGoal(userId, goalId);
  await deleteSavingsGoal(goalId);
};
