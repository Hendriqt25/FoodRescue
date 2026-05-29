class PredictionModel {
    constructor(data) {
        this.distance_km = data.distance_km;
        this.expiry_hours = data.expiry_hours;
        this.pickup_time_hours = data.pickup_time_hours;
        this.urgency_score = data.urgency_score;
        this.quantity_kg = data.quantity_kg;
        this.food_density_per_km = data.food_density_per_km;
        this.co2_per_kg = data.co2_per_kg;
        this.methane_factor = data.methane_factor;
        this.water_usage = data.water_usage;
        this.donor_type_encoded = data.donor_type_encoded;
        this.category_encoded = data.category_encoded;
    }

    validate() {
        const requiredFields = [
            "distance_km",
            "expiry_hours",
            "pickup_time_hours",
            "urgency_score",
            "quantity_kg",
            "food_density_per_km",
            "co2_per_kg",
            "methane_factor",
            "water_usage",
            "donor_type_encoded",
            "category_encoded",
        ];

        for (const field of requiredFields) {
        if (
            this[field] === undefined ||
            this[field] === null ||
            this[field] === ""
        ) {
            return {
                isValid: false,
                message: `${field} harap wajib diisi`,
            };
        }
        }

        return {
            isValid: true,
            message: "Data valid",
        };
    }

    toPayload() {
        return {
        distance_km: Number(this.distance_km),
        expiry_hours: Number(this.expiry_hours),
        pickup_time_hours: Number(this.pickup_time_hours),
        urgency_score: Number(this.urgency_score),
        quantity_kg: Number(this.quantity_kg),
        food_density_per_km: Number(this.food_density_per_km),
        co2_per_kg: Number(this.co2_per_kg),
        methane_factor: Number(this.methane_factor),
        water_usage: Number(this.water_usage),
        donor_type_encoded: Number(this.donor_type_encoded),
        category_encoded: Number(this.category_encoded),
        };
    }
}

module.exports = PredictionModel;