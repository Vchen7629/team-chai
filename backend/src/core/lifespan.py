from typing import Any
from fastapi import FastAPI
from sqlalchemy import text
from typing import AsyncGenerator
from contextlib import asynccontextmanager
from db.connection import engine
import os


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[Any, Any]:
    # checking database is reachable before proceeding
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        print(f"failed to connect to db with error: {str(e)}")
        await engine.dispose()
        os._exit(1)

    yield

    await engine.dispose()
