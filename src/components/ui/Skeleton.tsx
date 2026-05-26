import { cn } from '../../utils';

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ className, rounded }: SkeletonProps) {
  return (
    <div
      className={cn(
        'dark:bg-white/5 bg-black/5 skeleton-shimmer',
        rounded ? 'rounded-full' : 'rounded-xl',
        className
      )}
    />
  );
}

export function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-10 w-10 shrink-0" rounded />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
