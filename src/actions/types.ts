export type GlobalActionId =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'goal-transaction'
  | 'account'
  | 'budget'
  | 'savings-goal'
  | 'add-loan'
  | 'calculator';

export interface GlobalActionDefinition {
  id: GlobalActionId;
  label: string;
  modalTitle: string;
  shortcutKey: string;
  shortcutHint: string;
  colorClass: string;
}
