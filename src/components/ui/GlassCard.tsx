import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils';
import { cardHover } from '../../animations/variants';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5 md:p-6',
  lg: 'p-6 md:p-8',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps & HTMLAttributes<HTMLDivElement>>(
  ({ children, hoverable = true, padding = 'md', className, animated = true, ...props }, ref) => {
    const Comp = animated ? motion.div : 'div';
    const motionProps = animated ? { whileHover: hoverable ? cardHover : undefined } : {};

    return (
      <Comp
        ref={ref}
        className={cn('glass-card', paddings[padding], className)}
        {...motionProps}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

GlassCard.displayName = 'GlassCard';
