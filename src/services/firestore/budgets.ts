import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import type { Budget } from '../../types';
import { requireDb, getUserCollection } from './helpers';
import { BUDGETS } from './constants';

export type BudgetInput = Omit<Budget, 'id'>;

export const getBudgets = async (userId: string): Promise<Budget[]> => {
  return getUserCollection<Budget>(BUDGETS, userId);
};

export const addBudget = async (data: BudgetInput): Promise<string> => {
  const ref = await addDoc(collection(requireDb(), BUDGETS), data);
  return ref.id;
};

export const updateBudget = async (id: string, data: Partial<BudgetInput>): Promise<void> => {
  await updateDoc(doc(requireDb(), BUDGETS, id), data);
};

export const deleteBudget = async (id: string): Promise<void> => {
  await deleteDoc(doc(requireDb(), BUDGETS, id));
};
