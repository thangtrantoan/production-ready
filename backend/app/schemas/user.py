from datetime import datetime

from app.models.user import Role
from app.schemas.common import CamelModel


class UserRead(CamelModel):
    """Matches `User` in the frontend (src/types/auth.ts)."""

    id: str
    email: str
    name: str
    role: Role
    active: bool
    created_at: datetime
