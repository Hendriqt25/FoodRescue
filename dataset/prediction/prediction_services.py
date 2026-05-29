import tensorflow as tf
import joblib
import pickle
import numpy as np
from pathlib import Path


class DistanceWeightLayer(tf.keras.layers.Layer):
    def __init__(self, **kwargs):
        super(DistanceWeightLayer, self).__init__(**kwargs)

    def call(self, inputs):
        return inputs


BASE_DIR = Path(__file__).resolve().parent

model = tf.keras.models.load_model(
    BASE_DIR / "foodrescue_model.keras",
    custom_objects={"DistanceWeightLayer": DistanceWeightLayer},
    compile=False
)

scaler = joblib.load(BASE_DIR / "scaler.pkl")

with open(BASE_DIR / "features.pkl", "rb") as f:
    features = pickle.load(f)


def predict_foodrescue(data):
    input_dict = data.dict()

    input_values = [[input_dict[feature] for feature in features]]
    input_array = np.array(input_values)

    scaled_input = scaler.transform(input_array)
    prediction = model.predict(scaled_input)

    return {
        "features_used": features,
        "prediction": prediction.tolist()
    }