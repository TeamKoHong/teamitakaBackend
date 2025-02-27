const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Review routes working" });
});

module.exports = router;
