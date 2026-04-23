# shared pydantic type model classes
from typing import Literal
from pydantic import Field
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


class UserFitnessData(BaseModel):
    age: int = Field(ge=13, le=70)
    weight: int = Field(gt=0)
    heightFT: int = Field(ge=4, le=7)
    heightIn: int = Field(gt=0, le=12)
    gender: Literal["male", "female", "other", "prefer_not_to_say"]
    activityLevel: Literal["sedentary", "light", "moderate", "active", "very_active"]
    avg_steps_7_days: float = Field(ge=0)
    goal_hit_rate: float = Field(ge=0, le=1)
