import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { BackgroundEffects } from '../components/layout/BackgroundEffects';
import { CommandPalette } from '../components/ui/CommandPalette';
import { QuickActions } from '../components/ui/QuickActions';
import { GlobalActionModals } from '../components/ui/GlobalActionModals';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { pageVariants } from '../animations/variants';

export function AppLayout() {
  const location = useLocation();
  useKeyboardShortcuts();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundEffects />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-5 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-5 sm:py-6 md:px-6 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <MobileNav />
      </div>
      <CommandPalette />
      <QuickActions />
      <GlobalActionModals />
    </div>
  );
}
