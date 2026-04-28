from datetime import datetime
from datetime import date
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from core.logging import logger


async def insert_user_new_step_goal(session: AsyncSession, username: str, target_steps: int) -> None:
    """
    creates new step goal for a user for a given date. used when the user signs up
    """
    if target_steps <= 0:
        raise ValueError("target steps must be positive")

    query = """
        INSERT INTO user_daily_steps (username, target_steps, curr_date) 
        VALUES (:username, :target_steps, CURRENT_DATE)
        ON CONFLICT (username, curr_date) DO UPDATE SET
            target_steps = EXCLUDED.target_steps;
    """

    await session.execute(text(query), {"username": username.strip(), "target_steps": target_steps})

    logger.debug("created new target steps record for the user in user_daily_steps db table")

async def get_steps_goal_count(
    session: AsyncSession, username: str, date: date
) -> int:
    """
    Fetch the step goal for the user for the current date, Used by the frontend to
    display the steps for the current day in user feed screen
    """

    query = """
        SELECT target_steps FROM user_daily_steps
        WHERE LOWER(username) = LOWER(:username)
            AND curr_date = :date;
    """

    result = await session.execute(
        text(query), {"username": username.strip(), "date": date}
    )

    row = result.fetchone()
    if not row:
        raise ValueError("No step goal found for username")

    logger.debug(
        "fetched target_steps for the user for the curr date from user_daily_steps db table"
    )
    return row[0]

async def update_user_curr_steps(session: AsyncSession, username: str, curr_steps: int, date: datetime) -> None:
    """
    Add new curr_steps for a user for a given date. Used for the background step
    tracker to increase daily steps
    """
    if curr_steps <= 0:
        raise ValueError("steps must be positive")

    query = """
        INSERT INTO user_daily_steps (username, curr_steps, curr_date)
        VALUES (:username, :curr_steps, :date)
        ON CONFLICT (username, curr_date) DO UPDATE SET
            curr_steps = user_daily_steps.curr_steps + EXCLUDED.curr_steps;
    """

    await session.execute(text(query), {"username": username, "curr_steps": curr_steps, "date": date})

    logger.debug("updated curr_steps record for the user in user_daily_steps db table")

async def get_curr_steps_count(
    session: AsyncSession, username: str, date: date
) -> int:
    """
    Fetch the current steps for the user for the current date, Used by the frontend to
    display the steps in user feed screen
    """

    query = """
        SELECT curr_steps FROM user_daily_steps
        WHERE LOWER(username) = LOWER(:username)
            AND curr_date = :date;
    """

    result = await session.execute(
        text(query), {"username": username.strip(), "date": date}
    )

    row = result.fetchone()
    if not row:
        raise ValueError("No step goal found for username")

    logger.debug(
        "fetched target_steps for the user for the curr date from user_daily_steps db table"
    )
    return row[0]
