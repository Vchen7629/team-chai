import pytest
from datetime import datetime, timedelta, timezone
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from tests.fixtures.db import seed_user
from db.session_queries import insert_new_user_session, get_username_with_session


@pytest.mark.asyncio
async def test_creates_session_with_correct_info(db_session: AsyncSession) -> None:
    await seed_user(db_session, "user1")

    before = datetime.now(timezone.utc)
    await insert_new_user_session(db_session, "user1", "session-token-1")
    after = datetime.now(timezone.utc)

    row = (
        await db_session.execute(
            text(
                "SELECT username, session_token, expire_at FROM user_sessions WHERE username = 'user1'"
            )
        )
    ).fetchone()

    assert row is not None
    assert row.username == "user1"
    assert row.session_token == "session-token-1"
    assert before + timedelta(hours=1) <= row.expire_at <= after + timedelta(hours=1)


@pytest.mark.asyncio
async def test_updates_session_token_and_expiry_on_conflict(
    db_session: AsyncSession,
) -> None:
    await seed_user(db_session, "user1")
    await insert_new_user_session(db_session, "user1", "old-token")

    before = datetime.now(timezone.utc)
    await insert_new_user_session(db_session, "user1", "new-token")
    after = datetime.now(timezone.utc)

    row = (
        await db_session.execute(
            text(
                "SELECT session_token, expire_at FROM user_sessions WHERE username = 'user1'"
            )
        )
    ).fetchone()

    assert row is not None
    assert row.session_token == "new-token"
    assert before + timedelta(hours=1) <= row.expire_at <= after + timedelta(hours=1)


@pytest.mark.asyncio
async def test_fetch_username_returns_correct_username(
    db_session: AsyncSession,
) -> None:
    await seed_user(db_session, "user1")
    await insert_new_user_session(db_session, "user1", "valid-token")

    username = await get_username_with_session(db_session, "valid-token")

    assert username == "user1"


@pytest.mark.asyncio
@pytest.mark.parametrize("token", ["nonexistent-token", "expired-token"])
async def test_fetch_raises_when_session_not_found(
    token: str, db_session: AsyncSession
) -> None:
    await seed_user(db_session, "user1")
    await db_session.execute(
        text(
            "INSERT INTO user_sessions (username, session_token, expire_at)"
            " VALUES ('user1', 'expired-token', NOW() - INTERVAL '1 hour')"
        )
    )

    with pytest.raises(ValueError):
        await get_username_with_session(db_session, token)
