import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface CalculatorProps {
  onClose: () => void;
}

import { evaluateExpression } from './calcUtils';

export default function Calculator({ onClose }: CalculatorProps) {
  const [expr, setExpr] = useState('');
  const result = useMemo(() => {
    try {
      const out = evaluateExpression(expr);
      return out === null ? '' : String(out);
    } catch {
      return '';
    }
  }, [expr]);

  const append = (v: string) => setExpr((s) => s + v);
  const clear = () => setExpr('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // allow regular digits and operators and numpad keys
      const k = e.key;
      const code = e.code || '';

      // digits
      if (/^[0-9]$/.test(k)) {
        append(k);
        e.preventDefault();
        return;
      }

      // operators and percent and decimal
      if (k === '+' || k === '-' || k === '*' || k === '/' || k === '%' || k === '.') {
        append(k);
        e.preventDefault();
        return;
      }

      // Numpad specific codes
      if (code.startsWith('Numpad')) {
        switch (code) {
          case 'NumpadAdd':
            append('+');
            e.preventDefault();
            return;
          case 'NumpadSubtract':
            append('-');
            e.preventDefault();
            return;
          case 'NumpadMultiply':
            append('*');
            e.preventDefault();
            return;
          case 'NumpadDivide':
            append('/');
            e.preventDefault();
            return;
          case 'NumpadDecimal':
            append('.');
            e.preventDefault();
            return;
          case 'NumpadEnter':
            if (result) setExpr(result);
            e.preventDefault();
            return;
          default:
            break;
        }
      }

      // Enter / equals
      if (k === 'Enter') {
        if (result) setExpr(result);
        e.preventDefault();
        return;
      }

      // Backspace -> remove last char
      if (k === 'Backspace') {
        setExpr((s) => s.slice(0, -1));
        e.preventDefault();
        return;
      }

      // Delete -> clear
      if (k === 'Delete' || k === 'Escape') {
        clear();
        e.preventDefault();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [result]);

  const container = (
    <div className="fixed right-6 bottom-6 z-50 w-64 rounded-xl bg-white/90 dark:bg-slate-800/90 shadow-lg ring-1 ring-black/5 backdrop-blur-lg">
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/5 dark:border-white/5">
        <div className="text-sm font-medium">Calculator</div>
        <button onClick={onClose} aria-label="Close calculator" className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5">
          <X size={16} />
        </button>
      </div>
      <div className="p-3">
        <div className="mb-2 h-10 w-full rounded bg-slate-50 dark:bg-slate-900/60 px-2 py-1 flex items-center justify-end text-sm font-mono">{expr || '0'}</div>
        <div className="mb-2 h-8 w-full text-right text-sm text-slate-600 dark:text-slate-300">{result}</div>
        <div className="grid grid-cols-4 gap-2">
          {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','%','=','+','C'].map((b) => (
            <button
              key={b}
              className="rounded-md bg-white dark:bg-slate-700 py-2 text-sm shadow-sm hover:bg-black/5 dark:hover:bg-white/5"
              onClick={() => {
                if (b === 'C') return clear();
                if (b === '=') return setExpr(result);
                append(b);
              }}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(container, document.body);
}
