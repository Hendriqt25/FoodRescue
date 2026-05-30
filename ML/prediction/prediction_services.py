import joblib
import numpy as np
import tensorflow as tf
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


class DistanceWeightLayer(tf.keras.layers.Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def call(self, inputs):
        distance = inputs[:, 0:1]
        weight = tf.exp(-distance / 5.0)
        return inputs * weight


model = tf.keras.models.load_model(
    BASE_DIR / "foodrescue_model.keras",
    custom_objects={
        "DistanceWeightLayer": DistanceWeightLayer
    }
)

scaler = joblib.load(BASE_DIR / "scaler.pkl")
features = joblib.load(BASE_DIR / "features.pkl")


def get_priority_label(score):
    if score >= 0.75:
        return "Tinggi"
    elif score >= 0.50:
        return "Sedang"
    return "Rendah"


def get_recommendation(score, distance):
    if score >= 0.75 and distance <= 5:
        return "Makanan sangat direkomendasikan untuk segera didistribusikan karena prioritas tinggi dan jarak penerima relatif dekat."
    elif score >= 0.75 and distance > 5:
        return "Makanan memiliki prioritas tinggi, tetapi sebaiknya dicari penerima yang lebih dekat agar distribusi lebih cepat."
    elif score >= 0.50:
        return "Makanan masih layak diproses untuk distribusi, namun perlu mempertimbangkan jarak, kondisi makanan, dan waktu kedaluwarsa."
    return "Makanan memiliki prioritas rendah, sehingga perlu dilakukan pengecekan ulang sebelum didistribusikan."


def predict_foodrescue(data):
    input_data = data.dict()

    input_vector = []

    for feature in features:
        input_vector.append(input_data.get(feature, 0))

    input_array = np.array([input_vector], dtype=float)

    scaled_input = scaler.transform(input_array)

    prediction = model.predict(scaled_input)

    score = float(prediction[0][0])

    distance = float(input_data.get("distance", 0))

    priority = get_priority_label(score)
    recommendation = get_recommendation(score, distance)

    return {
        "input": input_data,
        "features_used": features,
        "prediction_score": score,
        "priority": priority,
        "recommendation": recommendation
    }