from validation.model import print_feature_importance
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from validation.model import evaluate
from training.helpers import load_data
import os


def train() -> None:
    """xgboost training loop"""
    TEST_SIZE = 0.2
    RANDOM_STATE = 42

    X, Y = load_data()

    X_train, X_test, Y_train, Y_test = train_test_split(
        X, Y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    model = XGBRegressor(random_state=RANDOM_STATE)
    model.fit(X_train, Y_train)

    evaluate(model, X_test, Y_test)
    print_feature_importance(model)

    _save_model(model)


def _save_model(model: XGBRegressor) -> None:
    """Save the trained model to the model_output folder as a json file"""
    MODEL_PATH = "model_output/step_goal_model_xgboost.json"

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    model.save_model(MODEL_PATH)
    print(f"\nModel saved to {MODEL_PATH}")


if __name__ == "__main__":
    train()
