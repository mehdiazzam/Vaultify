import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-xl dark:bg-white/5 bg-black/5 dark:hover:bg-white/10 hover:bg-black/10 flex items-center justify-center transition-colors cursor-pointer"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {isDark ? <Moon size={16} className="text-slate-400" /> : <Sun size={16} className="text-amber-500" />}
      </motion.div>
    </button>
  );
}
