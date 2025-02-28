const express = require("express");
const router = express.Router();
const ProfileController = require("../controllers/profileController");

router.get("/:user_id", ProfileController.getUserProfile);
router.get("/:user_id/ratings", ProfileController.getUserRatings);
router.get("/:user_id/projects", ProfileController.getUserProjects);

module.exports = router;
