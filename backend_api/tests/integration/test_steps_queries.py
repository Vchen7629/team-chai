from datetime import date
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from tests.fixtures.db import seed_user
from db.steps_queries import update_user_steps
from db.steps_queries import get_curr_date_steps
from db.steps_queries import insert_user_new_steps
import pytest


@pytest.mark.asyncio
async def test_insert_user_new_steps_inserts_row(db_session: AsyncSession) -> None:
    await seed_user(db_session)

    await insert_user_new_steps(db_session, "testuser", 500)

    row = (
        await db_session.execute(
            text("SELECT steps FROM user_daily_steps WHERE username = 'testuser'")
        )
    ).fetchone()
    assert row is not None
    assert row.steps == 500


@pytest.mark.asyncio
async def test_insert_user_new_steps_replaces_on_same_date(
    db_session: AsyncSession,
) -> None:
    await seed_user(db_session)
    await insert_user_new_steps(db_session, "testuser", 100)

    await insert_user_new_steps(db_session, "testuser", 300)

    row = (
        await db_session.execute(
            text("SELECT steps FROM user_daily_steps WHERE username = 'testuser'")
        )
    ).fetchone()

    assert row is not None
    assert row.steps == 300


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "initial_steps,added_steps,expected_total",
    [
        (100, 50, 150),
        (500, 500, 1000),
        (1, 999, 1000),
    ],
)
async def test_update_user_steps_increments_existing(
    initial_steps: int, added_steps: int, expected_total: int, db_session: AsyncSession
) -> None:
    await seed_user(db_session)
    await insert_user_new_steps(db_session, "testuser", initial_steps)

    await update_user_steps(db_session, "testuser", added_steps)

    row = (
        await db_session.execute(
            text("SELECT steps FROM user_daily_steps WHERE username = 'testuser'")
        )
    ).fetchone()

    assert row is not None
    assert row.steps == expected_total


@pytest.mark.asyncio
async def test_get_curr_date_steps_returns_correct_value(
    db_session: AsyncSession,
) -> None:
    await seed_user(db_session)
    await insert_user_new_steps(db_session, "testuser", 750)

    stored = (
        await db_session.execute(
            text("SELECT curr_date FROM user_daily_steps WHERE username = 'testuser'")
        )
    ).fetchone()

    result = await get_curr_date_steps(db_session, "testuser", stored[0])

    assert result == 750


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "username_with_spaces",
    [
        " testuser",
        "testuser ",
        " testuser ",
    ],
)
async def test_insert_user_new_steps_strips_whitespace(
    username_with_spaces: str, db_session: AsyncSession
) -> None:
    await seed_user(db_session)

    await insert_user_new_steps(db_session, username_with_spaces, 100)

    row = (
        await db_session.execute(
            text("SELECT steps FROM user_daily_steps WHERE username = 'testuser'")
        )
    ).fetchone()
    assert row is not None
    assert row.steps == 100
