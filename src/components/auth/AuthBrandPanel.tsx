import { IconCircleCheck, IconShieldLock } from '@tabler/icons-react';
import type { AuthMode } from './types';

interface AuthBrandPanelProps {
  mode: AuthMode;
}

const brandContent = {
  signin: {
    eyebrow: 'Vaultify overview',
    title: 'Keep accounts, budgets, and goals in one place.',
    description: 'Use Vaultify to check balances, review spending, and stay on top of your plan.',
    features: [
      {
        icon: <IconShieldLock size={18} />,
        title: 'Private workspace',
        description: 'Your finance data stays organized and easy to review.',
      },
      {
        icon: <IconCircleCheck size={18} />,
        title: 'Quick snapshot',
        description: 'See balances, budgets, and goals without extra noise.',
      },
    ],
    stats: [
      { value: 'Accounts', label: 'Track cash flow' },
      { value: 'Budgets', label: 'Watch spending' },
      { value: 'Goals', label: 'Follow progress' },
    ],
  },
  signup: {
    eyebrow: 'Create an account',
    title: 'Set up Vaultify and start tracking from day one.',
    description: 'Create your workspace, add your accounts, and begin with a simple setup.',
    features: [
      {
        icon: <IconShieldLock size={18} />,
        title: 'Simple setup',
        description: 'Create your account and start with the basics.',
      },
      {
        icon: <IconCircleCheck size={18} />,
        title: 'Ready to use',
        description: 'Add budgets, goals, and transactions when you are ready.',
      },
    ],
    stats: [
      { value: 'Email', label: 'Create account' },
      { value: 'Google', label: 'Optional sign-in' },
      { value: 'Setup', label: 'Takes a minute' },
    ],
  },
} as const;

export function AuthBrandPanel({ mode }: AuthBrandPanelProps) {
  const content = brandContent[mode];

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[#12183a] px-5 py-5 text-white sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_30%),linear-gradient(135deg,rgba(124,58,237,0.08),transparent_45%)]" />

      <div className="relative z-10 space-y-5">
        <div className="max-w-xl space-y-3">
          <p className="text-sm font-medium text-violet-200/80">{content.eyebrow}</p>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{content.title}</h2>
          <p className="max-w-lg text-sm leading-6 text-slate-300 sm:text-base">{content.description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {content.features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-3 pt-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {content.stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
              <p className="text-sm font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-violet-100/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}