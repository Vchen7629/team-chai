from sklearn.model_selection import train_test_split
from sklearn.linear_model._base import LinearRegression
from training.helpers import load_data
from validation.model import evaluate
import os
import joblib


def train() -> None:
    """linear regression model training loop"""
    TEST_SIZE = 0.2
    RANDOM_STATE = 42

    X, Y = load_data()

    X_train, X_test, Y_train, Y_test = train_test_split(
        X, Y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    model = LinearRegression()
    model.fit(X_train, Y_train)

    evaluate(model, X_test, Y_test)

    _save_model(model)


def _save_model(model: LinearRegression) -> None:
    """Save the trained model to the model_output folder as a json file"""
    MODEL_PATH = "model_output/step_goal_model_lin_regression.json"

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"\nModel saved to {MODEL_PATH}")


if __name__ == "__main__":
    train()
