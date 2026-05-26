import React, { createContext, useContext, useState, type ReactNode, cloneElement } from 'react';

type PopoverContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

export function Popover({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <PopoverContext.Provider value={{ open, setOpen }}>{children}</PopoverContext.Provider>;
}

export function PopoverTrigger({ children, asChild = false }: { children: ReactNode; asChild?: boolean }) {
  const ctx = useContext(PopoverContext);
  if (!ctx) return null;

  const child = React.Children.only(children) as React.ReactElement<{ onClick?: () => void }>;
  const onClick = () => ctx.setOpen(!ctx.open);

  if (asChild && React.isValidElement(child)) {
    return cloneElement(child, { onClick });
  }

  return <button onClick={onClick}>{children}</button>;
}

export function PopoverContent({ children, className }: { children: ReactNode; className?: string; align?: 'start' | 'center' }) {
  const ctx = useContext(PopoverContext);
  if (!ctx) return null;

  if (!ctx.open) return null;

  return (
    <div className={className} role="dialog" aria-modal="false">
      {children}
    </div>
  );
}

export default Popover;
