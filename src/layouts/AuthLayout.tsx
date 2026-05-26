import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackgroundEffects } from '../components/layout/BackgroundEffects';

export function AuthLayout() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 lg:p-6">
      <BackgroundEffects />
      <div className="relative z-10 flex w-full max-w-5xl flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-4 w-full max-w-2xl text-center sm:mb-6"
        >
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-linear-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
              Vaultify
            </span>
          </h1>
        </motion.div>
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
