from datetime import date
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import patch
from db.session_queries import create_new_user_session
from tests.fixtures.db import seed_user
import pytest

SESSION_TOKEN = "test-session-token"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "path,body",
    [
        ("/steps/new", {"session_token": "invalid", "steps": 500}),
        ("/steps/add", {"session_token": "invalid", "steps": 100}),
        ("/steps/get", {"session_token": "invalid", "date": "2026-04-22"}),
    ],
)
async def test_all_steps_endpoints_return_401_on_invalid_session(
    path: str, body: dict[str, str | int], test_app: FastAPI
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=test_app), base_url="http://test"
    ) as client:
        response = await client.post(path, json=body)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_new_steps_returns_201(
    test_app: FastAPI, db_session: AsyncSession
) -> None:
    await seed_user(db_session)
    await create_new_user_session(db_session, "testuser", SESSION_TOKEN)

    async with AsyncClient(
        transport=ASGITransport(app=test_app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/steps/new", json={"session_token": SESSION_TOKEN, "steps": 500}
        )

    assert response.status_code == 201
    row = (
        await db_session.execute(
            text("SELECT steps FROM user_daily_steps WHERE username = 'testuser'")
        )
    ).fetchone()
    assert row is not None
    assert row.steps == 500


@pytest.mark.asyncio
async def test_new_steps_returns_404_on_fk_violation(test_app: FastAPI) -> None:
    orig = Exception("insert or update on table violates foreign key constraint")
    with (
        patch("routes.steps.fetch_username_with_session", return_value="ghost"),
        patch(
            "routes.steps.create_user_new_steps",
            side_effect=IntegrityError("stmt", {}, orig),
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=test_app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/steps/new", json={"session_token": SESSION_TOKEN, "steps": 500}
            )
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


@pytest.mark.asyncio
async def test_add_steps_returns_200(
    test_app: FastAPI, db_session: AsyncSession
) -> None:
    await seed_user(db_session)
    await create_new_user_session(db_session, "testuser", SESSION_TOKEN)

    await db_session.execute(
        text(
            "INSERT INTO user_daily_steps (username, steps, curr_date) VALUES ('testuser', 100, CURRENT_DATE)"
        )
    )

    async with AsyncClient(
        transport=ASGITransport(app=test_app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/steps/add", json={"session_token": SESSION_TOKEN, "steps": 200}
        )

    assert response.status_code == 200
    row = (
        await db_session.execute(
            text("SELECT steps FROM user_daily_steps WHERE username = 'testuser'")
        )
    ).fetchone()

    assert row is not None
    assert row.steps == 300


@pytest.mark.asyncio
async def test_get_steps_returns_correct_count(
    test_app: FastAPI, db_session: AsyncSession
) -> None:
    await seed_user(db_session)
    await create_new_user_session(db_session, "testuser", SESSION_TOKEN)
    await db_session.execute(
        text(
            "INSERT INTO user_daily_steps (username, steps, curr_date) VALUES ('testuser', 750, CURRENT_DATE)"
        )
    )

    async with AsyncClient(
        transport=ASGITransport(app=test_app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/steps/get",
            json={"session_token": SESSION_TOKEN, "date": date.today().isoformat()},
        )

    assert response.status_code == 200
    assert response.json() == 750


@pytest.mark.asyncio
async def test_get_steps_returns_404_when_no_steps(
    test_app: FastAPI, db_session: AsyncSession
) -> None:
    await seed_user(db_session)
    await create_new_user_session(db_session, "testuser", SESSION_TOKEN)

    async with AsyncClient(
        transport=ASGITransport(app=test_app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/steps/get",
            json={"session_token": SESSION_TOKEN, "date": date.today().isoformat()},
        )

    assert response.status_code == 404
