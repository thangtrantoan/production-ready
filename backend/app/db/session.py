from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

# check_same_thread only applies to SQLite; harmless for other databases.
_connect_args = (
    {"check_same_thread": False} if get_settings().database_url.startswith("sqlite") else {}
)

engine = create_engine(get_settings().database_url, connect_args=_connect_args)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: one session per request, always closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
