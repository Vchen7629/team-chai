from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine
from core.settings import settings

engine: AsyncEngine = create_async_engine(
    url=settings.database_url,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # health check connections before use
    pool_recycle=3600,  # recycle connections after 1 hour
)

async_session_factory = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def get_short_lived_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
