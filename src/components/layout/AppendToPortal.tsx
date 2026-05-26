import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function AppendToPortal({ appendTo = 'body', children }: { appendTo?: string | HTMLElement; children: React.ReactNode }) {
  const [targetNode, setTargetNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element: HTMLElement | null = null;

    if (typeof window === 'undefined') return;

    if (appendTo === 'body') {
      element = document.body;
    } else if (typeof appendTo === 'string') {
      element = document.querySelector(appendTo);
    } else if (appendTo instanceof HTMLElement) {
      element = appendTo;
    }

    // Schedule the state update to avoid synchronous setState within the effect
    const raf = window.requestAnimationFrame(() => setTargetNode(element));
    return () => window.cancelAnimationFrame(raf);
  }, [appendTo]);

  if (!targetNode) return null;

  // Renders children directly into the targetNode DOM structure
  return createPortal(children, targetNode);
}

export default AppendToPortal;
