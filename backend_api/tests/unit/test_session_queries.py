from datetime import datetime
from datetime import timezone
from datetime import timedelta
from unittest.mock import AsyncMock
from db.session_queries import insert_new_user_session
import pytest


@pytest.mark.asyncio
async def test_session_expire_time() -> None:
    """session expires one hour from now"""
    session = AsyncMock()
    before = datetime.now(timezone.utc)

    await insert_new_user_session(session, "testuser", "token-abc")

    after = datetime.now(timezone.utc)
    expire_at = session.execute.call_args[0][1]["expire_at"]

    assert before + timedelta(hours=1) <= expire_at <= after + timedelta(hours=1)
