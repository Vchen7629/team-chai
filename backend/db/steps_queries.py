from datetime import datetime
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

async def create_user_new_steps(session: AsyncSession, username: str, steps: int) -> None:
    """
    creates new steps for a user for a given date. used when the user first
    inputs their current steps
    """

    query = """
        INSERT INTO user_daily_steps (username, steps, curr_date) 
        VALUES (:username, :steps, CURRENT_DATE)
        ON CONFLICT (username, curr_date) DO UPDATE SET
            steps = EXCLUDED.steps;
    """

    await session.execute(
        text(query),
        {"username": username.strip(), "steps": steps}
    )

async def update_user_steps(session: AsyncSession, username: str, steps: int) -> None:
    """
    Add new steps for a user for a given date. Used for the background step
    tracker to increase daily steps
    """

    query = """
        INSERT INTO user_daily_steps (username, steps, curr_date)
        VALUES (:username, :steps, CURRENT_DATE)
        ON CONFLICT (username, curr_date) DO UPDATE SET
            steps = user_daily_steps.steps + EXCLUDED.steps;
    """

    await session.execute(
        text(query),
        {"username": username, "steps": steps}
    )

async def fetch_curr_date_steps(session: AsyncSession, username: str, date: datetime) -> int:
    """
    Fetch the current steps for the user for the current date, Used by the frontend to
    display the steps for the current day like in the calendar component
    """

    query = """
        SELECT steps FROM user_daily_steps
        WHERE username = :username
            AND date = CURRENT_DATE;
    """

    result = await session.execute(text(query), {"username": username, "date": date})

    row = result.fetchone()
    if not row:
        raise ValueError("No steps found for username")

    return row[0]