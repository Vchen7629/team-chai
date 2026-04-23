import numpy as np
import polars as pl

FEATURES = [
    "age",
    "height_inches",
    "weight_lbs",
    "bmi",
    "gender",
    "activity_level",
    "avg_steps_last_7days",
    "goal_hit_rate",
]


def load_data() -> tuple[np.ndarray, np.ndarray]:
    """Load training data into np arrays for training"""
    DATASET_PATH = "dataset_output/data.csv"

    TARGET = "step_goal"

    # todo: handle missing dataset
    df = pl.read_csv(DATASET_PATH)

    X = df.select(FEATURES).to_numpy()
    Y = df.select(TARGET).to_numpy().ravel()

    return X, Y
