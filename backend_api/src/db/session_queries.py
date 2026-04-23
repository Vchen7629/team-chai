from datetime import timezone
from datetime import datetime
from datetime import timedelta
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from core.logging import logger


async def create_new_user_session(
    session: AsyncSession, username: str, session_token: str
) -> None:
    """
    Create a new session for the user's via username with an expiry of 1 hour, if the session already
    exists then it will just update the user's session with the new session_token and a new expiry
    """

    query = """
        INSERT INTO user_sessions (username, session_token, expire_at)
        VALUES (:username, :session_token, :expire_at)
        ON CONFLICT (username) DO UPDATE SET
            session_token = EXCLUDED.session_token,
            expire_at = EXCLUDED.expire_at
    """
    expire_one_hour = datetime.now(timezone.utc) + timedelta(hours=1)

    await session.execute(
        text(query),
        {
            "username": username,
            "session_token": session_token,
            "expire_at": expire_one_hour,
        },
    )

    logger.debug("created new session in user_sessions table")


async def fetch_username_with_session(
    db_session: AsyncSession, session_token: str
) -> str:
    """Use the session token to fetch username for subsequent queries"""
    query = """
        SELECT username FROM user_sessions 
        WHERE session_token = :session_token
            AND expire_at >= NOW()
    """

    result = await db_session.execute(text(query), {"session_token": session_token})

    row = result.fetchone()
    if not row:
        raise ValueError("Session doesnt exist or expired")

    logger.debug("fetched username with session token from user_sessions db table")
    return row[0]
