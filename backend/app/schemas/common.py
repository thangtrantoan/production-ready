from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base schema: snake_case in Python, camelCase over the wire.

    The frontend types (src/types/*.ts) are camelCase; every request and
    response schema must inherit from this so the JSON matches them.
    `populate_by_name` lets tests and internal code still use snake_case.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class Paginated[T](CamelModel):
    """Matches `Paginated<T>` in the frontend (src/types/api.ts)."""

    items: list[T]
    total: int
    page: int
    page_size: int
