from enum import IntEnum
from dataclasses import dataclass
import numpy as np

class Gender(IntEnum):
    MALE = 0
    FEMALE = 1
    OTHER = 2
    PREFER_NOT_TO_SAY = 3

class ActivityLevel(IntEnum):
    SEDENTARY = 1
    LIGHT = 2
    MODERATE = 3
    ACTIVE = 4
    VERY_ACTIVE = 5

# dataclass for constants or smth idk

# our app only allows signup between 13 and 70 age
@dataclass(frozen=True)
class _AgeRange:
    min: int = 13
    max: int = 70

# https://www.niddk.nih.gov/health-information/health-statistics/overweight-obesity
@dataclass(frozen=True)
class _BmiConfig:
    mean: float = 27.5 
    sedentary_mean: float = 30.0 # shifted slightly higher for sedentary lifestyle
    std: float = 5.0
    min: float = 15.0
    max: float = 42.0
    imperial_constant: float = 703.0 # divider value for weight derived from BMI and height

# https://www.cdc.gov/nchs/fastats/body-measurements.htm
@dataclass(frozen=True)
class _HeightInches:
    male_mean: float = 68.9
    male_std: float = 3.0
    female_mean: float = 63.5
    female_std: float = 2.5
    other_mean: float = 66.2 # average of male mean and female mean
    other_std: float = 2.8
    min: float = 54.0 # 4'6'' can adjust this
    max: float = 84.0 # 7'0'' realistically whos taller than this

AGE = _AgeRange()
BMI = _BmiConfig()
HEIGHT = _HeightInches()

rng = np.random.default_rng(seed=42)

def sample_demographics(num_users: int) -> dict[str, np.ndarray]: 
    """
    Generates synthetic demographic features for n users. Samples age, 
    gender, height, BMI, weight, and activity level from distributions

    Args:
        num_users: number of users to generate

    Returns:
        dict of feature arrays, each of length n
    """
    gender = rng.choice(
        [Gender.MALE, Gender.FEMALE, Gender.OTHER, Gender.PREFER_NOT_TO_SAY], 
        size=num_users, p=[0.49, 0.49, 0.01, 0.01]
    )

    height = np.where(
        gender == Gender.MALE, rng.normal(HEIGHT.male_mean, HEIGHT.male_std, num_users),
        np.where(gender == Gender.FEMALE, rng.normal(HEIGHT.female_mean, HEIGHT.female_std, num_users),
                 rng.normal(HEIGHT.other_mean, HEIGHT.other_std, num_users))
    ).clip(HEIGHT.min, HEIGHT.max)

    activity = rng.choice(
        [ActivityLevel.SEDENTARY, ActivityLevel.LIGHT, ActivityLevel.MODERATE, ActivityLevel.ACTIVE, ActivityLevel.VERY_ACTIVE], 
        size=num_users, p=[0.35, 0.30, 0.20, 0.10, 0.05]
    )

    bmi_mean = np.where(activity == ActivityLevel.SEDENTARY, BMI.sedentary_mean, BMI.mean)
    bmi = rng.normal(bmi_mean, BMI.std, num_users).clip(BMI.min, BMI.max)

    weight = (bmi * height ** 2) / BMI.imperial_constant

    age = rng.integers(AGE.min, AGE.max + 1, size=num_users)

    return {
        "age": age,
        "height_inches": height.round(1),
        "weight_lbs": weight.round(1),
        "bmi": bmi.round(1),
        "gender": gender,
        "activity_level": activity
    }