import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import {
  createPostValidation,
  updatePostValidation,
  getPostValidation,
  deletePostValidation,
  listPostsValidation,
} from '../middleware/post-validator';
import {
  createPost,
  getPost,
  updatePost,
  deletePost,
  listPosts,
} from '../controllers/post';

const router = express.Router();

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/', isAuthenticated, createPostValidation, createPost);

/**
 * @route   GET /api/posts/:id
 * @desc    Get a post by ID
 * @access  Private
 */
router.get('/:id', isAuthenticated, getPostValidation, getPost);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Private
 */
router.put('/:id', isAuthenticated, updatePostValidation, updatePost);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete('/:id', isAuthenticated, deletePostValidation, deletePost);

/**
 * @route   GET /api/posts
 * @desc    List posts with pagination and filtering
 * @access  Private
 */
router.get('/', isAuthenticated, listPostsValidation, listPosts);

export default router; 