from app.schemas.common import CamelModel
from app.schemas.user import UserRead


class LoginPayload(CamelModel):
    email: str
    password: str


class RefreshPayload(CamelModel):
    # Arrives as { "refreshToken": ... } — see the axios interceptor
    # in the frontend (src/lib/axios.ts).
    refresh_token: str


class Tokens(CamelModel):
    """Matches `AuthTokens` in the frontend."""

    access_token: str
    refresh_token: str


class LoginResponse(CamelModel):
    """Matches `LoginResponse` in the frontend."""

    user: UserRead
    tokens: Tokens
