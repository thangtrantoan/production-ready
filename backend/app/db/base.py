from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Single declarative base for every model.

    Alembic's env.py imports the model modules explicitly so autogenerate
    sees the full schema — add new model imports there when you add tables.
    """
