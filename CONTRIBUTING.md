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
- **Không hardcode màu** trong component — dùng Tailwind utility map từ token
  trong `src/styles/` (xem mục CSS & theme bên dưới).
- **Toast qua `notify`** (`src/lib/toast.ts`), không import `react-toastify`
  trong component.
- Lỗi query/mutation đã được toast tự động ở `src/lib/query-client.ts`.
  Muốn tự xử lý lỗi thì thêm `meta: { silent: true }`.
- Config theo site để trong `src/config/`, secret/URL theo môi trường để trong
  `.env.local` (mẫu ở `.env.example`).
- Component trong `src/components/ui/` là code sinh bởi shadcn CLI — cập nhật
  bằng `pnpm dlx shadcn@latest add <name>`, hạn chế sửa tay.

## CSS & theme

Token chia tầng trong `src/styles/`, `globals.css` import theo đúng thứ tự:

| File                 | Vai trò                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| `primitive.css`      | Bảng màu thô (oklch). Chỉ là giá trị, không mang nghĩa.                  |
| `semantic.css`       | Token theo vai trò (`--background`, `--primary`), tham chiếu primitive.  |
| `dark.css`           | Override token semantic trong scope `.dark`. Không định nghĩa token mới. |
| `tailwind-theme.css` | `@theme inline` map token semantic thành utility (`bg-background`, ...). |

Quy tắc:

- Component chỉ dùng Tailwind utility (`text-muted-foreground`, `bg-card`).
  Chỗ class không với tới (props của chart lib như recharts, inline style)
  thì dùng token semantic trực tiếp (`var(--chart-2)`) — không dùng primitive,
  không viết oklch/hex trong component.
- Cần màu mới: thêm vào `primitive.css` → đặt tên semantic trong
  `semantic.css` (+ override dark nếu cần) → map trong `tailwind-theme.css`.
- Không tạo file `.css` riêng cho component — style bằng utility trong JSX.
  Class string lặp lại nhiều biến thể thì gom vào `cva()`.
- `semantic.css` và `dark.css` chỉ chứa `var(--primitive)` — cần giá trị mới
  thì thêm nấc vào `primitive.css` trước, không viết oklch trần tại chỗ.
  (Ramp `--neutral-*` là default của shadcn, thay khi theme project thật.)
- `pnpm dlx shadcn@latest add <name>` có thể ghi cssVars mới vào
  `globals.css` (file khai trong `components.json`) — sau khi add, chuyển
  các biến đó vào `semantic.css`/`dark.css` cho đúng tầng.

Tạo token mới (root hay component?):

- Mặc định **không tạo token mới** — tìm token semantic có sẵn đúng vai trò
  trước (`--muted`, `--accent`, `--destructive`...).
- Tạo **token root** trong `semantic.css` khi một vai trò lặp lại ở ≥2 chỗ
  hoặc cần đổi theo theme (có override trong `dark.css`).
- Tạo **token theo component** (kiểu `--sidebar-*`) khi một component lớn cần
  bộ màu riêng: prefix bằng tên component, vẫn khai trong `semantic.css`
  (+ `dark.css` nếu khác dark), map trong `tailwind-theme.css` nếu dùng làm
  utility.
- Naming: `--{component?}-{role}`; cặp nền/chữ dùng hậu tố `-foreground`
  (`--card` / `--card-foreground`).

## Giữ file nhỏ

- Soft cap **~200 dòng**/file, mỗi file export đúng **1 component**.
- Quá cap thì tách: subcomponent ra file cạnh bên, logic (state, effect,
  derived data) chuyển vào hook riêng. Đừng để component phình thành God
  component.
- Hook/service cũng vậy: một trách nhiệm mỗi file; hook làm quá nhiều việc
  thì tách nhỏ.

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
