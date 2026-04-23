from datetime import date
from fastapi import status
from fastapi import Request
from fastapi import Depends
from fastapi import APIRouter
from fastapi import HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from core.logging import logger
from routes.models import UserFitnessData
from routes.auth import get_authenticated_user
from db.connection import get_short_lived_session
from db.steps_queries import update_user_steps
from db.steps_queries import create_user_new_steps
from db.steps_queries import fetch_curr_date_steps
from ml_model.utils import target_steps_recommendation


router = APIRouter(prefix="/steps")


class UserStepsRequest(BaseModel):
    session_token: str
    steps: int


@router.post(path="/new", status_code=status.HTTP_201_CREATED)
async def new_user_steps(
    request: UserStepsRequest,
    db_session: AsyncSession = Depends(get_short_lived_session),
) -> dict[str, str]:
    """create new steps record for the user for the current day in the database"""
    username = await get_authenticated_user(db_session, request.session_token)

    try:
        await create_user_new_steps(db_session, username, request.steps)

        return {"message": f"created {request.steps} steps successfully!"}
    except ValueError as e:
        logger.error("error creating new steps for user", err=str(e))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except IntegrityError as e:
        if "foreign key" in str(e.orig).lower():
            logger.error("user not found to create steps for")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        raise
    except Exception as e:
        logger.error("unknown error creating new steps for user", err=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error updating db",
        )


@router.post(path="/add", status_code=status.HTTP_200_OK)
async def add_user_steps(
    request: UserStepsRequest,
    db_session: AsyncSession = Depends(get_short_lived_session),
) -> dict[str, str]:
    """Add new steps to an existing user steps record for the current day in the database"""
    username = await get_authenticated_user(db_session, request.session_token)

    try:
        await update_user_steps(db_session, username, request.steps)

        return {"message": f"added {request.steps} steps successfully!"}
    except ValueError as e:
        logger.error("error updating user steps", err=str(e))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except IntegrityError as e:
        if "foreign key" in str(e.orig).lower():
            logger.error("user not found to create steps for")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        raise
    except Exception as e:
        logger.error("unknown error updating steps for user", err=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error updating db",
        )


class FetchUserStepsRequest(BaseModel):
    session_token: str
    date: date


@router.post(path="/get_user", status_code=status.HTTP_200_OK)
async def fetch_user_steps(
    request: FetchUserStepsRequest,
    db_session: AsyncSession = Depends(get_short_lived_session),
) -> int:
    """Fetch the number of steps for a user for the current date"""
    username = await get_authenticated_user(db_session, request.session_token)

    try:
        steps = await fetch_curr_date_steps(db_session, username, request.date)

        return steps
    except ValueError as e:
        logger.error("error fetching user curr steps", err=str(e))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error("unknown error fetching user curr steps", err=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error fetching db",
        )


@router.post(path="/get_recommended", status_code=status.HTTP_200_OK)
async def get_recommended_steps(request: Request, user_data: UserFitnessData) -> int:
    """Use the ml model with  user fitness data to recommend target steps"""
    try:
        model = request.app.state.ml_model

        return target_steps_recommendation(model, user_data)
    except Exception as e:
        logger.error("error running target steps inference", err=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
