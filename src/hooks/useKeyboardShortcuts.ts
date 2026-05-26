import { useEffect } from 'react';
import { ACTION_SHORTCUTS } from '../actions/registry';
import { useGlobalActions } from './useGlobalActions';
import { useUIStore } from '../stores/uiStore';

function isTypingElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select'
  );
}

export function useKeyboardShortcuts() {
  const { openAction } = useGlobalActions();
  const { toggleTheme, setCommandPaletteOpen } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.isComposing || e.repeat) return;
      const rawKey = e.key;
      if (!rawKey || typeof rawKey !== 'string') return;
      const key = rawKey.toLowerCase();
      const hasPrimaryModifier = e.metaKey || e.ctrlKey;

      if (hasPrimaryModifier && !e.shiftKey && key === 'j') {
        e.preventDefault();
        toggleTheme();
        return;
      }

      if (hasPrimaryModifier && !e.shiftKey && key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (!hasPrimaryModifier || !e.shiftKey || isTypingElement(e.target)) {
        return;
      }

      const actionId = ACTION_SHORTCUTS[key];
      if (!actionId) return;

      e.preventDefault();
      openAction(actionId);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openAction, setCommandPaletteOpen, toggleTheme]);
}
