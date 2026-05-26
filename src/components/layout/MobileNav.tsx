import { NavLink, useLocation } from 'react-router-dom';
import { ArrowLeftRight, Circle, LayoutDashboard, Scale, Target, Trophy } from 'lucide-react';
import { NAV_ITEMS } from '../../constants';

const navIcons = {
  LayoutDashboard,
  ArrowLeftRight,
  Scale,
  Target,
  Trophy,
} as const;

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t border-black/4 bg-white/90 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 dark:border-white/4 dark:bg-vault-dark/90 mobile-nav-blur">
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = navIcons[item.icon as keyof typeof navIcons] ?? Circle;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors ${
                isActive
                  ? 'dark:text-violet-400 text-violet-600'
                  : 'dark:text-slate-600 text-slate-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
