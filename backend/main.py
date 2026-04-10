from fastapi import FastAPI
from core.lifespan import lifespan
from core.settings import settings
from routes.auth import router as auth_router
import uvicorn

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def hello_world() -> None:
    return {"message": "hello worlddddd!"}

app.include_router(auth_router)

if __name__ == "__main__":
    print(f"starting fastapi on http:localhost:{settings.FASTAPI_PORT}")
    uvicorn.run(app, host="0.0.0.0", port=settings.FASTAPI_PORT)
