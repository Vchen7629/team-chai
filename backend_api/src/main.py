from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from core.logging import logger
from core.lifespan import lifespan
from core.settings import settings
from routes.auth import router as auth_router
from routes.steps import router as steps_router
from routes.user import router as user_router
import uvicorn

app = FastAPI(lifespan=lifespan)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    first_error = exc.errors()[0]
    field = first_error["loc"][-1]
    error_type = first_error["type"]

    if error_type == "missing":
        message = f"missing {field}"
    else:
        message = f"invalid value for {field}: {first_error['msg']}"

    return JSONResponse(status_code=400, content={"detail": message})


app.include_router(auth_router)
app.include_router(steps_router)
app.include_router(user_router)

if __name__ == "__main__":
    logger.info("starting fastapi api", url=f"http:localhost:{settings.FASTAPI_PORT}")
    uvicorn.run(app, host="0.0.0.0", port=settings.FASTAPI_PORT)
