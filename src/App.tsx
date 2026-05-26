import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { useFinanceStore } from './stores/financeStore';
import { onAuthChange } from './services/auth';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Budget = lazy(() => import('./pages/Budget'));
const Goals = lazy(() => import('./pages/Goals'));
const Settings = lazy(() => import('./pages/Settings'));
const LoansPage = lazy(() => import('./pages/LoansPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-vault-dark bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/20 animate-pulse" />
        <p className="text-sm dark:text-slate-500 text-slate-400">Loading Vaultify...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { setUser, setLoading } = useAuthStore();
  const { theme } = useUIStore();
  const clearFinanceData = useFinanceStore((state) => state.clearFinanceData);
  const routerBasename = import.meta.env.BASE_URL;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) {
        clearFinanceData();
      }
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [clearFinanceData, setUser, setLoading]);

  return (
    <BrowserRouter basename={routerBasename}>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
