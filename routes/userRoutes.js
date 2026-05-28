const express = require("express");
const {
    getUser,
    getUserById,
    createUser,
    updateUser
} = require("../controllers/userController");

const router = express.Router();

router.get("/", getUser);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);

module.exports = router;