// src/routes/searchRoutes.js
const express = require("express");
const router = express.Router();
const { Search } = require("../models");  // Search 모델이 있다고 가정
const { Op } = require("sequelize");

// 예시: /api/search?q=키워드 로 검색
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "검색어를 입력해주세요." });
    }

    const results = await Search.findAll({
      where: {
        keyword: {
          [Op.like]: `%${q}%`
        }
      }
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
