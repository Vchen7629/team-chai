from fastapi import Path
from fastapi import status
from fastapi import Depends
from fastapi import APIRouter
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core.logging import logger
from routes.models import UserFitnessData
from routes.steps import get_authenticated_user
from db.user_queries import fetch_fitness_data
from db.connection import get_short_lived_session

router = APIRouter(prefix="/user")


@router.get("/fitness/{session_token}")
async def fetch_user_fitness_data(
    session_token: str = Path(min_length=1),
    db_session: AsyncSession = Depends(get_short_lived_session),
) -> UserFitnessData:
    """
    fetch user fitness data like weight, age, etc. Used for sending data to
    the model for steps recommendations
    """
    username = await get_authenticated_user(db_session, session_token)

    try:
        return await fetch_fitness_data(db_session, username)
    except ValueError as e:
        logger.error("error fetching user fitness data", err=str(e))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error("unknown error fetching user fitness data", err=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error fetching db",
        )
