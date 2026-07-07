"""Seed the database with demo users. Idempotent — safe to run twice.

Usage (after `alembic upgrade head`):
    uv run python -m app.db.seed
"""

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import Role, User

# Demo credentials, also shown in backend/README.md.
ADMIN_EMAIL = "admin@example.com"
DEMO_PASSWORD = "password123"

SAMPLE_USERS = [
    ("Tran Thang", "thang.tran@example.com", Role.admin),
    ("Nguyen An", "an.nguyen@example.com", Role.manager),
    ("Le Binh", "binh.le@example.com", Role.manager),
    ("Pham Chi", "chi.pham@example.com", Role.member),
    ("Hoang Dung", "dung.hoang@example.com", Role.member),
    ("Vo Giang", "giang.vo@example.com", Role.member),
    ("Dang Ha", "ha.dang@example.com", Role.member),
    ("Bui Khanh", "khanh.bui@example.com", Role.member),
]


def seed() -> None:
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.email == ADMIN_EMAIL)):
            print("Database already seeded, nothing to do.")
            return

        hashed = hash_password(DEMO_PASSWORD)
        db.add(User(email=ADMIN_EMAIL, name="Admin", role=Role.admin, hashed_password=hashed))
        for name, email, role in SAMPLE_USERS:
            db.add(User(email=email, name=name, role=role, hashed_password=hashed))
        db.commit()
        print(f"Seeded {1 + len(SAMPLE_USERS)} users. Login: {ADMIN_EMAIL} / {DEMO_PASSWORD}")


if __name__ == "__main__":
    seed()
