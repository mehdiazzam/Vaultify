import { create } from 'zustand';
import type { ThemeMode } from '../types';
import type { GlobalActionId } from '../actions/types';

interface UIState {
  theme: ThemeMode;
  commandPaletteOpen: boolean;
  quickActionsOpen: boolean;
  sidebarOpen: boolean;
  activeModal: GlobalActionId | null;
  activeGoalId?: string | null;
  toggleTheme: () => void;
  setTheme: (t: ThemeMode) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setQuickActionsOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveModal: (m: GlobalActionId | null) => void;
  setActiveGoalId?: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: (typeof window !== 'undefined' && localStorage.getItem('vaultify-theme') as ThemeMode) || 'dark',
  commandPaletteOpen: false,
  quickActionsOpen: false,
  sidebarOpen: false,
  activeModal: null,
  activeGoalId: null,
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('vaultify-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      document.documentElement.classList.toggle('light', next === 'light');
      return { theme: next };
    }),
  setTheme: (theme) => {
    localStorage.setItem('vaultify-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    set({ theme });
  },
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setQuickActionsOpen: (quickActionsOpen) => set({ quickActionsOpen }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setActiveModal: (activeModal) => set({ activeModal }),
  setActiveGoalId: (activeGoalId) => set({ activeGoalId }),
}));
