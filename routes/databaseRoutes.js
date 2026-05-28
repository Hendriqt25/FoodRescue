const express = require("express");
const { checkDatabase } = require("../controllers/databaseController");

const router = express.Router();

router.get("/check-database", checkDatabase);

module.exports = router;