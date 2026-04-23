from typing import Any
from fastapi import FastAPI
from sqlalchemy import text
from typing import AsyncGenerator
from xgboost.core import XGBoostError
from contextlib import asynccontextmanager
from db.connection import engine
from core.logging import logger
from ml_model.utils import load_model
import os


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[Any, Any]:
    try:
        model = load_model()
    except XGBoostError as e:
        logger.error("failed to load xgboost ml model", err=str(e))
        os._exit(1)

    # checking database is reachable before proceeding
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        logger.error("failed to connect to db", err=str(e))
        await engine.dispose()
        os._exit(1)

    app.state.ml_model = model
    logger.debug("lifespan loaded")

    yield

    logger.debug("shutting down")
    await engine.dispose()
