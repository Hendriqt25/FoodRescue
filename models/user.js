const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["donor", "penerima", "admin"],
        required: true
    },

    user_type: {
        type: String,
        enum: ["restoran", "hotel", "individu", "komunitas", "ngo", "admin"],
        required: true
    },

    phone: {
        type: String
    },

    city: {
        type: String
    },

    address: {
        type: String
    },

    is_verified: {
        type: Boolean,
        default: false
    }
    }, {
    timestamps: true
    });

module.exports = mongoose.model("User", userSchema, "users");