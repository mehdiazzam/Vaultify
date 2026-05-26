import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GlassCard } from '../ui/GlassCard';
import { ResponsiveChartFrame } from '../ui/ResponsiveChartFrame';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency } from '../../utils';
import type { CategoryData } from '../../types';

interface Props {
  data: CategoryData[];
  title?: string;
  currency?: string;
}

export function CategoryDonut({ data, title = 'Spending by Category', currency = 'USD' }: Props) {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <GlassCard className="min-w-0">
      <h3 className="text-sm font-medium dark:text-slate-400 text-slate-600 mb-4">{title}</h3>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <ResponsiveChartFrame className="h-40 w-40 shrink-0" minHeight={160}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={((value: unknown) => formatCurrency(Number(value ?? 0), currency)) as never}
                contentStyle={{
                  background: isDark ? 'rgba(15,15,26,0.95)' : 'rgba(255,255,255,0.95)',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: isDark ? '#f1f5f9' : '#0f172a',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ResponsiveChartFrame>
        <div className="flex-1 space-y-2 w-full">
          {data.slice(0, 5).map((cat) => (
            <div key={cat.name} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
              <span className="text-xs dark:text-slate-400 text-slate-600 flex-1 truncate">{cat.name}</span>
              <span className="text-xs font-medium dark:text-slate-300 text-slate-700">{formatCurrency(cat.value, currency)}</span>
              <span className="text-[10px] dark:text-slate-600 text-slate-400 w-8 text-right">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
