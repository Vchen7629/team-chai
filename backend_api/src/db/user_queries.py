from datetime import datetime
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from core.logging import logger
from routes.models import UserFitnessData

async def get_email(
    db_session: AsyncSession, username: str
) -> str:
    """Fetch email from db"""
    query = """
        SELECT email FROM user_profile 
        WHERE LOWER(username) = LOWER(:username)
    """

    result = await db_session.execute(text(query), {"username": username})

    row = result.fetchone()
    if not row:
        raise ValueError("No email found for username")

    logger.debug("fetched email from ser_profile db table")

    return row[0]

async def get_fitness_data(
    db_session: AsyncSession, username: str
) -> UserFitnessData:
    """Fetch fitness data from the db like weight, heightin, gender, etc"""
    query = """
        SELECT age, weight, heightin, gender, activitylevel AS "activityLevel", avg_steps_7_days, goal_hit_rate
        FROM user_profile
        WHERE LOWER(username) = LOWER(:username)
    """

    result = await db_session.execute(text(query), {"username": username})

    row = result.fetchone()
    if not row:
        raise ValueError("No fitness data found for the username")

    logger.debug("fetched fitness data from user_profile db table")

    return UserFitnessData.model_validate(dict(row._mapping))

async def update_user_fitness_metrics(
    db_session: AsyncSession, username: str, curr_date: datetime
) -> None:
    """Update the fitness metrics by recomputing the avg_steps and goal_hit_rate"""
    query = """
        WITH avg_steps AS (
            SELECT COALESCE(AVG(curr_steps), 0.0) AS avg_val
            FROM user_daily_steps
            WHERE LOWER(username) = LOWER(:username)
                AND DATE(curr_date) >= DATE(:curr_date) - INTERVAL '7 days'
                AND DATE(curr_date) <= DATE(:curr_date)
        ),
        hit_rate AS (
            SELECT COALESCE(
                SUM(CASE WHEN curr_steps >= target_steps THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(*), 0),
                0.0
            ) AS rate_val
            FROM user_daily_steps
            WHERE LOWER(username) = LOWER(:username)
        )
        UPDATE user_profile
        SET
            avg_steps_7_days = (SELECT avg_val FROM avg_steps),
            goal_hit_rate = (SELECT rate_val FROM hit_rate)
        WHERE LOWER(username) = LOWER(:username);
    """

    await db_session.execute(text(query), {"username": username, "curr_date": curr_date})

    logger.debug("updated avg_steps_7_days and goal_hit_rate in user_profile db table")