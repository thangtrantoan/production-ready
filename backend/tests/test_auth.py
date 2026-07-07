from tests.conftest import PASSWORD


def test_login_returns_user_and_camelcase_tokens(client, admin_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": admin_user.email, "password": PASSWORD},
    )
    assert response.status_code == 200
    body = response.json()
    # Shape must match the frontend's LoginResponse (src/types/auth.ts).
    assert body["user"]["email"] == admin_user.email
    assert body["user"]["role"] == "admin"
    assert "createdAt" in body["user"]
    assert set(body["tokens"]) == {"accessToken", "refreshToken"}


def test_login_rejects_wrong_password(client, admin_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": admin_user.email, "password": "wrong-password"},
    )
    assert response.status_code == 401


def test_me_requires_token(client):
    assert client.get("/api/v1/auth/me").status_code == 401


def test_me_returns_current_user(client, admin_user, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == admin_user.email


def test_refresh_rotates_tokens(client, admin_user):
    login = client.post(
        "/api/v1/auth/login",
        json={"email": admin_user.email, "password": PASSWORD},
    )
    refresh_token = login.json()["tokens"]["refreshToken"]

    response = client.post("/api/v1/auth/refresh", json={"refreshToken": refresh_token})
    assert response.status_code == 200
    tokens = response.json()
    assert set(tokens) == {"accessToken", "refreshToken"}

    # The new access token must actually work.
    me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {tokens['accessToken']}"},
    )
    assert me.status_code == 200


def test_refresh_rejects_access_token(client, admin_user):
    login = client.post(
        "/api/v1/auth/login",
        json={"email": admin_user.email, "password": PASSWORD},
    )
    access_token = login.json()["tokens"]["accessToken"]

    response = client.post("/api/v1/auth/refresh", json={"refreshToken": access_token})
    assert response.status_code == 401
