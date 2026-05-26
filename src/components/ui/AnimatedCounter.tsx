import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import { formatCurrency } from '../../utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  isCurrency?: boolean;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  value,
  duration = 1200,
  isCurrency = true,
  className = '',
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const animated = useAnimatedCounter(value, duration);

  return (
    <span className={className}>
      {prefix}
      {isCurrency ? formatCurrency(animated) : Math.round(animated).toLocaleString()}
      {suffix}
    </span>
  );
}
