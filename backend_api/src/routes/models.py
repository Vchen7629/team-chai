# shared pydantic type model classes
from pydantic import BaseModel


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
