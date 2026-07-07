@AGENTS.md

# production-ready — fullstack base template

Base template for personal projects: Next.js at the repo root, FastAPI in
`backend/`. Copy the repo, edit a few config files, start building features.
Keep the template generic — no project-specific code. The two halves are
independent: the FE runs standalone (mock data), the BE makes the login demo
work end-to-end.

## Commands

| Command                                                    | Purpose                      |
| ---------------------------------------------------------- | ---------------------------- |
| `pnpm dev`                                                 | Dev server (Turbopack)       |
| `pnpm build` / `pnpm start`                                | Production build / serve     |
| `pnpm test`                                                | Run all tests once (Vitest)  |
| `pnpm vitest run src/hooks/__tests__/use-debounce.test.ts` | Run a single test file       |
| `pnpm lint` / `pnpm lint:fix`                              | ESLint (flat config)         |
| `pnpm format`                                              | Prettier over the whole repo |
| `pnpm type-check`                                          | `tsc --noEmit`               |
| `pnpm dlx shadcn@latest add <name>`                        | Add a shadcn/ui component    |

Pre-commit (Husky) runs lint-staged + type-check. Never suggest `--no-verify`.

Backend (run from `backend/`; use `python -m uv ...` if `uv` is not on PATH):

| Command                                             | Purpose                            |
| --------------------------------------------------- | ---------------------------------- |
| `uv sync`                                           | Install deps into .venv (uv.lock)  |
| `uv run fastapi dev app/main.py`                    | Dev server on :8000, docs at /docs |
| `uv run pytest`                                     | Backend tests (in-memory SQLite)   |
| `uv run ruff check --fix . && uv run ruff format .` | Lint + format                      |
| `uv run alembic revision --autogenerate -m "..."`   | New migration                      |
| `uv run alembic upgrade head`                       | Apply migrations                   |
| `uv run python -m app.db.seed`                      | Seed demo users (idempotent)       |

## Architecture — one-way data flow

```
component (components/) → hook (hooks/) → service (services/) → api (lib/axios.ts)
```

- **`services/`** is the ONLY layer that calls `api` (the axios instance).
  One file per backend domain (`auth.service.ts`). Services know endpoints and
  payload shapes; they know nothing about React.
- **`hooks/`** wrap services with React Query. Hooks own query keys (see
  `userKeys` in `use-users.ts`), caching, and UI side effects (toast, redirect).
- **Components never import axios or services directly** — only hooks.
- Query/mutation errors are toasted globally in `lib/query-client.ts`.
  A caller that renders its own error state opts out with `meta: { silent: true }`.

Key modules:

- `lib/axios.ts` — attaches Bearer token, refreshes on 401 (single-flight),
  redirects to `/login` when refresh fails. `getApiErrorMessage()` maps
  FastAPI-style errors to user-facing text. Adjust both when the backend changes.
- `lib/ability.ts` — CASL permission matrix per role. UI gating via `<Can>`
  or `useAppAbility()`. Provider lives in `components/providers.tsx`.
- `lib/toast.ts` — always call `notify.*`; never import react-toastify in components.
- `config/site.config.ts` — site name/domain/SEO. `config/features.config.ts` —
  feature flags. Environment values go in `.env.local` (template: `.env.example`).
- `styles/globals.css` — all theme colors as CSS variables (oklch). Never
  hardcode colors in components; use Tailwind tokens (`text-muted-foreground`,
  `var(--chart-2)`, ...).

## Conventions

- Components: PascalCase export, kebab-case file (`UsersTable` in `users-table.tsx`).
- Hooks: `useXxx` in `use-xxx.ts`. Services: `xxxService` in `xxx.service.ts`.
- Date/time: **date-fns only** — never add dayjs/moment.
- `components/ui/` is shadcn-generated; update via the CLI, avoid hand edits.
- Tests live in `__tests__/` next to the code. Component tests mock the
  service module (see `login-form.test.tsx`), not the hook.
- Full conventions doc for humans: `CONTRIBUTING.md`.

Backend (`backend/`):

- FE ↔ BE contract is camelCase JSON: every request/response schema inherits
  `CamelModel` (`app/schemas/common.py`). Response shapes mirror
  `src/types/*.ts` — change one side, change the other.
- New domain = model, schema, router, then import the model in
  `alembic/env.py` and run `alembic revision --autogenerate`.
- Auth-required routes take a `user: CurrentUser` parameter (`app/api/deps.py`).
- JWTs are stateless; refresh tokens are distinguished by a `type` claim
  (`app/core/security.py`). Real revocation needs a DB denylist — see
  the note in `routers/auth.py::logout`.

## Gotchas (learned while building this template)

- **zod 4 + react-hook-form**: use `standardSchemaResolver` from
  `@hookform/resolvers/standard-schema`. `zodResolver` breaks on type-level
  version coupling with zod ≥ 4.2.
- **CASL v7**: `@casl/react` exports `AbilityProvider`, `Can`, `useAbility()`
  (no args). `createContextualCan` no longer exists.
- **react-toastify v11**: no CSS import needed; styles are injected.
- ESLint shows a `react-hooks/incompatible-library` **warning** on
  `useReactTable()` — React Compiler skips memoizing it. Known upstream
  limitation, not fixable here; do not try to silence it with refactors.
- pnpm blocks postinstall scripts by default; `sharp`/`unrs-resolver` are
  allowlisted in `pnpm-workspace.yaml` (`allowBuilds`).
- On Windows, `fastapi dev/run` crashes with UnicodeEncodeError when its
  output is piped/redirected (it prints an emoji; piped stdout falls back to
  cp1252). Set `PYTHONUTF8=1` or run
  `uv run uvicorn app.main:app --port 8000` instead.
