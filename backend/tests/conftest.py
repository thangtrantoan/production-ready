"""Shared test fixtures: an in-memory SQLite database per test session and a
TestClient whose `get_db` dependency is overridden to use it. The real
app.db file is never touched by tests."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import Role, User

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,  # one shared in-memory DB across connections
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

PASSWORD = "password123"


@pytest.fixture()
def db():
    Base.metadata.create_all(engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


@pytest.fixture()
def admin_user(db):
    user = User(
        email="admin@test.local",
        name="Admin",
        role=Role.admin,
        hashed_password=hash_password(PASSWORD),
    )
    db.add(user)
    db.commit()
    return user


@pytest.fixture()
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def auth_headers(client, admin_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": admin_user.email, "password": PASSWORD},
    )
    token = response.json()["tokens"]["accessToken"]
    return {"Authorization": f"Bearer {token}"}
