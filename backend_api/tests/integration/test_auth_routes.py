from typing import Any
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from db.auth_queries import insert_new_user_account
from routes.models import UserSignUpRequest
import pytest

VALID_PASSWORD = "password123"


def make_signup_payload(**overrides: Any) -> dict[str, Any]:
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": VALID_PASSWORD,
        "age": 25,
        "weight": 150,
        "heightFT": 5,
        "heightIn": 10,
        "gender": "male",
        "activityLevel": "moderate",
        "targetsteps": 10000,
        **overrides,
    }


@pytest.mark.asyncio
async def test_signup_returns_201(test_app: FastAPI) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=test_app), base_url="http://test"
    ) as client:
        response = await client.post("/auth/signup", json=make_signup_payload())
    assert response.status_code == 201
    assert response.json() == {"message": "successfully created new user!"}


@pytest.mark.asyncio
async def test_signup_returns_409_on_duplicate_username(
    test_app: FastAPI, db_session: AsyncSession
) -> None:
    await insert_new_user_account(
        db_session, UserSignUpRequest(**make_signup_payload())
    )

    async with AsyncClient(
        transport=ASGITransport(app=test_app), base_url="http://test"
    ) as client:
        response = await client.post("/auth/signup", json=make_signup_payload())

    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_returns_200_with_session_token(
    test_app: FastAPI, db_session: AsyncSession
) -> None:
    await insert_new_user_account(
        db_session, UserSignUpRequest(**make_signup_payload())
    )

    async with AsyncClient(
        transport=ASGITransport(app=test_app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/auth/login", json={"username": "testuser", "password": VALID_PASSWORD}
        )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "login successful!"
    assert "session_token" in data


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "username,password,expected_status",
    [
        ("testuser", "wrongpassword", 401),
        ("nobody", "password123", 404),
    ],
)
async def test_login_returns_error_on_bad_credentials(
    username: str,
    password: str,
    expected_status: int,
    test_app: FastAPI,
    db_session: AsyncSession,
) -> None:
    await insert_new_user_account(
        db_session, UserSignUpRequest(**make_signup_payload())
    )

    async with AsyncClient(
        transport=ASGITransport(app=test_app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/auth/login", json={"username": username, "password": password}
        )

    assert response.status_code == expected_status
