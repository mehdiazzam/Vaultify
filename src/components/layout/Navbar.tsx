import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftRight, Circle, LayoutDashboard, Scale, Target, Trophy } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useUIStore } from "../../stores/uiStore";
import { useAuthStore } from "../../stores/authStore";
import { NAV_ITEMS } from "../../constants";

const navIcons = {
  LayoutDashboard,
  ArrowLeftRight,
  Scale,
  Target,
  Trophy,
} as const;

export function Navbar() {
  const location = useLocation();
  useUIStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const userInitial = user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'V';

  return (
    <header className="sticky top-0 z-30 w-full">
      <div className="dark:bg-vault-dark/80 bg-white/80 backdrop-blur-xl border-b dark:border-white/4 border-black/4">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-5 md:px-6">
          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <span className="text-base font-bold tracking-tight">
              <span className="bg-linear-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
                Vaultify
              </span>
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0 rounded-xl">
            {NAV_ITEMS.map((item, index) => {
              const Icon = navIcons[item.icon as keyof typeof navIcons] ?? Circle;
              const isActive = location.pathname === item.path;
              const nextItem = NAV_ITEMS[index + 1];
              const showDivider = nextItem && nextItem.group !== item.group;
              
              return (
                <div key={item.path} className="flex items-center">
                  <NavLink to={item.path} className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 dark:bg-white/8 bg-violet-500/10 rounded-lg"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                    <span
                      className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "dark:text-white text-violet-700"
                          : "dark:text-slate-500 text-slate-500 dark:hover:text-slate-300 hover:text-slate-700"
                      }`}
                    >
                      <Icon size={15} />
                      <span className="hidden lg:inline">{item.label}</span>
                    </span>
                  </NavLink>
                  {showDivider && (
                    <div className="h-5 w-px dark:bg-white/10 bg-black/10 mx-1.5" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            <ThemeToggle />
            <div className="relative">
              <button 
                onClick={() => { navigate('/settings') }}
                className="flex size-8 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white cursor-pointer sm:size-9"
                aria-haspopup
              >
                {userInitial}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
