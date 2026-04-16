from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from core.lifespan import lifespan
from core.settings import settings
from routes.auth import router as auth_router
import uvicorn

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def hello_world() -> None:
    return {"message": "hello worlddddd!"}

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0]
    field = first_error['loc'][-1]
    return JSONResponse(status_code=400, content={"detail": f"missing {field}"})

app.include_router(auth_router)

if __name__ == "__main__":
    print(f"starting fastapi on http:localhost:{settings.FASTAPI_PORT}")
    uvicorn.run(app, host="0.0.0.0", port=settings.FASTAPI_PORT)
