import {
  TrendingDown,
  TrendingUp,
  Target,
  Wallet,
  PiggyBank,
  Calculator,
  CircleDollarSign,
  ArrowDownLeft,
  ArrowLeftRight,
  type LucideIcon,
} from 'lucide-react';
import type { GlobalActionDefinition, GlobalActionId } from './types';

export interface GlobalActionRegistryItem extends GlobalActionDefinition {
  icon: LucideIcon;
}

export const GLOBAL_ACTIONS: GlobalActionRegistryItem[] = [
  {
    id: 'income',
    label: 'Add Income',
    modalTitle: 'Add Income',
    shortcutKey: 'i',
    shortcutHint: '^  + Shift + I',
    colorClass: 'from-emerald-500 to-teal-500',
    icon: TrendingUp,
  },
  {
    id: 'expense',
    label: 'Add Expense',
    modalTitle: 'Add Expense',
    shortcutKey: 'e',
    shortcutHint: '^  + Shift + E',
    colorClass: 'from-rose-500 to-orange-500',
    icon: TrendingDown,
  },
  {
    id: 'transfer',
    label: 'Transfer Between Accounts',
    modalTitle: 'Transfer Between Accounts',
    shortcutKey: 'y',
    shortcutHint: '^  + Shift + Y',
    colorClass: 'from-sky-500 to-cyan-500',
    icon: ArrowLeftRight,
  },
  {
    id: 'goal-transaction',
    label: 'Add Goal Transaction',
    modalTitle: 'Add Goal Transaction',
    shortcutKey: 'g',
    shortcutHint: '^  + Shift + G',
    colorClass: 'from-cyan-500 to-sky-500',
    icon: Target,
  },
  {
    id: 'account',
    label: 'Create Account',
    modalTitle: 'Create Account',
    shortcutKey: 'a',
    shortcutHint: '^  + Shift + A',
    colorClass: 'from-indigo-500 to-blue-500',
    icon: Wallet,
  },
  {
    id: 'budget',
    label: 'Create Budget',
    modalTitle: 'Create Budget',
    shortcutKey: 'b',
    shortcutHint: '^  + Shift + B',
    colorClass: 'from-violet-500 to-fuchsia-500',
    icon: CircleDollarSign,
  },
  {
    id: 'savings-goal',
    label: 'Create Savings Goal',
    modalTitle: 'Create Savings Goal',
    shortcutKey: 's',
    shortcutHint: '^  + Shift + S',
    colorClass: 'from-blue-500 to-cyan-500',
    icon: PiggyBank,
  },
  {
    id: 'add-loan',
    label: 'Quick Add Borrow / Lend',
    modalTitle: 'New borrow / lend',
    shortcutKey: 'q',
    shortcutHint: '^  + Shift + Q',
    colorClass: 'from-red-500 to-orange-500',
    icon: ArrowDownLeft,
  },
  {
    id: 'calculator',
    label: 'Calculator',
    modalTitle: 'Calculator',
    shortcutKey: 'c',
    shortcutHint: '^  + Shift + C',
    colorClass: 'from-slate-500 to-slate-700',
    icon: Calculator,
  },
];

export const GLOBAL_ACTIONS_BY_ID: Record<GlobalActionId, GlobalActionRegistryItem> =
  GLOBAL_ACTIONS.reduce((acc, action) => {
    acc[action.id] = action;
    return acc;
  }, {} as Record<GlobalActionId, GlobalActionRegistryItem>);

export const ACTION_SHORTCUTS: Record<string, GlobalActionId> = GLOBAL_ACTIONS.reduce(
  (acc, action) => {
    if (action.shortcutKey && action.shortcutKey.trim().length > 0) {
      acc[action.shortcutKey] = action.id;
    }
    return acc;
  },
  {} as Record<string, GlobalActionId>
);
