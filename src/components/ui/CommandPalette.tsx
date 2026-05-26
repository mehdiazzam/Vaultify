import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Sun, Moon } from 'lucide-react';
import { GLOBAL_ACTIONS } from '../../actions/registry';
import { useGlobalActions } from '../../hooks/useGlobalActions';
import { useUIStore } from '../../stores/uiStore';
import { modalOverlay } from '../../animations/variants';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  group: string;
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, toggleTheme, theme } = useUIStore();
  const { openAction } = useGlobalActions();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = useMemo(() => {
    const formCommands: CommandItem[] = GLOBAL_ACTIONS.map((action) => ({
      id: `form-${action.id}`,
      label: action.label,
      icon: <action.icon size={16} />,
      action: () => {
        openAction(action.id);
        setCommandPaletteOpen(false);
      },
      shortcut: action.shortcutHint,
      group: 'Forms',
    }));

    const appCommands: CommandItem[] = [
      {
        id: 'theme',
        label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />,
        action: () => { toggleTheme(); setCommandPaletteOpen(false); },
        shortcut: '^  + J',
        group: 'Actions',
      },
    ];

    return [...formCommands, ...appCommands];
  }, [openAction, setCommandPaletteOpen, theme, toggleTheme]);

  const filtered = useMemo(
    () => commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())),
    [commands, query]
  );

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    if (!commandPaletteOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => (i + 1) % filtered.length); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length); }
      if (e.key === 'Enter' && filtered[activeIndex]) { filtered[activeIndex].action(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, filtered, activeIndex]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-100 flex items-start justify-center pt-[20vh]">
          <motion.div
            variants={modalOverlay}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -5 }}
            onAnimationStart={() => { setQuery(''); setActiveIndex(0); }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-lg glass-card overflow-hidden z-10 dark:bg-[#0c0c18]/95 bg-white/95"
          >
            <div className="flex items-center gap-3 px-4 border-b dark:border-white/5 border-black/5">
              <Search size={16} className="dark:text-slate-500 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                placeholder="Search commands..."
                className="w-full h-12 bg-transparent outline-none dark:text-white text-slate-900 dark:placeholder:text-slate-600 placeholder:text-slate-400 text-sm"
              />
              <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded dark:bg-white/5 bg-black/5 dark:text-slate-500 text-slate-400 font-mono">
                ESC
              </kbd>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="text-center py-8 text-sm dark:text-slate-500 text-slate-400">No commands found</p>
              ) : (
                filtered.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                      i === activeIndex
                        ? 'dark:bg-white/5 bg-violet-50 dark:text-white text-violet-700'
                        : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900'
                    }`}
                  >
                    {cmd.icon}
                    <span className="flex-1 text-left">{cmd.label}</span>
                    {cmd.shortcut && (
                      <kbd className="text-[10px] font-mono dark:text-slate-600 text-slate-400">{cmd.shortcut}</kbd>
                    )}
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100" />
                  </button>
                ))
              )}
            </div>
            <div className="flex items-center gap-4 px-4 py-2.5 border-t dark:border-white/5 border-black/5 text-[11px] dark:text-slate-600 text-slate-400">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
