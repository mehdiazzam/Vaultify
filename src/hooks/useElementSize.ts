import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

interface ElementSize {
  width: number;
  height: number;
  isReady: boolean;
}

export function useElementSize<TElement extends HTMLElement>(): [RefObject<TElement | null>, ElementSize] {
  const elementRef = useRef<TElement>(null);
  const [size, setSize] = useState<ElementSize>({
    width: 0,
    height: 0,
    isReady: false,
  });

  const updateSize = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    const { width, height } = element.getBoundingClientRect();
    setSize((currentSize) => {
      const nextSize = {
        width,
        height,
        isReady: width > 0 && height > 0,
      };

      if (
        currentSize.width === nextSize.width &&
        currentSize.height === nextSize.height &&
        currentSize.isReady === nextSize.isReady
      ) {
        return currentSize;
      }

      return nextSize;
    });
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    updateSize();

    if (typeof ResizeObserver === 'undefined') {
      const animationFrameId = window.requestAnimationFrame(updateSize);
      return () => window.cancelAnimationFrame(animationFrameId);
    }

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [updateSize]);

  return [elementRef, size];
}
