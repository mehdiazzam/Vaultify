import { type ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils';
import { modalOverlay, modalContent } from '../../animations/variants';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
};

export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={modalOverlay}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              'relative w-full max-h-[calc(100vh-2rem)] overflow-y-auto glass-card p-6 z-10',
              'dark:bg-[#0f0f1a]/95 dark:border-white/10',
              'bg-white/95 border-black/5',
              sizes[size],
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold dark:text-white text-slate-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg dark:hover:bg-white/5 hover:bg-black/5 dark:text-slate-400 text-slate-500 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
