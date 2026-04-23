from typing import Generator
from typing import AsyncGenerator
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import async_sessionmaker
from testcontainers.postgres import PostgresContainer
import asyncio
import pathlib
import pytest
import pytest_asyncio

INIT_SQL = pathlib.Path(__file__).parents[3] / "test-database" / "init.sql"

_TRUNCATE = """
    TRUNCATE TABLE user_daily_steps, user_profile, user_sessions, user_login
    RESTART IDENTITY CASCADE;
"""


@pytest.fixture(scope="session")
def postgres_container() -> Generator[PostgresContainer, None, None]:
    with PostgresContainer("postgres:17") as postgres:
        async_url = postgres.get_connection_url().replace("+psycopg2", "+asyncpg")

        async def _setup() -> None:
            engine = create_async_engine(async_url)
            async with engine.begin() as conn:
                for statement in INIT_SQL.read_text().split(";"):
                    stmt = statement.strip()
                    if stmt:
                        await conn.execute(text(stmt))
            await engine.dispose()

        asyncio.run(_setup())
        yield postgres


@pytest_asyncio.fixture
async def db_session(
    postgres_container: PostgresContainer,
) -> AsyncGenerator[AsyncSession, None]:
    async_url = postgres_container.get_connection_url().replace("+psycopg2", "+asyncpg")
    engine = create_async_engine(async_url)
    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with factory() as session:
        await session.execute(text(_TRUNCATE))
        await session.commit()
        yield session

    await engine.dispose()


async def seed_user(session: AsyncSession, username: str = "testuser") -> None:
    await session.execute(
        text("INSERT INTO user_login (username, hashed_password) VALUES (:u, :p)"),
        {"u": username, "p": "hashed_pw"},
    )
