import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { GLOBAL_ACTIONS } from '../../actions/registry';
import { useGlobalActions } from '../../hooks/useGlobalActions';

const FLOATING_MENU_ACTIONS = GLOBAL_ACTIONS.filter(
  (action) => action.id === 'income' || action.id === 'expense' || action.id === 'transfer'
);

export function QuickActions() {
  const { quickActionsOpen, toggleQuickActions, openAction } = useGlobalActions();

  return (
    <div className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40">
      <AnimatePresence>
        {quickActionsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute bottom-16 right-0 flex flex-col gap-2.5 items-stretch min-w-64 p-2 rounded-2xl border dark:border-white/10 border-black/10 dark:bg-[#0f1324]/80 bg-white/85 backdrop-blur-xl shadow-2xl dark:shadow-black/40 shadow-slate-400/20"
          >
            {FLOATING_MENU_ACTIONS.map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => openAction(action.id)}
                className="w-full flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors cursor-pointer group dark:hover:bg-white/8 hover:bg-slate-100/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70"
                aria-label={action.label}
              >
                <span className={`w-10 h-10 rounded-xl bg-linear-to-br ${action.colorClass} text-white flex items-center justify-center shadow-md`}>
                  <action.icon size={18} />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-sm font-medium dark:text-slate-100 text-slate-800 truncate">
                    {action.label}
                  </span>
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleQuickActions}
        className="w-12 h-12 rounded-full bg-linear-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/30 cursor-pointer hover:shadow-violet-500/50 transition-shadow"
        aria-label="Toggle quick actions"
      >
        <motion.div animate={{ rotate: quickActionsOpen ? 45 : 0 }} transition={{ type: 'spring', stiffness: 300 }}>
          {quickActionsOpen ? <X size={20} /> : <Plus size={20} />}
        </motion.div>
      </motion.button>
    </div>
  );
}
