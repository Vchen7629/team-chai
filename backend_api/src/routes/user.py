from pydantic import Field
from datetime import datetime
from fastapi import Path
from fastapi import status
from fastapi import Depends
from fastapi import APIRouter
from fastapi import HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from core.logging import logger
from routes.models import UserFitnessData
from routes.steps import fetch_authenticated_user
from db.user_queries import get_email
from db.user_queries import get_fitness_data
from db.user_queries import update_user_fitness_metrics
from db.connection import get_short_lived_session

router = APIRouter(prefix="/user")

class UserAccountDetailsResponse(BaseModel):
    username: str
    email: str

@router.get("/account_details/{session_token}")
async def fetch_user_account_details(
    session_token: str = Path(min_length=1),
    db_session: AsyncSession = Depends(get_short_lived_session)
) -> UserAccountDetailsResponse:
    """Fetch the username and email for display on the signup page"""
    username = await fetch_authenticated_user(db_session, session_token)

    try:
        email = await get_email(db_session, username)

        return UserAccountDetailsResponse(
            username=username,
            email=email
        )
    except ValueError as e:
        logger.error("error fetching user account details", err=str(e))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error("unknown error fetching user account details", err=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error fetching db",
        )

@router.get("/fitness/{session_token}")
async def fetch_user_fitness_data(
    session_token: str = Path(min_length=1),
    db_session: AsyncSession = Depends(get_short_lived_session),
) -> UserFitnessData:
    """
    fetch user fitness data like weight, age, etc. Used for sending data to
    the model for steps recommendations
    """
    username = await fetch_authenticated_user(db_session, session_token)

    try:
        return await get_fitness_data(db_session, username)
    except ValueError as e:
        logger.error("error fetching user fitness data", err=str(e))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error("unknown error fetching user fitness data", err=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error fetching db",
        )

class UpdateFitnessMetricsRequest(BaseModel):
    session_token: str = Field(min_length=1)
    curr_date: datetime

@router.patch(path="/fitness/update")
async def update_fitness_metrics(
    request: UpdateFitnessMetricsRequest,
    db_session: AsyncSession = Depends(get_short_lived_session),
) -> None:
    """
    Updates the avg_steps_7_days and goal_hit_rate metrics 
    required for the ml model to recommend new step goals
    """
    username = await fetch_authenticated_user(db_session, request.session_token)

    try:
        await update_user_fitness_metrics(db_session, username, request.curr_date)
    except Exception as e:
        logger.error("unknown error updating fitness metrics", err=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
