const User = require("../models/user");

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email dan password wajib diisi",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email tidak ditemukan",
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Password salah",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login berhasil",
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                donor_id: user.donor_id,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Gagal login",
            error: error.message,
        });
    }
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, donor_id } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Nama, email, password, dan role wajib diisi",
            });
        }

        if (!["pendonor", "penerima", "admin", "superadmin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role tidak valid",
            });
        }

        if (role === "pendonor" && !donor_id) {
            return res.status(400).json({
                success: false,
                message: "Donor ID wajib diisi untuk pendonor",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email sudah terdaftar",
            });
        }

        const totalUsers = await User.countDocuments();

        const userId = `U${String(totalUsers + 1).padStart(3, "0")}`;

        const newUser = await User.create({
            user_id: userId,
            name,
            email,
            password,
            role,
            donor_id: role === "pendonor" ? donor_id : null,
        });

        return res.status(201).json({
            success: true,
            message: "Register berhasil",
            user: {
                user_id: newUser.user_id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                donor_id: newUser.donor_id,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Gagal register",
            error: error.message,
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        return res.status(200).json({
            success: true,
            total: users.length,
            data: users,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data user",
            error: error.message,
        });
    }
};

module.exports = {
    loginUser,
    registerUser,
    getAllUsers,
};