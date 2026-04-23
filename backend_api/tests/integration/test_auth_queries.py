import pytest
import bcrypt
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from db.auth_queries import fetch_hashed_password, create_new_user_account
from routes.models import UserSignUpRequest


def make_user_data(**overrides: int | str) -> UserSignUpRequest:
    defaults = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123",
        "age": 25,
        "weight": 150,
        "heightFT": 5,
        "heightIn": 10,
        "gender": "male",
        "activityLevel": "moderate",
        "targetsteps": 10000,
    }
    defaults.update(overrides)
    return UserSignUpRequest(**defaults)


@pytest.mark.asyncio
async def test_create_new_user_account_creates_login_and_profile_rows(
    db_session: AsyncSession,
) -> None:
    await create_new_user_account(db_session, make_user_data())

    login_row = (
        await db_session.execute(
            text("SELECT username FROM user_login WHERE username = 'testuser'")
        )
    ).fetchone()
    profile_row = (
        await db_session.execute(
            text("SELECT username FROM user_profile WHERE username = 'testuser'")
        )
    ).fetchone()

    assert login_row is not None
    assert profile_row is not None


@pytest.mark.asyncio
async def test_create_new_user_account_raises_on_duplicate_username(
    db_session: AsyncSession,
) -> None:
    await create_new_user_account(db_session, make_user_data())

    with pytest.raises(ValueError, match="Username already taken"):
        await create_new_user_account(db_session, make_user_data())


@pytest.mark.asyncio
async def test_fetch_hashed_password_returns_stored_hash(
    db_session: AsyncSession,
) -> None:
    await create_new_user_account(db_session, make_user_data(password="plaintext"))

    stored_hash = await fetch_hashed_password(db_session, "testuser")

    assert bcrypt.checkpw("plaintext".encode(), stored_hash.encode())


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "lookup_username",
    [
        "testuser",
        "TestUser",
        "TESTUSER",
        " testuser ",
        " TestUser ",
    ],
)
async def test_fetch_hashed_password_case_insensitive_and_strips_whitespace(
    lookup_username: str, db_session: AsyncSession
) -> None:
    await create_new_user_account(db_session, make_user_data())

    result = await fetch_hashed_password(db_session, lookup_username)

    assert result is not None
