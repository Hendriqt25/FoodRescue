from fastapi import FastAPI

from prediction.prediction_schema import PredictionInput
from prediction.prediction_services import predict_foodrescue

from chatbot.chatbot_schema import ChatbotInput
from chatbot.chatbot_services import chatbot_response

app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "FoodRescue AI Service berjalan"
    }


@app.post("/predict")
def predict(data: PredictionInput):
    result = predict_foodrescue(data)

    return {
        "success": True,
        "message": "Prediksi berhasil",
        "result": result
    }


@app.post("/chatbot")
def chatbot(data: ChatbotInput):
    result = chatbot_response(data)

    return {
        "success": True,
        "message": "Chatbot berhasil merespons",
        "result": result
    }