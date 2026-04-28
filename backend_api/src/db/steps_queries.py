from datetime import datetime
from datetime import date
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from core.logging import logger


async def insert_user_new_steps(session: AsyncSession, username: str, steps: int) -> None:
    """
    creates new steps for a user for a given date. used when the user signs up
    """
    if steps <= 0:
        raise ValueError("steps must be positive")

    query = """
        INSERT INTO user_daily_steps (username, steps, curr_date) 
        VALUES (:username, :steps, CURRENT_DATE)
        ON CONFLICT (username, curr_date) DO UPDATE SET
            steps = EXCLUDED.steps;
    """

    await session.execute(text(query), {"username": username.strip(), "steps": steps})

    logger.debug("created new steps record for the user in user_daily_steps db table")


async def update_user_steps(session: AsyncSession, username: str, steps: int, date: datetime) -> None:
    """
    Add new steps for a user for a given date. Used for the background step
    tracker to increase daily steps
    """
    if steps <= 0:
        raise ValueError("steps must be positive")

    query = """
        INSERT INTO user_daily_steps (username, steps, curr_date)
        VALUES (:username, :steps, CURRENT_DATE)
        ON CONFLICT (username, curr_date) DO UPDATE SET
            steps = user_daily_steps.steps + EXCLUDED.steps;
    """

    await session.execute(text(query), {"username": username, "steps": steps})

    logger.debug("updated steps record for the user in user_daily_steps db table")


async def get_curr_date_steps(
    session: AsyncSession, username: str, date: date
) -> int:
    """
    Fetch the current steps for the user for the current date, Used by the frontend to
    display the steps for the current day like in the calendar component
    """

    query = """
        SELECT steps FROM user_daily_steps
        WHERE LOWER(username) = LOWER(:username)
            AND curr_date = :date;
    """

    result = await session.execute(
        text(query), {"username": username.strip(), "date": date}
    )

    row = result.fetchone()
    if not row:
        raise ValueError("No steps found for username")

    logger.debug(
        "fetched steps for the user for the curr date from user_daily_steps db table"
    )
    return row[0]
