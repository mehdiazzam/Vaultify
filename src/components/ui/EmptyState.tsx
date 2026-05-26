import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { fadeInUp } from '../../animations/variants';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-2xl dark:bg-white/5 bg-black/5 flex items-center justify-center mb-4">
        {icon ?? <Inbox size={28} className="dark:text-slate-600 text-slate-400" />}
      </div>
      <h3 className="text-lg font-semibold dark:text-slate-200 text-slate-800 mb-1">{title}</h3>
      <p className="text-sm dark:text-slate-500 text-slate-500 max-w-xs mb-6">{description}</p>
      {action}
    </motion.div>
  );
}
