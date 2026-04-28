from datetime import datetime
from unittest.mock import AsyncMock, MagicMock
from db.steps_queries import update_user_steps
from db.steps_queries import get_curr_date_steps
from db.steps_queries import insert_user_new_steps
import pytest


@pytest.mark.asyncio
@pytest.mark.parametrize(argnames="step_count", argvalues=[-5, 0])
async def test_insert_user_new_steps_raises(step_count: int) -> None:
    with pytest.raises(ValueError):
        await insert_user_new_steps(AsyncMock(), "test", step_count)


@pytest.mark.asyncio
@pytest.mark.parametrize(argnames="step_count", argvalues=[-15, 0])
async def test_update_user_steps_raises(step_count: int) -> None:
    with pytest.raises(ValueError):
        await update_user_steps(AsyncMock(), "test", step_count)


@pytest.mark.asyncio
async def test_get_curr_date_steps_raises() -> None:
    """It should raise when no steps are found for the user"""
    mock_result = MagicMock()
    mock_result.fetchone.return_value = None
    session = AsyncMock()
    session.execute.return_value = mock_result

    with pytest.raises(ValueError, match="No steps found"):
        await get_curr_date_steps(session, "testuser", datetime.now())
