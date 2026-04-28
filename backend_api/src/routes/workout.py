from typing import List
from datetime import datetime
from pydantic import Field
from pydantic import BaseModel
from fastapi import status
from fastapi import Depends
from fastapi import APIRouter
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core.logging import logger
from routes.models import UserWorkoutLog
from routes.auth import fetch_authenticated_user
from db.connection import get_short_lived_session
from db.workout_logs_queries import get_workout_log
from db.workout_logs_queries import insert_new_workout_log


router = APIRouter(prefix='/workout_log')

class AddNewWorkoutLogRequest(BaseModel):
    session_token: str = Field(min_length=4)
    timestamp: datetime = Field(min_length=1)
    note: str = Field(min_length=1)

@router.post(path="/add", status_code=status.HTTP_201_CREATED)
async def add_new_workout_log(
    request: AddNewWorkoutLogRequest,
    db_session: AsyncSession = Depends(get_short_lived_session)
) -> dict[str, str]:
    """Record a new workout log for the user"""
    username = await fetch_authenticated_user(db_session, request.session_token)

    try:
        await insert_new_workout_log(db_session, username, request.timestamp, request.note)
        return {"message": "successfully added new workout log"}
    except Exception as e:
        logger.error("error adding new workout log", err=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FetchWorkoutLogRequest(BaseModel):
    session_token: str = Field(min_length=4)
    date: datetime = Field(min_length=1)

@router.post(path="")
async def fetch_workout_log(
    request: FetchWorkoutLogRequest,
    db_session: AsyncSession = Depends(get_short_lived_session)
) -> List[UserWorkoutLog]:
    """Fetch a workout log for the username for the current date"""
    username = await fetch_authenticated_user(db_session, request.session_token)

    try:
        return await get_workout_log(db_session, username, request.date)
    except ValueError as e:
        logger.error("error fetching all workout logs", err=str(e))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error("unknown error fetching all workout logs", err=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)