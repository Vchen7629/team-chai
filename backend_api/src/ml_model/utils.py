from pathlib import Path
from xgboost import XGBRegressor
from core.logging import logger
from routes.models import UserFitnessData
import numpy as np


def load_model() -> XGBRegressor:
    """Load an trained regressor model via the model file and return it"""
    MODEL_FILE = Path(__file__).parent / "step_goal_model_xgboost.json"

    model = XGBRegressor()
    model.load_model(MODEL_FILE)
    logger.debug("loaded xgboost model")

    return model


def target_steps_recommendation(model: XGBRegressor, user_data: UserFitnessData) -> int:
    """Use the model on user fitness data and return a recommended daily step goal"""
    height_inches = user_data.heightFT * 12 + user_data.heightIn

    BMI_IMPERIAL_CONSTANT = 703.0
    bmi = (user_data.weight / height_inches**2) * BMI_IMPERIAL_CONSTANT

    GENDER_ENCODING = {"male": 0, "female": 1, "other": 2, "prefer_not_to_say": 3}
    gender = GENDER_ENCODING[user_data.gender.lower()]

    ACTIVITY_ENCODING = {
        "sedentary": 1,
        "light": 2,
        "moderate": 3,
        "active": 4,
        "very_active": 5,
    }
    activity_level = ACTIVITY_ENCODING[user_data.activityLevel.lower()]

    features = np.array(
        [
            [
                user_data.age,
                height_inches,
                user_data.weight,
                bmi,
                gender,
                activity_level,
                user_data.avg_steps_7_days,
                user_data.goal_hit_rate,
            ]
        ]
    )

    logger.debug("recommending target steps based on fitness data...")
    return int(model.predict(features)[0])
