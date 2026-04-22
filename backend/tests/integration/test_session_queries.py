import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from tests.fixtures.db import seed_user
from db.session_queries import create_new_user_session


@pytest.mark.asyncio
async def test_creates_session_with_correct_info(db_session: AsyncSession) -> None:
    await seed_user(db_session, "user1")

    await create_new_user_session(db_session, "user1", "session-token-1")

    row = (
        await db_session.execute(
            text(
                "SELECT username, session_token FROM user_sessions WHERE username = 'user1'"
            )
        )
    ).fetchone()

    assert row is not None
    assert row.username == "user1"
    assert row.session_token == "session-token-1"


@pytest.mark.asyncio
async def test_updates_session_token_on_conflict(db_session: AsyncSession) -> None:
    await seed_user(db_session, "user1")
    await create_new_user_session(db_session, "user1", "old-token")

    await create_new_user_session(db_session, "user1", "new-token")

    row = (
        await db_session.execute(
            text("SELECT session_token FROM user_sessions WHERE username = 'user1'")
        )
    ).fetchone()

    assert row is not None
    assert row.session_token == "new-token"
