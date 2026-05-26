export const CATEGORIES = {
  income: [
    { name: 'Salary', icon: 'Briefcase', color: '#34d399' },
    { name: 'Freelance', icon: 'Laptop', color: '#60a5fa' },
    { name: 'Investments', icon: 'TrendingUp', color: '#a78bfa' },
    { name: 'Gifts', icon: 'Gift', color: '#fb923c' },
    { name: 'Other', icon: 'Coins', color: '#94a3b8' },
  ],
  expense: [
    { name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#fb923c' },
    { name: 'Shopping', icon: 'ShoppingBag', color: '#f472b6' },
    { name: 'Transport', icon: 'Car', color: '#60a5fa' },
    { name: 'Entertainment', icon: 'Gamepad2', color: '#a78bfa' },
    { name: 'Bills & Utilities', icon: 'Zap', color: '#fbbf24' },
    { name: 'Health', icon: 'Heart', color: '#f87171' },
    { name: 'Education', icon: 'GraduationCap', color: '#34d399' },
    { name: 'Housing', icon: 'Home', color: '#818cf8' },
    { name: 'Travel', icon: 'Plane', color: '#38bdf8' },
    { name: 'Subscriptions', icon: 'CreditCard', color: '#c084fc' },
    { name: 'Other', icon: 'MoreHorizontal', color: '#94a3b8' },
  ],
} as const;

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', group: 1 },
  { path: '/transactions', label: 'Transactions', icon: 'ArrowLeftRight', group: 2 },
  { path: '/loans', label: 'Loans', icon: 'Scale', group: 2 },
  { path: '/budget', label: 'Budget', icon: 'Target', group: 3 },
  { path: '/goals', label: 'Goals', icon: 'Trophy', group: 3 },
] as const;
