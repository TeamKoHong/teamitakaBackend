const express = require("express");
const router = express.Router();
const projectPostController = require("../controllers/projectPostController");

router.post("/:project_id/posts", projectPostController.createPost);
router.get("/:project_id/posts", projectPostController.getPostsByProject);
router.get("/posts/:post_id", projectPostController.getPostById);

module.exports = router;
