from db.steps_queries import fetch_curr_date_steps
from datetime import datetime
from fastapi import status
from fastapi import Depends
from fastapi import APIRouter
from fastapi import HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from db.connection import get_short_lived_session
from db.steps_queries import update_user_steps
from db.steps_queries import create_user_new_steps


router = APIRouter(prefix="/steps")

class UserStepsRequest(BaseModel):
    username: str
    steps: int

@router.post(path="/new", status_code=status.HTTP_201_CREATED)
async def new_user_steps(
    request: UserStepsRequest, session: AsyncSession = Depends(get_short_lived_session)
) -> dict[str, str]:
    """create new steps record for the user for the current day in the database"""
    try:
        await create_user_new_steps(session, request.username, request.steps)

        return {"message": f"created {request.steps} steps for {request.username} successfully!"}
    except IntegrityError as e:
        if "foreign key" in str(e.orig).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Server error updating db")

@router.post(path="/add", status_code=status.HTTP_200_OK)
async def add_user_steps(
    request: UserStepsRequest, session: AsyncSession = Depends(get_short_lived_session)
) -> dict[str, str]:
    """Add new steps to an existing user steps record for the current day in the database"""
    try:
        await update_user_steps(session, request.username, request.steps)

        return {"message": f"added {request.steps} steps for {request.username} successfully!"}
    except IntegrityError as e:
        if "foreign key" in str(e.orig).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Server error updating db")

class FetchUserStepsRequest(BaseModel):
    username: str
    date: datetime

@router.get(path="/get", status_code=status.HTTP_200_OK)
async def fetch_user_steps(
    request: FetchUserStepsRequest, session: AsyncSession = Depends(get_short_lived_session)
) -> int:
    """Fetch the number of steps for a user for the current date"""
    try:
        steps = await fetch_curr_date_steps(session, request.username, request.date)

        return steps
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Server error fetching db")