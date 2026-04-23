from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from core.logging import logger
from routes.models import UserFitnessData


async def fetch_fitness_data(
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
