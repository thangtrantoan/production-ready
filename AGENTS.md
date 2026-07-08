<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project conventions

Read `CONTRIBUTING.md` before writing code. Key rules: components never
import axios directly (component → hook → service → `src/lib/axios.ts`),
date handling uses `date-fns` only, toasts go through `notify` in
`src/lib/toast.ts`, and colors come from the token pipeline in `src/styles/`
(primitive → semantic → tailwind-theme) — components use Tailwind utilities,
or `var(--semantic-token)` where a class can't reach (chart-lib props);
never hardcoded colors or raw primitives. Keep files small: soft cap
~200 lines, one exported component per file.
