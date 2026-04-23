from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Api settings/configs live here"""
    LOG_LEVEL: str = "DEBUG"
    LOG_FORMAT: str = "json"
    FASTAPI_PORT: int = 8001

    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "team-chai"
    DB_USER: str = "postgres"
    DB_PASS: str = "password"

    @property
    def database_url(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


settings = Settings()
