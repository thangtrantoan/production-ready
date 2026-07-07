import jwt
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.core.security import create_token, decode_token, verify_password
from app.models.user import User
from app.schemas.auth import LoginPayload, LoginResponse, RefreshPayload, Tokens
from app.schemas.user import UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


def _token_pair(user_id: str) -> Tokens:
    return Tokens(
        access_token=create_token(user_id, "access"),
        refresh_token=create_token(user_id, "refresh"),
    )


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginPayload, db: DbSession) -> LoginResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    # Same message for "no such user" and "wrong password" — don't leak
    # which emails exist.
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )
    return LoginResponse(user=UserRead.model_validate(user), tokens=_token_pair(user.id))


@router.post("/refresh", response_model=Tokens)
def refresh(payload: RefreshPayload, db: DbSession) -> Tokens:
    """Exchange a valid refresh token for a new access + refresh pair.

    Contract with the frontend interceptor (src/lib/axios.ts): body is
    { refreshToken }, response is { accessToken, refreshToken }.
    """
    try:
        user_id = decode_token(payload.refresh_token, expected_type="refresh")
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        ) from None
    user = db.get(User, user_id)
    if user is None or not user.active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    return _token_pair(user.id)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(_: CurrentUser) -> None:
    """Stateless JWTs: nothing to invalidate server-side. If you need real
    revocation, store refresh tokens (or a denylist) in the database and
    check it in /refresh."""


@router.get("/me", response_model=UserRead)
def me(current_user: CurrentUser) -> UserRead:
    return UserRead.model_validate(current_user)
