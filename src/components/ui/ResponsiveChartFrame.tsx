import type { ReactNode } from 'react';
import { useElementSize } from '../../hooks/useElementSize';
import { cn } from '../../utils';

interface ResponsiveChartFrameProps {
  children: ReactNode;
  className?: string;
  minHeight: number;
}

export function ResponsiveChartFrame({ children, className, minHeight }: ResponsiveChartFrameProps) {
  const [frameRef, frameSize] = useElementSize<HTMLDivElement>();

  return (
    <div
      ref={frameRef}
      className={cn('w-full min-w-0', className)}
      style={{ minHeight }}
    >
      {frameSize.isReady ? children : <div className="h-full w-full" aria-hidden="true" />}
    </div>
  );
}
