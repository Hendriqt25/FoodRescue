const express = require("express");
const router = express.Router();

const {
    loginUser,
    registerUser,
    getAllUsers,
} = require("../controllers/userController");

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/", getAllUsers);

module.exports = router;