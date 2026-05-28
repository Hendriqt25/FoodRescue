const FoodSurplus = require("../models/foodSurplus");

const getFoodSurplus = async (req, res) => {
    try {
        const food = await FoodSurplus.find().limit(20);

        res.status(200).json({
        success: true,
        message: "Data makanan berhasil ditampilkan",
        data: food
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: "Data makanan gagal ditampilkan",
        error: error.message
        });
    }
    };

    const createFoodSurplus = async (req, res) => {
    try {
        const newFood = await FoodSurplus.create(req.body);

        res.status(201).json({
        success: true,
        message: "Data makanan berhasil ditambahkan",
        data: newFood
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: "Data makanan gagal ditambahkan",
        error: error.message
        });
    }
    };

    const updateFoodSurplus = async (req, res) => {
    try {
        const updateFood = await FoodSurplus.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
        );

        if (!updateFood) {
        return res.status(404).json({
            success: false,
            message: "Data makanan tidak ditemukan"
        });
        }

        res.status(200).json({
        success: true,
        message: "Data makanan berhasil diupdate",
        data: updateFood
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: "Data makanan gagal diupdate",
        error: error.message
        });
    }
    };

    const deleteFoodSurplus = async (req, res) => {
    try {
        const deleteFood = await FoodSurplus.findByIdAndDelete(req.params.id);

        if (!deleteFood) {
        return res.status(404).json({
            success: false,
            message: "Data makanan tidak ditemukan"
        });
        }

        res.status(200).json({
        success: true,
        message: "Data makanan berhasil dihapus",
        data: deleteFood
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: "Data makanan gagal dihapus",
        error: error.message
        });
    }
    };

    module.exports = {
    getFoodSurplus,
    createFoodSurplus,
    updateFoodSurplus,
    deleteFoodSurplus
};