import express from "express";
import isAuth from "../middlewares/isAuth.js";
import uploadFile from "../middlewares/multer.js";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  addComment,
  reactToPost,
  deleteComment,
} from "../controllers/postController.js";

const router = express.Router();

// Create a new post with image upload
router.post("/newPost", isAuth, uploadFile, createPost);

// Get all posts
router.get("/allPosts", getAllPosts);

// Get a single post by ID
router.get("/:id", isAuth, getPostById);

// Update a post
router.put("/update/:id", isAuth, updatePost);

// Delete a post
router.delete("/:id", isAuth, deletePost);

// Add a comment to a post
router.post("/:id/comments", isAuth, addComment);

// React to a post
router.post("/:id/reactions", isAuth, reactToPost);

// Delete a comment from a post
router.delete("/:id/comments/:commentId", isAuth, deleteComment);

export default router;
