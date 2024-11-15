const express = require("express");
const router = express.Router();
const {
  addPost,
  getAllPosts,
  getPostById,
  likePost,
  getAllCommentPost,
  addComment,
  deleteComment,
  viewPost,
  updatePost,
  deletePost,
} = require("../controllers/postsController");
const { authMiddleware, adminMiddleware } = require("../middleWare/authMiddleware");

// ПУТЬ ПОСТА CRUD
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.post("/", authMiddleware, addPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

// ПУТЬ ЛАЙКА
router.post("/:id/like", authMiddleware, likePost);

// ПУТЬ ПОСТА CRD
router.post("/:id/comment", authMiddleware, addComment);
router.get("/:id/comment", authMiddleware, getAllCommentPost);
router.post("/:id/comment/:commentId", authMiddleware, deleteComment);

// ПУТЬ VIEW
router.post("/:id/view", viewPost);

// ЗДЕСЬ БУДЕТ ПРОИСХОДИТЬ ТАК http://localhost:5050/api/posts/...

module.exports = router;
