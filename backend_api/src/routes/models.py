# shared pydantic type model classes
from datetime import datetime
from typing import Literal
from pydantic import Field
from pydantic import BaseModel


class UserSignUpRequest(BaseModel):
    username: str = Field(min_length=1)
    email: str = Field(min_length=4)
    password: str = Field(min_length=1)
    age: int = Field(ge=13, le=70)
    weight: int = Field(gt=0)
    heightFT: int = Field(ge=4, le=7)
    heightIn: int = Field(gt=0, le=12)
    gender: Literal["male", "female", "other", "prefer_not_to_say"]
    activityLevel: Literal["sedentary", "light", "moderate", "active", "very_active"]


class UserFitnessData(BaseModel):
    age: int = Field(ge=13, le=70)
    weight: int = Field(gt=0)
    heightin: int = Field(gt=54, le=84)
    gender: Literal["male", "female", "other", "prefer_not_to_say"]
    activityLevel: Literal["sedentary", "light", "moderate", "active", "very_active"]
    avg_steps_7_days: float = Field(ge=0)
    goal_hit_rate: float = Field(ge=0, le=1)

class UserWorkoutLog(BaseModel):
    id: int
    logged_at: datetime
    note: str = Field(min_length=1)