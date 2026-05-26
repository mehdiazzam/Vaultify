import { motion } from 'framer-motion';
import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { useFinanceStore } from '../stores/financeStore';
import { staggerItem } from '../animations/variants';
import PageContainer from '@/components/layout/PageContainer';
import { LogOut, Command, Download, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout, sendPasswordReset, updateDisplayName } from '../services/auth';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useFinanceData } from '../hooks/useFinanceData';
import { getDisabledTopLevelAssetAccounts } from '../utils';

export default function Settings() {
  const { user } = useAuthStore();
  const { accounts } = useFinanceStore();
  const { enableAccount } = useFinanceData();
  const { theme } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const [openResetModal, setOpenResetModal] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const [openNameModal, setOpenNameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [updatingName, setUpdatingName] = useState(false);

  const isGoogleProvider = !!user?.providerData?.some((p) => p.providerId === 'google.com');
  const disabledAccounts = getDisabledTopLevelAssetAccounts(accounts);

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    try {
      setSendingReset(true);
      await sendPasswordReset(user.email);
      setResetMessage('Password reset email sent. Check your inbox.');
    } catch {
      setResetMessage('Failed to send reset email. Please try again.');
    } finally {
      setSendingReset(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setUpdatingName(true);
    try {
      await updateDisplayName(newName.trim());
      setOpenNameModal(false);
    } catch {
      // ignore
    } finally {
      setUpdatingName(false);
    }
  };

  const preferences = [
    {
      label: 'Theme',
      description: `Currently using ${theme} mode`,
      action: <ThemeToggle />,
    },
    {
      label: 'Profile',
      description: user?.displayName || user?.email || 'Not signed in',
      action: (
        <Button
          variant="secondary"
          onClick={() => {
            setNewName(user?.displayName || '');
            setOpenNameModal(true);
          }}
          disabled={!user}
        >
          Edit
        </Button>
      ),
    },
    {
      label: 'Change Password',
      description: isGoogleProvider
        ? 'Signed in with Google — password managed externally'
        : 'Send a password reset email to change your password',
      action: (
        <Button
          variant="secondary"
          onClick={() => setOpenResetModal(true)}
          disabled={isGoogleProvider || !user?.email}
        >
          Change
        </Button>
      ),
    },
  ];

  return (
    <PageContainer className="max-w-2xl">
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold tracking-tight dark:text-white text-slate-900">Settings</h1>
        <p className="text-sm dark:text-slate-500 text-slate-500 mt-0.5">Customize your Vaultify experience</p>
      </motion.div>

      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-2 mb-3">
          <Settings2 size={16} className="text-violet-400" />
          <h2 className="text-sm font-medium dark:text-slate-300 text-slate-700 uppercase tracking-wider">Preferences</h2>
        </div>
        <GlassCard padding="none">
          <div className="divide-y dark:divide-white/4 divide-black/4">
            {preferences.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium dark:text-slate-200 text-slate-800">{item.label}</p>
                  <p className="text-xs dark:text-slate-500 text-slate-500 mt-0.5">{item.description}</p>
                </div>
                {item.action}
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-2 mb-3">
          <Download size={16} className="text-rose-400" />
          <h2 className="text-sm font-medium dark:text-slate-300 text-slate-700 uppercase tracking-wider">Disabled Accounts</h2>
        </div>
        <GlassCard padding="none">
          <div className="divide-y dark:divide-white/4 divide-black/4">
            {disabledAccounts.length === 0 ? (
              <div className="px-5 py-4 text-sm dark:text-slate-500 text-slate-500">No disabled accounts.</div>
            ) : (
              disabledAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium dark:text-slate-200 text-slate-800">{account.name}</p>
                    <p className="text-xs dark:text-slate-500 text-slate-500 mt-0.5">
                      {account.currency} · {account.type}{account.number ? ` · ${account.number}` : ''}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => void enableAccount.mutateAsync(account.id)}
                    loading={enableAccount.isPending}
                  >
                    Enable
                  </Button>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </motion.div>

      <Modal open={openResetModal} onClose={() => { setOpenResetModal(false); setResetMessage(null); }} title="Change Password">
        <div className="space-y-4">
          <p className="text-sm dark:text-slate-400 text-slate-600">A password reset email will be sent to <strong>{user?.email}</strong>.</p>
          {resetMessage && <p className="text-sm text-emerald-400">{resetMessage}</p>}
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => { setOpenResetModal(false); setResetMessage(null); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSendPasswordReset} loading={sendingReset}>
              Send Email
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={openNameModal} onClose={() => setOpenNameModal(false)} title="Edit Username">
        <div className="space-y-4">
          <Input
            label="Username"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Your name"
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setOpenNameModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateName} loading={updatingName} disabled={!newName.trim()}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Keyboard Shortcuts */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-2 mb-3">
          <Command size={16} className="text-amber-400" />
          <h2 className="text-sm font-medium dark:text-slate-300 text-slate-700 uppercase tracking-wider">Keyboard Shortcuts</h2>
        </div>
        <GlassCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'theme', shortcut: '^ + J', desc: 'Toggle theme' },
              { id: 'command-form', shortcut: '^ + K', desc: 'Open command form' },
            ].map(({ id, shortcut, desc }) => (
              <div key={id} className="flex items-center gap-3">
                {shortcut ? (
                  <kbd className="text-[11px] font-mono dark:bg-white/5 bg-black/5 px-2 py-1 rounded-lg dark:text-slate-400 text-slate-500">
                    {shortcut}
                  </kbd>
                ) : (
                  <span className="w-13" aria-hidden="true" />
                )}
                <span className="text-xs dark:text-slate-400 text-slate-600">{desc}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Button variant="danger" onClick={handleLogout} icon={<LogOut size={16} />} className="w-full">
          Sign Out
        </Button>
      </motion.div>
    </PageContainer>
  );
}
