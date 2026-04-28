from datetime import date
from datetime import datetime
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
from routes.auth import fetch_authenticated_user
from db.connection import get_short_lived_session
from db.steps_queries import update_user_curr_steps
from db.steps_queries import insert_user_new_step_goal
from db.steps_queries import get_curr_steps_count
from db.steps_queries import get_steps_goal_count
from ml_model.utils import target_steps_recommendation


router = APIRouter(prefix="/steps")

@router.post(path="/new_target_steps")
async def new_target_steps_recommendation(
    request: UserFitnessData,
    app_request: Request,
) -> int:
    """Generates new target step recommendations using the ML model"""
    try:
        model = app_request.app.state.ml_model

        return target_steps_recommendation(model, request)
    except Exception as e:
        logger.error("error running target steps inference", err=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class NewStepGoalRequest(BaseModel):
    username: str
    steps: int
    curr_date: datetime

@router.post(path="/add/step_goal", status_code=status.HTTP_201_CREATED)
async def add_new_step_goal(
    request: NewStepGoalRequest,
    db_session: AsyncSession = Depends(get_short_lived_session),
) -> dict[str, str]:
    """create new steps record for the user for the current day in the database"""
    try:
        await insert_user_new_step_goal(db_session, request.username, request.steps, request.curr_date)

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


class UpdateUserStepsRequest(BaseModel):
    session_token: str
    curr_date: datetime
    steps: int


@router.post(path="/update", status_code=status.HTTP_200_OK)
async def update_curr_steps(
    request: UpdateUserStepsRequest,
    db_session: AsyncSession = Depends(get_short_lived_session),
) -> dict[str, str]:
    """Add new steps to an existing user steps record for the current day in the database"""
    username = await fetch_authenticated_user(db_session, request.session_token)

    try:
        await update_user_curr_steps(db_session, username, request.steps, request.curr_date)

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


@router.post(path="/get_goal", status_code=status.HTTP_200_OK)
async def fetch_user_step_goal(
    request: FetchUserStepsRequest,
    db_session: AsyncSession = Depends(get_short_lived_session),
) -> int:
    """Fetch the step goal for a user for the current date"""
    username = await fetch_authenticated_user(db_session, request.session_token)

    try:
        steps = await get_steps_goal_count(db_session, username, request.date)

        return steps
    except ValueError as e:
        logger.error("error fetching user step goal", err=str(e))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error("unknown error fetching user step goal", err=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error fetching db",
        )

@router.post(path="/get_curr_steps", status_code=status.HTTP_200_OK)
async def fetch_user_curr_steps(
    request: FetchUserStepsRequest,
    db_session: AsyncSession = Depends(get_short_lived_session),
) -> int:
    """Fetch the number of steps for a user for the current date"""
    username = await fetch_authenticated_user(db_session, request.session_token)

    try:
        steps = await get_curr_steps_count(db_session, username, request.date)

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