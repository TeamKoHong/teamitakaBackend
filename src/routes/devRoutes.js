const express = require("express");
const router = express.Router();
const devController = require("../controllers/devController");

router.delete("/clear-verified-emails", devController.clearVerifiedEmails);

module.exports = router;
