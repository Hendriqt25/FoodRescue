const express = require("express");
const {
    getFoodSurplus,
    createFoodSurplus,
    updateFoodSurplus,
    deleteFoodSurplus
} = require("../controllers/foodSurplusController");

const router = express.Router();

router.get("/", getFoodSurplus);
router.post("/", createFoodSurplus);
router.put("/:id", updateFoodSurplus);
router.delete("/:id", deleteFoodSurplus);

module.exports = router;