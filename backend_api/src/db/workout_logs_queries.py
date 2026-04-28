from routes.models import UserWorkoutLog
from typing import List
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from core.logging import logger

async def insert_new_workout_log(
    db_session: AsyncSession, username: str, logged_at: datetime, note: str
) -> None:
    """Add the new workout note for the user into the db"""
    query = """
        INSERT INTO user_workout_logs (username, logged_at, note)
        VALUES (:username, :logged_at, :note)
        ON CONFLICT (username, logged_at) DO UPDATE SET
            note = EXCLUDED.note
    """

    await db_session.execute(
        text(query),
        {"username": username, "logged_at": logged_at, "note": note}
    )

    logger.debug("created new workout log for user", username=username, logged_at=logged_at)

async def get_workout_log(
    db_session: AsyncSession, username: str, logged_at: datetime
) -> List[UserWorkoutLog]:
    """Fetch all workout logs for the current date for the user"""
    query = """
        SELECT logged_at, note FROM user_workout_logs
        WHERE LOWER(username) = LOWER(:username)
            AND DATE(logged_at) = DATE(:logged_at)
    """

    result = await db_session.execute(text(query), {"username": username, "logged_at": logged_at})

    rows = result.fetchall()
    if not rows:
        raise ValueError("No workout logs found for the username at the date")

    logger.debug("fetched workout logs from user_workout_logs db table")

    return [UserWorkoutLog.model_validate(dict(row._mapping)) for row in rows]