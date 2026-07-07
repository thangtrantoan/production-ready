# Conventions

Ghi chú cho chính mình khi quay lại template này sau vài tháng.

## Luồng dữ liệu: component → hook → service → axios

- **`services/`** — nơi DUY NHẤT gọi `api` (axios instance). Mỗi domain một file
  (`auth.service.ts`, `user.service.ts`). Service chỉ biết endpoint + shape của
  payload/response, không biết gì về React.
- **`hooks/`** — bọc service bằng React Query (`useQuery`/`useMutation`). Hook sở
  hữu query key, cache, side effect UI (toast, redirect). Hook KHÔNG gọi axios
  trực tiếp.
- **`components/`** — chỉ gọi hook, không import axios hay service.

Lý do tách: đổi backend/endpoint chỉ sửa service; đổi cách cache/UX chỉ sửa hook;
component test được bằng cách mock service. Mỗi tầng một trách nhiệm.

## Naming

| Loại           | Quy ước                             | Ví dụ                                 |
| -------------- | ----------------------------------- | ------------------------------------- |
| Component      | PascalCase, file kebab-case         | `UsersTable` trong `users-table.tsx`  |
| Hook           | `useXxx`, file `use-xxx.ts`         | `useDebounce` trong `use-debounce.ts` |
| Service        | `xxxService`, file `xxx.service.ts` | `authService` trong `auth.service.ts` |
| Type/Interface | PascalCase, trong `src/types/`      | `User`, `LoginPayload`                |
| Query key      | Object `xxxKeys` cạnh hook          | `userKeys.list()`                     |

## Quy tắc cứng

- **Chỉ dùng `date-fns`** cho date/time. Không thêm dayjs/moment.
- **Không hardcode màu** trong component — dùng token Tailwind map từ CSS
  variables trong `src/styles/globals.css` (đổi theme = sửa 1 file).
- **Toast qua `notify`** (`src/lib/toast.ts`), không import `react-toastify`
  trong component.
- Lỗi query/mutation đã được toast tự động ở `src/lib/query-client.ts`.
  Muốn tự xử lý lỗi thì thêm `meta: { silent: true }`.
- Config theo site để trong `src/config/`, secret/URL theo môi trường để trong
  `.env.local` (mẫu ở `.env.example`).
- Component trong `src/components/ui/` là code sinh bởi shadcn CLI — cập nhật
  bằng `pnpm dlx shadcn@latest add <name>`, hạn chế sửa tay.

## Permissions (CASL)

Toàn bộ ma trận quyền nằm trong `src/lib/ability.ts`. Gate UI bằng
`<Can I="delete" a="User">` hoặc `useAppAbility().can(...)`. Role hiện tại được
set trong `components/providers.tsx` — thay bằng role từ user đăng nhập thật.

## Test

- Vitest + React Testing Library, file test đặt trong `__tests__/` cạnh code.
- Component test: mock service (xem `login-form.test.tsx`), không mock hook.
- Chạy: `pnpm test` (một lần) / `pnpm test:watch`.

## Trước khi commit

Husky tự chạy `lint-staged` (ESLint + Prettier trên file staged) và
`tsc --noEmit`. Commit fail thì sửa lỗi, đừng `--no-verify`.
