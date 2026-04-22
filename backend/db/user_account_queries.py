from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from routes.models import UserSignUpRequest
import bcrypt

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

async def create_new_user_account(session: AsyncSession, user_data: UserSignUpRequest) -> None:
    """Create a new user account with the username and hashed password (bcrypt) in db"""
    hash_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    user_login_query = """
        INSERT INTO user_login (username, hashed_password) 
        VALUES (:username, :hashed_password)
        ON CONFLICT (username) DO NOTHING
    """

    user_login_result = await session.execute(
        text(user_login_query),
        {"username": user_data.username, "hashed_password": hash_password}
    )
    if user_login_result.rowcount == 0:
        raise ValueError("Username already taken")

    user_profile_query = """
        INSERT INTO user_profile 
        (username, email, age, weight, heightin, gender, activitylevel, targetsteps)
        VALUES
        (:username, :email, :age, :weight, :heightin, :gender, :activitylevel, :targetsteps)
        ON CONFLICT (username) DO NOTHING
    """

    # con
    heightin_conversion = user_data.heightFT * 12 + user_data.heightIn
    
    await session.execute(
        text(user_profile_query),
        {
            "username": user_data.username,
            "email": user_data.email,
            "age": user_data.age,
            "weight": user_data.weight,
            "heightin": heightin_conversion,
            "gender": user_data.gender,
            "activitylevel": user_data.activityLevel,
            "targetsteps": user_data.targetsteps,
        }
    )
