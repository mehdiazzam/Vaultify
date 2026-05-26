import { useState, type FormEvent } from 'react';
import { IconArrowRight, IconBrandGoogle, IconEye, IconEyeOff, IconLock, IconMail, IconUser } from '@tabler/icons-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { AuthMode } from './types';

interface AuthFormPanelProps {
  mode: AuthMode;
  name: string;
  email: string;
  password: string;
  error: string;
  loading: boolean;
  googleLoading: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoogleClick: () => void;
  onToggleMode: (mode: AuthMode) => void;
}

const formContent = {
  signin: {
    title: 'Sign in',
    subtitle: 'Use your email and password to continue.',
    submitLabel: 'Sign in',
    footerPrompt: "Don't have an account?",
    footerAction: 'Sign up',
  },
  signup: {
    title: 'Create account',
    subtitle: 'Set up your workspace and start tracking.',
    submitLabel: 'Create account',
    footerPrompt: 'Already have an account?',
    footerAction: 'Sign in',
  },
} as const;

export function AuthFormPanel({
  mode,
  name,
  email,
  password,
  error,
  loading,
  googleLoading,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleClick,
  onToggleMode,
}: AuthFormPanelProps) {
  const content = formContent[mode];
  const isBusy = loading || googleLoading;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-full flex-col bg-[#0d1117] px-4 py-4 text-white sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mb-5 space-y-2.5 sm:mb-6 sm:space-y-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{content.title}</h2>
          <p className="max-w-sm text-sm leading-6 text-slate-400">{content.subtitle}</p>
        </div>
      </div>

      {error && (
        <div
          className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-1 flex-col" aria-busy={isBusy}>
        <div className="space-y-3.5 sm:space-y-4">
          {mode === 'signup' && (
            <Input
              id="auth-name"
              label="Full name"
              placeholder="Your name"
              autoComplete="name"
              icon={<IconUser size={16} />}
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              required
              disabled={isBusy}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-400/70"
            />
          )}

          <Input
            id="auth-email"
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="you@example.com"
            icon={<IconMail size={16} />}
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            required
            disabled={isBusy}
            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-400/70"
          />

          <div className="space-y-1.5">
            <label htmlFor="auth-password" className="block text-xs font-medium uppercase tracking-wider dark:text-slate-400 text-slate-600">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-slate-500 text-slate-400">
                <IconLock size={16} />
              </div>
              <Input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                required
                minLength={6}
                disabled={isBusy}
                className="pr-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-400/70 pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                disabled={isBusy}
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-violet-600 text-white shadow-[0_10px_22px_rgba(124,58,237,0.14)] hover:bg-violet-500"
            loading={loading}
            disabled={googleLoading}
            icon={<IconArrowRight size={16} />}
          >
            {content.submitLabel}
          </Button>
        </div>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-slate-500">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full border border-white/10 bg-white/5 text-slate-100 shadow-[0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-xl hover:bg-white/10"
          onClick={onGoogleClick}
          loading={googleLoading}
          disabled={loading}
          icon={<IconBrandGoogle size={16} />}
        >
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-slate-400">
          {content.footerPrompt}{' '}
          <button
            type="button"
            className="font-medium text-violet-300 transition-colors hover:text-violet-200"
            onClick={() => onToggleMode(mode === 'signin' ? 'signup' : 'signin')}
            disabled={isBusy}
          >
            {content.footerAction}
          </button>
        </p>
      </form>
    </div>
  );
}