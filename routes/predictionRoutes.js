const express = require("express");
const router = express.Router();

const { predictionFood } = require("../controllers/predictionController");

router.post("/predict", predictionFood);

module.exports = router;