import { useState, useRef, useEffect } from 'react';
import { useLoans } from '@/hooks/useLoans';
import LoanList from '@/components/loans/LoanList';
import { GlassCard } from '@/components/ui/GlassCard';
import { useGlobalActions } from '@/hooks/useGlobalActions';
import { Button } from '@/components/ui/Button';
import { Plus, ChevronDown } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import { springTransition } from '@/animations/variants';

type FilterType = 'all' | 'borrowed' | 'lent';
type FilterStatus = 'all' | 'active' | 'settled';

function HorizontalFilter({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      layout
      transition={springTransition}
      ref={containerRef}
      className="flex w-full items-center justify-start rounded-full bg-black/5 p-1 dark:bg-white/5 sm:w-fit"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const show = isOpen || isSelected;

          if (!show) return null;

          return (
            <motion.button
              key={opt.value}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={springTransition}
              onClick={() => {
                if (isOpen) {
                  onChange(opt.value);
                  setIsOpen(false);
                } else {
                  setIsOpen(true);
                }
              }}
              className={cn(
                'flex items-center justify-center gap-1.5 overflow-hidden rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors',
                isSelected
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-[#1a1a1a] dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <span className="shrink-0">{opt.label}</span>
              {isSelected && (
                <motion.span
                  animate={{ rotate: isOpen ? 0 : -90 }}
                  transition={springTransition}
                  className="shrink-0 origin-center"
                >
                  <ChevronDown size={14} className="text-gray-400 shrink-0" />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LoansPage() {
  const { data: loans = [], isLoading, refetch } = useLoans();
  const { openAction } = useGlobalActions();
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [openHistoryLoanId, setOpenHistoryLoanId] = useState<string | null>(null);

  const filtered = loans.filter((l) => {
    const matchType = typeFilter === 'all' || l.type === typeFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'settled' ? l.status === 'settled' : l.status !== 'settled');
    return matchType && matchStatus;
  });

  const totalBorrowed = loans
    .filter((l) => l.type === 'borrowed' && l.status !== 'settled')
    .reduce((sum, l) => sum + (l.amount - (l.amountRepaid ?? 0)), 0);

  const totalLent = loans
    .filter((l) => l.type === 'lent' && l.status !== 'settled')
    .reduce((sum, l) => sum + (l.amount - (l.amountRepaid ?? 0)), 0);

  const handleToggleHistory = (loanId: string) => {
    setOpenHistoryLoanId((current) => (current === loanId ? null : loanId));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-5 md:px-6">
      <PageContainer className="p-0">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Loans</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track money you've borrowed and lent
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            icon={<Plus size={16} />}
            aria-label="Add loan"
            onClick={() => openAction('add-loan')}
            className="w-full sm:w-auto"
          >
            New borrow / lend
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <GlassCard className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">You Owe</p>
            <p className="text-xl font-bold text-red-700 dark:text-red-300 mt-0.5">
              ${totalBorrowed.toFixed(2)}
            </p>
          </GlassCard>
          <GlassCard className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Owed to You</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300 mt-0.5">
              ${totalLent.toFixed(2)}
            </p>
          </GlassCard>
        </div>

        {/* Controls */}
        <div className="relative z-10 mb-4 flex flex-col gap-3 sm:flex-row">
          {/* Type Filter */}
          <HorizontalFilter
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as FilterType)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'borrowed', label: 'Borrowed' },
              { value: 'lent', label: 'Lent' },
            ]}
          />

          {/* Status Filter */}
          <HorizontalFilter
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as FilterStatus)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'settled', label: 'Settled' },
            ]}
          />
        </div>

        {/* Loans List */}
        <LoanList
          loans={filtered}
          isLoading={isLoading}
          onRepaymentSuccess={() => refetch()}
          openHistoryLoanId={openHistoryLoanId}
          onToggleHistory={handleToggleHistory}
        />
      </PageContainer>
    </div>
  );
}

