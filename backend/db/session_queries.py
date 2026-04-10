from datetime import timezone
from datetime import datetime
from datetime import timedelta
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

async def create_new_user_session(session: AsyncSession, username: str, session_token: str) -> None:
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
        {"username": username, "session_token": session_token, "expire_at": expire_one_hour}
    )