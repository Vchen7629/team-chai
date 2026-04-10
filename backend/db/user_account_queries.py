from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

async def fetch_hashed_password(session: AsyncSession, username: str) -> str:
    """Fetch hashed password for the user account via username"""
    query = """
        SELECT hashed_password 
        FROM user_login 
        WHERE LOWER(username) = LOWER(:username)"""
        
    result = await session.execute(text(query), {"username": username.strip()})

    row = result.fetchone()
    if not row:
        raise ValueError("No user account found for the username")

    return row[0]

async def create_new_user_account(session: AsyncSession, username: str, hashed_password: str) -> None:
    """Create a new user account with the username and hashed password (bcrypt) in db"""
    query = """
    INSERT INTO user_login (username, hashed_password) 
    VALUES (:username, :hashed_password)
    ON CONFLICT (username) DO NOTHING
    """

    result = await session.execute(text(query), {"username": username, "hashed_password": hashed_password})
    if result.rowcount == 0:
        raise ValueError("Username already taken")
