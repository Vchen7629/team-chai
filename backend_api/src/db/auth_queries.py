from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from routes.models import UserSignUpRequest
from core.logging import logger
import bcrypt


async def get_hashed_password(session: AsyncSession, username: str) -> str:
    """Fetch hashed password for the user account via username"""
    query = """
        SELECT hashed_password 
        FROM user_login 
        WHERE LOWER(username) = LOWER(:username)"""

    result = await session.execute(text(query), {"username": username.strip()})

    row = result.fetchone()
    if not row:
        raise ValueError("No user account found for the username")

    logger.debug("fetched hashed password for user from user_login db table")
    return row[0]


async def insert_new_user_account(
    session: AsyncSession, user_data: UserSignUpRequest
) -> None:
    """Create a new user account with the username and hashed password (bcrypt) in db"""
    hash_password = bcrypt.hashpw(
        user_data.password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    user_login_query = """
        INSERT INTO user_login (username, hashed_password)
        VALUES (:username, :hashed_password)
        ON CONFLICT (username) DO NOTHING
        RETURNING username
    """

    user_login_result = await session.execute(
        text(user_login_query),
        {"username": user_data.username, "hashed_password": hash_password},
    )
    if user_login_result.fetchone() is None:
        raise ValueError("Username already taken")
    logger.debug("created new user account in user_login db table")

    user_profile_query = """
        INSERT INTO user_profile 
        (username, email, age, weight, heightin, gender, activitylevel)
        VALUES
        (:username, :email, :age, :weight, :heightin, :gender, :activitylevel)
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
        },
    )

    logger.debug("created new user in user_profile db table")
