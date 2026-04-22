from typing import Any
from unittest.mock import MagicMock
from unittest.mock import AsyncMock
from db.user_account_queries import fetch_hashed_password
from db.user_account_queries import create_new_user_account
from routes.models import UserSignUpRequest
import pytest


def make_mock_session(fetchone_return: Any) -> AsyncMock:
    mock_result = MagicMock()
    mock_result.fetchone.return_value = fetchone_return
    session = AsyncMock()
    session.execute.return_value = mock_result
    return session


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
async def test_fetch_hashed_password_raises_when_user_not_found() -> None:
    session = make_mock_session(None)
    with pytest.raises(ValueError, match="No user account found"):
        await fetch_hashed_password(session, "unknown")


@pytest.mark.asyncio
async def test_create_new_user_account_raises_when_username_taken() -> None:
    session = make_mock_session(None)
    with pytest.raises(ValueError, match="Username already taken"):
        await create_new_user_account(session, make_user_data())


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "height_ft,height_in,expected_inches",
    [
        (5, 10, 70),
        (6, 0, 72),
        (5, 0, 60),
        (0, 0, 0),
    ],
)
async def test_create_new_user_account_height_conversion(
    height_ft: int, height_in: int, expected_inches: int
) -> None:
    session = make_mock_session(("testuser",))
    user_data = make_user_data(heightFT=height_ft, heightIn=height_in)

    await create_new_user_account(session, user_data)

    profile_call_params = session.execute.call_args_list[1][0][1]
    assert profile_call_params["heightin"] == expected_inches
