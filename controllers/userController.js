const User = require("../models/user");

const getUser = async (req, res) => {
    try {
        const users = await User.find().limit(20);

        res.status(200).json({
        success: true,
        message: "User ditemukan",
        data: users
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: "User gagal ditemukan",
        error: error.message
        });
  }
};

const getUserById = async (req, res) => {
    try {
        const dataUser = await User.findById(req.params.id);

        if (!dataUser) {
        return res.status(404).json({
            success: false,
            message: "User gagal ditemukan"
        })
        }

        res.status(200).json({
        success: true,
        message: "User berhasil ditemukan",
        data: dataUser
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: "User gagal ditemukan",
        error: error.message
        });
    }
};

const createUser = async (req, res) => {
    try {
        const newUser = await User.create(req.body);

        res.status(200).json({
        success: true,
        message: "User berhasil dibuat",
        data: newUser
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: "User gagal dibuat",
        error: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const update = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
        );

        if (!update) {
        return res.status(404).json({
            success: false,
            message: "User tidak ditemukan"
        });
        }

        res.status(200).json({
        success: true,
        message: "Data telah berhasil diupdate",
        data: update
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: "Data gagal diupdate",
        error: error.message
        });
    }
};

module.exports = {
    getUser,
    getUserById,
    createUser,
    updateUser
};