from pydantic import BaseModel
from fastapi import status
from fastapi import Depends
from fastapi import APIRouter
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from core.logging import logger
from routes.models import UserSignUpRequest
from db.session_queries import insert_new_user_session
from db.session_queries import get_username_with_session
from db.auth_queries import get_hashed_password
from db.auth_queries import insert_new_user_account
from db.connection import get_short_lived_session
import uuid
import bcrypt

router = APIRouter(prefix="/auth")


class UserLoginRequest(BaseModel):
    username: str
    password: str


class UserLoginResponse(BaseModel):
    message: str
    session_token: str


@router.post("/login", status_code=status.HTTP_200_OK)
async def user_login(
    request: UserLoginRequest, db: AsyncSession = Depends(get_short_lived_session)
) -> UserLoginResponse:
    """Login endpoint, checks if username and password are correct and returns a session token for user specific use"""
    try:
        hashed_password = await get_hashed_password(db, request.username)
    except ValueError:
        logger.error("No user account found for the username")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="user not found"
        )
    except Exception as e:
        logger.error("unknown error fetching hashed password", err=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    password_match = bcrypt.checkpw(
        request.password.encode("utf-8"), hashed_password.encode("utf-8")
    )
    if password_match is False:
        logger.warn("password does not match with hashed password from db")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="password does not match"
        )

    session_token = str(uuid.uuid4())

    try:
        await insert_new_user_session(db, request.username, session_token)

    except Exception as e:
        logger.error("unknown error creating new user session", err=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return UserLoginResponse(message="login successful!", session_token=session_token)


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def user_signup(
    request: UserSignUpRequest, db: AsyncSession = Depends(get_short_lived_session)
) -> dict[str, str]:
    """Signup endpoint, checks if the password for the username is correct and returns a success/error msg"""
    try:
        await insert_new_user_account(db, request)
    except ValueError as e:
        logger.error("error creating new user account", err=str(e))
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except IntegrityError:
        logger.error("account already exists in db")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="account already exists"
        )
    except Exception as e:
        logger.error("unknown error creating new user account", err=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return {"message": "successfully created new user!"}


async def fetch_authenticated_user(db_session: AsyncSession, session_token: str) -> str:
    """Shared private function with username fetching + error handling"""
    try:
        return await get_username_with_session(db_session, session_token)
    except ValueError as e:
        logger.error("Session doesnt exist or expired", err=str(e))
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        logger.error("unknown error fetching username with session", err=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="server error"
        )
