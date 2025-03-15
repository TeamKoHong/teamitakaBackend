const express = require("express");
const scheduleController = require("../controllers/scheduleController");
const router = express.Router();

router.use("/schedule", scheduleController);

module.exports = router;
