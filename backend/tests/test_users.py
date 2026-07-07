from app.core.security import hash_password
from app.models.user import Role, User


def test_list_users_requires_auth(client):
    assert client.get("/api/v1/users").status_code == 401


def test_list_users_returns_paginated_camelcase(client, db, admin_user, auth_headers):
    hashed = hash_password("irrelevant")
    for index in range(12):
        db.add(
            User(
                email=f"user{index}@test.local",
                name=f"User {index}",
                role=Role.member,
                hashed_password=hashed,
            )
        )
    db.commit()

    response = client.get("/api/v1/users?page=1&pageSize=10", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    # Shape must match the frontend's Paginated<User> (src/types/api.ts).
    assert set(body) == {"items", "total", "page", "pageSize"}
    assert body["total"] == 13  # 12 members + the admin fixture
    assert len(body["items"]) == 10
    assert {"id", "email", "name", "role", "active", "createdAt"} <= set(body["items"][0])
