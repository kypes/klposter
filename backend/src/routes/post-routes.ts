import express from 'express';
import { createPost, getPost, updatePost, deletePost, listPosts } from '../controllers/post';
import { createPostValidation } from '../middleware/post-validator';
import { isAuthenticated } from '../middleware/auth-middleware';

const router = express.Router();

/**
 * @route   GET /api/posts
 * @desc    Get all posts for the authenticated user
 * @access  Private
 */
router.get('/', isAuthenticated, listPosts);

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
router.get('/:id', isAuthenticated, getPost);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Private
 */
router.put('/:id', isAuthenticated, createPostValidation, updatePost);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete('/:id', isAuthenticated, deletePost);

export default router; 