from pydantic import Field
from pydantic import BaseModel

class UserLoginRequest(BaseModel):
    username: str
    password: str
    
class UserSignUpRequest(BaseModel):
    username: str
    email: str
    password: str
    age: int
    weight: int
    heightFT: int
    heightIn: int
    gender: str
    activityLevel: str
    targetsteps: int

class UserLoginResponse(BaseModel):
    message: str
    session_token: str
