import joblib
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent

category_model = joblib.load(BASE_DIR / "category_model.pkl")
tfidf_vectorizer = joblib.load(BASE_DIR / "tfidf_vectorizer.pkl")


def chatbot_response(data):
    user_message = data.message

    text_vector = tfidf_vectorizer.transform([user_message])
    category = category_model.predict(text_vector)[0]

    return {
        "user_message": user_message,
        "category": category
    }