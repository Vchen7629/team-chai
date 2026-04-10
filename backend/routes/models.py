from pydantic import BaseModel

class UserAuthRequest(BaseModel):
    username: str
    password: str

class UserLoginResponse(BaseModel):
    message: str
    session_token: str
