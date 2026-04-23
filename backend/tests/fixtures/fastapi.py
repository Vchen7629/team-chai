from typing import Any
from typing import AsyncGenerator
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession
from routes.auth import router as auth_router
from routes.steps import router as step_router
from db.connection import get_short_lived_session
import pytest_asyncio


@pytest_asyncio.fixture
async def test_app(db_session: AsyncSession) -> FastAPI:
    test_app = FastAPI()
    test_app.include_router(auth_router)
    test_app.include_router(step_router)

    async def override_session() -> AsyncGenerator[Any, Any]:
        try:
            yield db_session
            await db_session.commit()
        except Exception:
            await db_session.rollback()
            raise

    test_app.dependency_overrides[get_short_lived_session] = override_session
    return test_app
