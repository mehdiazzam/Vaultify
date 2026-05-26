import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils';
import { loginWithEmail, loginWithGoogle, registerWithEmail } from '../../services/auth';
import { AuthBrandPanel } from './AuthBrandPanel';
import { AuthFormPanel } from './AuthFormPanel';
import type { AuthMode, SwapPhase } from './types';

interface AuthSplitAuthProps {
  initialMode?: AuthMode;
}

const PANEL_ANIMATION_MS = 420;

const getPanelSideClass = (panel: 'form' | 'brand', mode: AuthMode) => {
  const formOnLeft = mode === 'signin';
  const isLeft = panel === 'form' ? formOnLeft : !formOnLeft;
  return isLeft ? 'lg:left-0' : 'lg:left-1/2';
};

const getPanelOffsetClass = (panel: 'form' | 'brand', mode: AuthMode) => {
  const formOnLeft = mode === 'signin';
  const isLeft = panel === 'form' ? formOnLeft : !formOnLeft;
  return isLeft ? '-translate-x-full' : 'translate-x-full';
};

export function AuthSplitAuth({ initialMode = 'signin' }: AuthSplitAuthProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [phase, setPhase] = useState<SwapPhase>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const exitTimerRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const settleSwap = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPhase('reposition');

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setPhase('enter');
        settleTimerRef.current = window.setTimeout(() => {
          setPhase('idle');
          settleTimerRef.current = null;
        }, PANEL_ANIMATION_MS);
      });
    });
  };

  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode === mode || phase !== 'idle' || loading || googleLoading) return;

    clearTimers();
    setError('');
    setPhase('exit');
    exitTimerRef.current = window.setTimeout(() => {
      exitTimerRef.current = null;
      settleSwap(nextMode);
    }, PANEL_ANIMATION_MS);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
      navigate('/dashboard');
    } catch {
      setError(mode === 'signin' ? 'Invalid email or password' : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch {
      setError('Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const isBusy = loading || googleLoading || phase !== 'idle';

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-[#050816] shadow-[0_32px_90px_rgba(0,0,0,0.5)]">
        <div className="relative lg:min-h-155">
          <div
            className={cn(
              'relative flex w-full flex-col overflow-hidden lg:absolute lg:inset-y-0 lg:min-h-85 lg:w-1/2 lg:border-r lg:border-white/5',
              'transform-gpu transition-transform duration-420 ease-[0.22,1,0.36,1]',
              phase === 'reposition' && 'transition-none',
              phase !== 'idle' && getPanelOffsetClass('form', mode),
              getPanelSideClass('form', mode)
            )}
            style={{ willChange: phase === 'idle' ? 'auto' : 'transform' }}
            aria-hidden={isBusy}
          >
            <AuthFormPanel
              mode={mode}
              name={name}
              email={email}
              password={password}
              error={error}
              loading={loading}
              googleLoading={googleLoading}
              onNameChange={setName}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={handleSubmit}
              onGoogleClick={handleGoogleClick}
              onToggleMode={handleModeChange}
            />
          </div>

          <div
            className={cn(
              'hidden w-full flex-col overflow-hidden border-t border-white/5 lg:absolute lg:inset-y-0 lg:flex lg:min-h-85 lg:w-1/2 lg:border-t-0',
              'transform-gpu transition-transform duration-420 ease-[0.22,1,0.36,1]',
              phase === 'reposition' && 'transition-none',
              phase !== 'idle' && getPanelOffsetClass('brand', mode),
              getPanelSideClass('brand', mode)
            )}
            style={{ willChange: phase === 'idle' ? 'auto' : 'transform' }}
            aria-hidden={isBusy}
          >
            <AuthBrandPanel mode={mode} />
          </div>
        </div>
      </div>
    </div>
  );
}