const FoodSurplus = require("../models/foodSurplus");

const checkDatabase = async (req, res) => {
    try {
        const totalData = await FoodSurplus.countDocuments();

        res.status(200).json({
        success: true,
        message: "Database berhasil terhubung",
        database: "foodrescue_db",
        collection: "food_surplus",
        total_data: totalData
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: "Database gagal terhubung",
        error: error.message
        });
    }
    };

    module.exports = {
    checkDatabase
};