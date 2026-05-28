const mongoose = require("mongoose");

const foodSurplusSchema = new mongoose.Schema({
    donor_id: {
        type: String,
        required: true
    },

    donor_type: {
        type: String,
        required: true
    },

    food_type: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    quantity_kg: {
        type: Number,
        required: true
    },

    expiry_hours: {
        type: Number,
        required: true
    },

    lat: {
        type: Number,
        required: true
    },

    long: {
        type: Number,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    pickup_status: {
        type: String,
        required: true
    },

    receiver_id: {
        type: String
    },

    distance_km: {
        type: Number
    },

    pickup_time_hours: {
        type: Number
    },

    waste_risk: {
        type: String,
        required: true
    },

    co2_per_kg: {
        type: Number
    },

    methane_factor: {
        type: Number
    },

    water_usage: {
        type: Number
    },

    uncertainty_factor: {
        type: Number
    }
    }, {
    timestamps: true
    });
    
module.exports = mongoose.model("FoodSurplus", foodSurplusSchema, "food_surplus");
