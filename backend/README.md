# backend — FastAPI template

API mẫu khớp 1-1 với frontend: JWT auth (access + refresh), users có phân
trang, response camelCase đúng types trong `src/types/` của FE.

## Stack

FastAPI · SQLAlchemy 2.0 · SQLite (đổi Postgres chỉ cần sửa `DATABASE_URL`) ·
Alembic · PyJWT · pwdlib (argon2) · pydantic-settings · pytest · ruff · uv

## Chạy lần đầu

```bash
cd backend
uv sync                            # tạo .venv + cài deps theo uv.lock
cp .env.example .env               # điền SECRET_KEY thật
uv run alembic upgrade head        # tạo bảng
uv run python -m app.db.seed       # tạo user demo
uv run fastapi dev app/main.py     # http://localhost:8000, docs tại /docs
```

Đăng nhập demo: `admin@example.com` / `password123` (định nghĩa trong
`app/db/seed.py`).

Mở FE (`pnpm dev` ở repo gốc) → `/login` → đăng nhập bằng tài khoản trên là
chạy end-to-end: FE gọi `POST /api/v1/auth/login`, lưu token, interceptor tự
refresh khi access token hết hạn.

## Lệnh thường dùng

| Lệnh                                                | Tác dụng                 |
| --------------------------------------------------- | ------------------------ |
| `uv run fastapi dev app/main.py`                    | Dev server (auto-reload) |
| `uv run pytest`                                     | Chạy tests               |
| `uv run ruff check --fix . && uv run ruff format .` | Lint + format            |
| `uv run alembic revision --autogenerate -m "..."`   | Tạo migration mới        |
| `uv run alembic upgrade head`                       | Áp migrations            |

## Cấu trúc

```
app/
  main.py        # FastAPI app, CORS, mount routers dưới /api/v1
  core/
    config.py    # Settings đọc từ .env (pydantic-settings)
    security.py  # hash mật khẩu (argon2), tạo/verify JWT
  db/
    base.py      # Declarative Base duy nhất
    session.py   # engine + get_db dependency
    seed.py      # seed user demo (idempotent)
  models/        # SQLAlchemy models (1 file / bảng)
  schemas/       # Pydantic schemas — CamelModel để JSON ra camelCase khớp FE
  routers/       # endpoints theo domain (auth, users)
  api/deps.py    # dependencies dùng chung (get_current_user, DbSession)
tests/           # pytest, DB in-memory riêng, không đụng app.db
alembic/         # migrations (thêm model mới → import trong alembic/env.py)
```

## Convention

- Thêm domain mới = model + schema + router + import model vào
  `alembic/env.py` + autogenerate migration.
- Schema request/response luôn kế thừa `CamelModel` — FE nhận camelCase,
  Python vẫn viết snake_case.
- Route cần đăng nhập: thêm tham số `user: CurrentUser`. Cần phân quyền theo
  role thì check `user.role` trong route (hoặc viết dependency riêng).
- Đổi shape lỗi trả về → nhớ sửa `getApiErrorMessage` phía FE
  (`src/lib/axios.ts`).
