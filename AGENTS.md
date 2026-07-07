<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project conventions

Read `CONTRIBUTING.md` before writing code. Key rules: components never
import axios directly (component → hook → service → `src/lib/axios.ts`),
date handling uses `date-fns` only, toasts go through `notify` in
`src/lib/toast.ts`, and theme colors come from CSS variables in
`src/styles/globals.css` — never hardcoded in components.
