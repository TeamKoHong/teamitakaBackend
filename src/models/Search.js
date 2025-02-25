// routes/searchRoutes.js

const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");

// ✅ 검색 API
router.get("/", searchController.search);

module.exports = router;