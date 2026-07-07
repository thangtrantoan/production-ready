"""Password hashing (argon2) and JWT creation/validation.

Two token types share one signing key and are distinguished by the `type`
claim, so an access token can never be replayed as a refresh token and
vice versa. The frontend's axios interceptor depends on this contract:
POST /auth/refresh with { refreshToken } must return a fresh pair.
"""

from datetime import UTC, datetime, timedelta
from typing import Literal

import jwt
from pwdlib import PasswordHash

from app.core.config import get_settings

ALGORITHM = "HS256"

password_hash = PasswordHash.recommended()

TokenType = Literal["access", "refresh"]


def hash_password(plain: str) -> str:
    return password_hash.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return password_hash.verify(plain, hashed)


def create_token(user_id: str, token_type: TokenType) -> str:
    settings = get_settings()
    if token_type == "access":
        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    else:
        expires_delta = timedelta(days=settings.refresh_token_expire_days)
    payload = {
        "sub": user_id,
        "type": token_type,
        "exp": datetime.now(UTC) + expires_delta,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_token(token: str, expected_type: TokenType) -> str:
    """Return the user id, raising jwt.InvalidTokenError on any problem."""
    settings = get_settings()
    payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    if payload.get("type") != expected_type:
        raise jwt.InvalidTokenError(f"Expected a {expected_type} token")
    user_id = payload.get("sub")
    if not isinstance(user_id, str) or not user_id:
        raise jwt.InvalidTokenError("Missing subject claim")
    return user_id
