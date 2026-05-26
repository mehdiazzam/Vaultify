import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar } from './Calendar';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils';

interface Props {
  id?: string;
  label?: string;
  value?: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

function formatDateInput(date?: Date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function DatePickerInput({ id, label, value, onChange, required, placeholder, className }: Props) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const [panelStyle, setPanelStyle] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const parsed = value ? new Date(`${value}T12:00:00`) : undefined;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!(e.target instanceof Node)) return;

      if (ref.current?.contains(e.target) || panelRef.current?.contains(e.target)) {
        return;
      }

      if (open) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useLayoutEffect(() => {
    const trigger = ref.current;
    if (!open || !trigger) {
      setPanelStyle(null);
      return;
    }

    const triggerElement = trigger;

    function updatePanelPosition() {
      const rect = triggerElement.getBoundingClientRect();
      const panelWidth = 252;
      const gap = 8;
      const estimatedHeight = 380;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const nextPlacement = spaceBelow < estimatedHeight + gap && spaceAbove > estimatedHeight + gap
        ? 'top'
        : 'bottom';
      const top = nextPlacement === 'top'
        ? Math.max(gap, rect.top - estimatedHeight - gap)
        : rect.bottom + gap;
      const left = Math.min(
        Math.max(gap, rect.left),
        window.innerWidth - panelWidth - gap
      );

      setPlacement(nextPlacement);
      setPanelStyle({ top, left });
    }

    updatePanelPosition();

    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);

    return () => {
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [open]);

  const panel = open && panelStyle && typeof document !== 'undefined'
    ? createPortal(
        <AnimatePresence>
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: placement === 'top' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === 'top' ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'fixed z-50 glass-card shadow-2xl overflow-hidden',
              placement === 'top' ? 'origin-bottom' : 'origin-top'
            )}
              style={{
                width: 252,
                top: panelStyle.top,
                left: panelStyle.left,
              }}
          >
            <Calendar
              mode="single"
              selected={parsed}
              onSelect={(d) => {
                if (!d) return;
                onChange(formatDateInput(d));
                setOpen(false);
              }}
            />
          </motion.div>
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <div ref={ref} className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor={id}>
          {label}
          {required && <span className="ml-1 text-rose-400">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={id}
          aria-required={required}
          onClick={() => setOpen((s) => !s)}
          className={cn(
            "w-full text-left px-3.5 py-2.5 rounded-xl border bg-white/50 dark:bg-white/5 text-sm transition-all duration-200 flex items-center justify-between group",
            open ? "border-violet-500/50 dark:border-violet-500/50 ring-2 ring-violet-500/20" : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20",
            !value ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-slate-100"
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className={cn("h-4 w-4 transition-colors", value ? "text-violet-500" : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300")} />
            <span className="truncate font-medium">{value ? formatDateDisplay(value) : (placeholder || 'Pick a date')}</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", open && "rotate-180")} />
        </button>

        {panel}
      </div>
    </div>
  );
}

export default DatePickerInput;
