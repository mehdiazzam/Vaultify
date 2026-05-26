import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils';
import { buttonTap } from '../../animations/variants';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:from-violet-500 hover:to-indigo-500',
  secondary:
    'dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200 bg-black/5 hover:bg-black/10 text-slate-800 border border-white/10 dark:border-white/10',
  ghost: 'dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 text-slate-600 hover:text-slate-900 hover:bg-black/5',
  danger: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={buttonTap}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        icon
      ) : null}
      {children}
    </motion.button>
  )
);

Button.displayName = 'Button';
