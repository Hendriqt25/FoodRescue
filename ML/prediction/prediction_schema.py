from pydantic import BaseModel


class PredictionInput(BaseModel):
    distance_km: float
    expiry_hours: float
    pickup_time_hours: float
    urgency_score: float
    quantity_kg: float
    food_density_per_km: float
    co2_per_kg: float
    methane_factor: float
    water_usage: float
    donor_type_encoded: int
    category_encoded: int