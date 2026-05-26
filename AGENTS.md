# AGENTS.md — Senior Web Developer Rules
## Stack: React + Vite + TypeScript + Tailwind CSS

> This file governs all AI agent behavior in this codebase. Follow every rule precisely.
> These instructions are binding across all tasks, files, and conversations.

---

## 📦 Canonical Tech Stack

> These are the **mandatory libraries** for this project. Do not introduce alternatives without explicit approval. If a library below covers a use case, use it — do not reinvent or substitute.

### ⚙️ Core Framework
| Role | Library | Notes |
|---|---|---|
| Framework | `react` ^18 | Functional components, concurrent features |
| Language | `typescript` ^5 | Strict mode always on |
| Build tool | `vite` ^5 | Native ESM, path aliases required |
| Styling | `tailwindcss` ^3.4 | Only styling method — no CSS modules |

### 🗺️ Routing
| Role | Library | Notes |
|---|---|---|
| Client routing | `react-router-dom` ^6 | File-based or config-based via `createBrowserRouter` |
| Route guards | Custom wrapper around `<Outlet>` | No third-party auth guard libs |

### 🌐 Server State & Data Fetching
| Role | Library | Notes |
|---|---|---|
| Server state | `@tanstack/react-query` ^5 | All async server data goes here |
| HTTP client | `axios` | Wrap in `src/lib/axios.ts` with interceptors |
| Realtime (if needed) | `socket.io-client` | Wrap in `src/lib/socket.ts` |

### 🗃️ Global Client State
| Role | Library | Notes |
|---|---|---|
| Global state | `zustand` ^4 | Preferred over Redux for simplicity |
| Complex state (alt) | `@reduxjs/toolkit` + `react-redux` | Only when Zustand falls short (large teams, devtools) |

### 📋 Forms & Validation
| Role | Library | Notes |
|---|---|---|
| Form management | `react-hook-form` ^7 | All forms — no exceptions |
| Schema validation | `zod` ^3 | Used for forms, API responses, env vars |
| RHF + Zod bridge | `@hookform/resolvers` | Always use `zodResolver` |

```ts
// ✅ Standard form setup
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

### 🎨 UI Components & Utilities
| Role | Library | Notes |
|---|---|---|
| Component primitives | `shadcn/ui` | Unstyled, accessible — extend with Tailwind |
| Accessible primitives (alt) | `@radix-ui/*` | Used under the hood by shadcn |
| Class merging | `clsx` + `tailwind-merge` | Always via `cn()` helper in `lib/utils.ts` |
| Icons | `lucide-react` | Default icon set — consistent sizing via `size` prop |
| Date utilities | `date-fns` | No moment.js — ever |
| Animations | `framer-motion` | For complex animations; Tailwind transitions for simple |

### 🔐 Auth
| Role | Library | Notes |
|---|---|---|
| Auth state | Custom Zustand store + `react-query` | No auth-specific lib unless project mandates (e.g. Clerk, Auth0) |
| JWT handling | Manual — `lib/token.ts` | Store in `httpOnly` cookie, never localStorage |
| OAuth (if needed) | Provider SDK (e.g. `@clerk/clerk-react`) | Wrap entirely in `features/auth/` |

### 🧪 Testing
| Role | Library | Notes |
|---|---|---|
| Test runner | `vitest` | Drop-in Jest replacement, native Vite |
| Component testing | `@testing-library/react` | Behavior-driven — never implementation |
| User events | `@testing-library/user-event` | Use over `fireEvent` for realistic interaction |
| DOM matchers | `@testing-library/jest-dom` | Extended matchers (`toBeInTheDocument`, etc.) |
| API mocking | `msw` ^2 (Mock Service Worker) | Mock at the network layer, not the module |

```ts
// ✅ MSW handler example
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([{ id: '1', name: 'Alice' }]);
  }),
];
```

### 📊 Data Display
| Role | Library | Notes |
|---|---|---|
| Tables | `@tanstack/react-table` ^8 | Headless — style with Tailwind |
| Charts | `recharts` | Preferred for dashboards |
| Virtualization | `@tanstack/react-virtual` | Required for lists > 100 items |

### 🛠️ Developer Experience
| Role | Library | Notes |
|---|---|---|
| Linting | `eslint` + `eslint-plugin-react` + `@typescript-eslint` | Zero warnings policy |
| Formatting | `prettier` + `prettier-plugin-tailwindcss` | Auto-sorts Tailwind classes |
| Git hooks | `husky` + `lint-staged` | Pre-commit: lint + typecheck + format |
| Commit style | `commitlint` + Conventional Commits | `feat:`, `fix:`, `chore:`, `refactor:` |
| Bundle analysis | `rollup-plugin-visualizer` | Run before shipping to catch bloat |

### 🌍 Internationalization (if required)
| Role | Library | Notes |
|---|---|---|
| i18n | `react-i18next` | JSON translation files in `public/locales/` |
| Locale formatting | `Intl` (native) | Dates, numbers, currency — no extra lib |

### 🔔 Notifications & Feedback
| Role | Library | Notes |
|---|---|---|
| Toast notifications | `sonner` | Minimal, accessible, Tailwind-friendly |
| Modals / Dialogs | `@radix-ui/react-dialog` (via shadcn) | Keyboard accessible out of the box |

### 📦 Version Pinning Rules
- All dependencies pinned to **minor version** (`^x.y.0`) — no wildcards.
- Run `npm audit` on every `package.json` change.
- Upgrade dependencies in **dedicated chore PRs** — never bundled with feature work.
- Lock file (`package-lock.json` / `pnpm-lock.yaml`) is **always committed**.

---

## 🧠 Agent Identity & Mindset

- You are a **senior frontend engineer** with deep expertise in React, TypeScript, Vite, and Tailwind CSS.
- Write code **as if it will be reviewed by your most critical peer**. No shortcuts, no lazy defaults.
- Always **reason before you code**. Understand the full scope of a task before touching a file.
- Prefer **clarity over cleverness**. Code is read far more than it is written.
- Never guess. If context is missing, **ask one precise clarifying question** before proceeding.

---

## 📁 Project Structure

```
src/
├── assets/          # Static assets (images, fonts, icons)
├── components/      # Shared, reusable UI components
│   └── ui/          # Primitive UI elements (Button, Input, Modal…)
├── features/        # Feature-based modules (self-contained)
│   └── [feature]/
│       ├── components/
│       ├── hooks/
│       ├── types.ts
│       └── index.ts
├── hooks/           # Global custom hooks
├── lib/             # Third-party wrappers, utilities, config
├── pages/           # Route-level page components
├── router/          # React Router config
├── services/        # API calls and data fetching logic
├── store/           # Global state (Zustand / Redux Toolkit)
├── styles/          # Global CSS, Tailwind base overrides
├── types/           # Shared TypeScript types and interfaces
└── utils/           # Pure utility functions
```

- **Never** put business logic in page components.
- **Always** colocate feature-specific code inside `features/[feature]/`.
- Keep `components/ui/` as pure, stateless primitives only.
- One component per file. Filename matches the exported component name exactly.

---

## ⚛️ React Rules

### Components
- Use **functional components exclusively**. No class components.
- Export components as **named exports**, not default exports (exception: pages/routes).
- Props must be typed with a `interface` named `[ComponentName]Props`.
- Destructure props at the function signature level.
- Keep components **under 150 lines**. Extract sub-components or hooks if larger.
- No inline styles. Use Tailwind classes only.

```tsx
// ✅ Correct
interface UserCardProps {
  name: string;
  avatarUrl: string;
  onClick: () => void;
}

export function UserCard({ name, avatarUrl, onClick }: UserCardProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-100">
      <img src={avatarUrl} alt={name} className="size-10 rounded-full object-cover" />
      <span className="text-sm font-medium text-gray-900">{name}</span>
    </button>
  );
}
```

### Hooks
- Extract all stateful logic into **custom hooks** (`use[Name].ts`).
- Hooks live in `hooks/` (global) or `features/[feature]/hooks/` (scoped).
- Never call hooks conditionally.
- `useEffect` must always declare a complete dependency array. Never suppress ESLint warnings — fix them.
- Avoid `useEffect` for derived state; use `useMemo` instead.

```tsx
// ✅ Correct — derived state without useEffect
const filteredUsers = useMemo(
  () => users.filter((u) => u.role === selectedRole),
  [users, selectedRole]
);
```

### State Management
- Local UI state → `useState` / `useReducer`
- Server state → **TanStack Query** (`useQuery`, `useMutation`)
- Global client state → **Zustand** (preferred) or Redux Toolkit
- Never store server data in global client state. That is what TanStack Query is for.
- Avoid prop drilling beyond 2 levels — lift state or use context / store.

---

## 🔷 TypeScript Rules

- **Strict mode is always on.** `tsconfig.json` must include `"strict": true`.
- No `any`. Ever. Use `unknown` and narrow it, or model the type correctly.
- No `// @ts-ignore` or `// @ts-expect-error` without a mandatory comment explaining why.
- Prefer `interface` for object shapes, `type` for unions, intersections, and utility types.
- Use `const` assertions where appropriate (`as const`).
- Use **discriminated unions** for variant states (loading / error / success).
- Explicit return types on all functions that are not simple arrow expressions.

```ts
// ✅ Correct — discriminated union for async state
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
```

- Avoid type assertions (`as SomeType`) except at data boundaries (API responses, localStorage).
- All API response types must live in `types/` or `services/` and be validated (e.g., with Zod).

---

## 🎨 Tailwind CSS Rules

- Tailwind is the **only** styling method. No CSS modules, no styled-components, no inline styles.
- Use **semantic class grouping order**: layout → spacing → sizing → typography → color → border → effects.
- Extract repeated class combinations into components or `cn()` utility — never duplicate long strings.
- Use the `cn()` helper (clsx + tailwind-merge) for conditional classes.

```ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
// ✅ Correct conditional classes
<button className={cn(
  'px-4 py-2 rounded-lg font-medium transition-colors',
  isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>
```

- Use `tailwind.config.ts` for design tokens (colors, spacing, fonts). Never hardcode values.
- Responsive design is **mobile-first**. Default styles = mobile. Use `sm:`, `md:`, `lg:` to scale up.
- Use `size-*` shorthand (Tailwind v3.3+) instead of separate `w-*` + `h-*` for square elements.

---

## ⚡ Vite Rules

- Never import from `src/` using relative `../../` paths more than 2 levels deep. Configure path aliases.
- Path aliases must be defined in **both** `vite.config.ts` and `tsconfig.json`.

```ts
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@components': path.resolve(__dirname, './src/components'),
    '@features': path.resolve(__dirname, './src/features'),
    '@hooks': path.resolve(__dirname, './src/hooks'),
    '@lib': path.resolve(__dirname, './src/lib'),
    '@services': path.resolve(__dirname, './src/services'),
    '@types': path.resolve(__dirname, './src/types'),
    '@utils': path.resolve(__dirname, './src/utils'),
  },
},
```

- Use **dynamic imports** (`React.lazy` + `Suspense`) for route-level code splitting.
- Environment variables must be prefixed with `VITE_` and typed in `vite-env.d.ts`.
- Never access `import.meta.env` directly in components — wrap in a `config.ts` module.

---

## 🗂️ File & Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Components | PascalCase | `UserCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuthUser.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types/Interfaces | PascalCase | `UserProfile`, `ApiResponse<T>` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| CSS classes | Tailwind only | — |
| Test files | `[name].test.tsx` | `UserCard.test.tsx` |
| Story files | `[name].stories.tsx` | `UserCard.stories.tsx` |

- Feature folders use **kebab-case**: `features/user-profile/`
- Boolean props/vars: prefix with `is`, `has`, `can`, `should` — e.g., `isLoading`, `hasError`.
- Event handlers: prefix with `handle` — e.g., `handleSubmit`, `handleClose`.
- Callback props: prefix with `on` — e.g., `onSubmit`, `onClose`.

---

## 🔌 API & Data Fetching

- All API calls live in `services/`. Never fetch inside components directly.
- Use **TanStack Query** for all server state. Configure `staleTime` and `gcTime` explicitly.
- Define **query key factories** as constants to avoid string duplication.

```ts
// services/users/queryKeys.ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};
```

- All API responses must be **validated with Zod** at the service layer boundary.
- Handle errors explicitly. Never swallow errors silently. Always surface them to the UI.
- Use **optimistic updates** for mutations that affect list data the user just interacted with.

---

## 🔒 Security & Quality Rules

- Never store sensitive data (tokens, secrets) in `localStorage` without encryption. Prefer `httpOnly` cookies.
- Never `dangerouslySetInnerHTML` unless the input is explicitly sanitized.
- Sanitize all user-generated content before rendering.
- All forms must use **React Hook Form** + Zod schema validation.
- Always handle loading and error states in every data-fetching component.
- Implement proper **error boundaries** at route and feature levels.
- All images must have descriptive `alt` attributes.
- All interactive elements must be **keyboard accessible**.

---

## 🧪 Testing Standards

- Test files colocated with source files or in `__tests__/` folder.
- Use **Vitest** + **React Testing Library**.
- Test **behavior**, not implementation. Query by accessible role, label, text — never by class or id.
- Every custom hook must have a dedicated test file.
- Every utility function must be 100% unit tested.
- Aim for meaningful coverage — not coverage for its own sake.

```tsx
// ✅ Correct RTL query
const submitButton = screen.getByRole('button', { name: /submit/i });

// ❌ Never do this
const submitButton = document.querySelector('.btn-primary');
```

---

## ♻️ Code Quality & Review Standards

- **DRY**: If you write something twice, abstract it. Three times: it needs a shared utility.
- **SOLID** principles apply to React: single responsibility per component and hook.
- No commented-out code in commits. Use git to track history.
- No `console.log` in production code. Use a logger utility with env guards.
- All functions do **one thing**. If the name needs "and" in it, split the function.
- Magic numbers and strings must be extracted to named constants.
- PR diff target: **under 400 lines** per change. Split large features into incremental PRs.

---

## 🚫 Absolute Prohibitions

These patterns are **never** acceptable in this codebase:

```
❌ any type
❌ @ts-ignore without documented reason
❌ useEffect for derived state
❌ Default exports (except pages)
❌ Inline styles
❌ CSS Modules or styled-components
❌ Fetching data inside components
❌ Storing server state in Zustand/Redux
❌ More than 2 levels of relative imports
❌ Components over 150 lines (without justification)
❌ console.log in committed code
❌ Uncommitted debug or dead code
❌ Magic numbers or strings in logic
❌ Non-accessible interactive elements
❌ Untyped event handlers
```

### 🚫 Banned Library Substitutions

These libraries are explicitly **forbidden** — use the canonical stack instead:

| Banned | Use instead | Reason |
|---|---|---|
| `moment.js` | `date-fns` | 300kb bloat, no tree-shaking |
| `lodash` (full bundle) | Native ES / `lodash-es` specific imports | Bundle size |
| `axios` called in components | `services/` layer only | Separation of concerns |
| `styled-components` / `emotion` | Tailwind + `cn()` | Single styling system |
| `react-query` v3 | `@tanstack/react-query` v5 | Breaking API, abandoned |
| `redux` (plain) | `@reduxjs/toolkit` | Boilerplate and footguns |
| `react-table` v7 | `@tanstack/react-table` v8 | v7 abandoned, full rewrite |
| `enzyme` | `@testing-library/react` | Tests implementation not behavior |
| `fireEvent` | `@testing-library/user-event` | Doesn't simulate real browser events |
| `yup` | `zod` | Inferior TypeScript inference |
| `react-toastify` | `sonner` | Heavier, less composable |
| `react-select` | Radix/shadcn `Combobox` | Inconsistent with design system |
| `jQuery` | Never | This is 2026 |

---

## ✅ Pre-Task Checklist

Before starting any task, confirm:

- [ ] I understand the full scope — I won't need to refactor this immediately after.
- [ ] I know which files/features are affected.
- [ ] My approach follows the project structure above.
- [ ] I'm not introducing a new pattern when an existing one fits.
- [ ] Edge cases (loading, error, empty state) are accounted for.
- [ ] This change is testable and I know what to test.

---

## ✅ Pre-Commit Checklist

Before every commit, confirm:

- [ ] TypeScript compiles with zero errors (`tsc --noEmit`).
- [ ] ESLint passes with zero warnings (`eslint . --max-warnings 0`).
- [ ] All new code has appropriate types — no `any`.
- [ ] All new components handle loading, error, and empty states.
- [ ] No `console.log`, dead code, or commented-out blocks.
- [ ] New utilities/hooks have unit tests.
- [ ] Tailwind classes are ordered and deduplicated.
- [ ] Path aliases used — no deep relative imports.

---

*Last updated: 2026 — maintained by the senior engineering team.*
