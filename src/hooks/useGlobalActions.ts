import { useMemo } from 'react';
import { useUIStore } from '../stores/uiStore';
import type { GlobalActionId } from '../actions/types';

export function useGlobalActions() {
  const {
    quickActionsOpen,
    activeModal,
    setQuickActionsOpen,
    setActiveModal,
    setActiveGoalId,
  } = useUIStore();

  return useMemo(
    () => ({
      quickActionsOpen,
      activeAction: activeModal,
      openAction: (actionId: GlobalActionId) => {
        setActiveModal(actionId);
        setQuickActionsOpen(false);
      },
      openActionForGoal: (actionId: GlobalActionId, goalId?: string | null) => {
        setActiveGoalId?.(goalId ?? null);
        setActiveModal(actionId);
        setQuickActionsOpen(false);
      },
      closeAction: () => setActiveModal(null),
      toggleQuickActions: () => setQuickActionsOpen(!quickActionsOpen),
      closeAllOverlays: () => {
        setQuickActionsOpen(false);
        setActiveModal(null);
      },
    }),
    [activeModal, quickActionsOpen, setActiveGoalId, setActiveModal, setQuickActionsOpen]
  );
}
