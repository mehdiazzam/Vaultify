import { useState, useRef, useMemo, useEffect, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '../../utils';
import AppendToPortal from '../layout/AppendToPortal';

interface ComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ComboboxProps {
  id?: string;
  label?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  searchable?: boolean;
  className?: string;
  triggerClassName?: string;
}

export function Combobox({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  searchable = true,
  className,
  triggerClassName,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );

  const selectedOption = useMemo(() => options.find((o) => o.value === value), [options, value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedTrigger = containerRef.current?.contains(target) ?? false;
      const clickedDropdown = dropdownRef.current?.contains(target) ?? false;

      if (!clickedTrigger && !clickedDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (filtered.length === 0 ? 0 : (i + 1) % filtered.length));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (filtered.length === 0 ? 0 : (i - 1 + filtered.length) % filtered.length));
      }
      if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        onChange(filtered[activeIndex].value);
        setIsOpen(false);
        setQuery('');
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, filtered, activeIndex, onChange]);

  // Auto-scroll to active item
  useEffect(() => {
    if (!listRef.current) return;
    const activeElement = listRef.current.children[activeIndex] as HTMLElement;
    if (activeElement) {
      activeElement.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleOpen = () => {
    setIsOpen(true);
    setActiveIndex(0);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // compute portal dropdown position so it overlays instead of affecting layout
  const [portalStyle, setPortalStyle] = useState<CSSProperties | null>(null);
  useEffect(() => {
    if (!isOpen) return undefined;

    function updatePosition() {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPortalStyle({
        position: 'fixed',
        left: rect.left,
        top: rect.bottom,
        width: rect.width,
        zIndex: 1100,
      });
    }

    const animationFrameId = window.requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  return (
    <div className={cn("space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wider dark:text-slate-400 text-slate-600">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Trigger button */}
        <button
          type="button"
          onClick={handleOpen}
          id={id}
          className={cn(
            'w-full h-11 rounded-xl border transition-all duration-200 outline-none input-glow',
            'dark:bg-white/5 dark:border-white/10 dark:text-white',
            'bg-black/5 border-black/10 text-slate-900',
            'flex items-center justify-between px-4 cursor-pointer',
            'hover:dark:border-white/20 hover:border-black/20',
            isOpen && 'dark:border-violet-500/50 border-violet-500/50',
            error && 'border-rose-500/50',
            triggerClassName
          )}
        >
          <span className={selectedOption ? 'text-inherit' : 'dark:text-slate-500 text-slate-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown menu rendered into portal so it overlays modals */}
        <AnimatePresence>
          {isOpen && (
            <AppendToPortal>
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                style={portalStyle ?? undefined}
                className="mt-2 z-50 dark:bg-[#0c0c18]/95 bg-white/95 rounded-xl border dark:border-white/10 border-black/10 shadow-lg backdrop-blur-sm overflow-hidden"
              >
              {/* Search input */}
              {searchable && (
                <div className="flex items-center gap-3 px-4 border-b dark:border-white/5 border-black/5">
                  <Search size={14} className="dark:text-slate-500 text-slate-400 shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActiveIndex(0);
                    }}
                    placeholder="Search..."
                    className="w-full h-10 bg-transparent outline-none dark:text-white text-slate-900 dark:placeholder:text-slate-600 placeholder:text-slate-400 text-sm"
                  />
                </div>
              )}

              {/* Options list */}
              <div
                ref={listRef}
                className="max-h-64 overflow-y-auto"
              >
                {filtered.length === 0 ? (
                  <p className="text-center py-6 text-sm dark:text-slate-500 text-slate-400">
                    No options found
                  </p>
                ) : (
                  filtered.map((option, idx) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                        setQuery('');
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left',
                        idx === activeIndex
                          ? 'dark:bg-white/5 bg-violet-50 dark:text-white text-violet-700'
                          : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/2',
                      )}
                    >
                      {option.icon && (
                        <span className="shrink-0 flex items-center">{option.icon}</span>
                      )}
                      <span className="flex-1">{option.label}</span>
                    </button>
                  ))
                )}
              </div>
              </motion.div>
            </AppendToPortal>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
