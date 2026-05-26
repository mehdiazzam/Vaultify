import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wider dark:text-slate-400 text-slate-600">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-slate-500 text-slate-400">{icon}</div>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full h-11 rounded-xl border transition-all duration-200 outline-none input-glow',
            'dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-slate-600',
            'bg-black/5 border-black/10 text-slate-900 placeholder:text-slate-400',
            'focus:border-violet-500/50',
            icon ? 'pl-10 pr-4' : 'px-4',
            error && 'border-rose-500/50',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wider dark:text-slate-400 text-slate-600">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(
          'w-full h-11 rounded-xl border transition-all duration-200 outline-none input-glow px-4 appearance-none cursor-pointer',
          'dark:bg-white/5 dark:border-white/10 dark:text-white',
          'bg-black/5 border-black/10 text-slate-900',
          'focus:border-violet-500/50',
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="dark:bg-[#0f0f1a] bg-white">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
);

Select.displayName = 'Select';
