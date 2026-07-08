const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Mock route for posting to social media
router.post('/posts', postController.createPost);

module.exports = router;
