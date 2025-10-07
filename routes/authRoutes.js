const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyToken
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes - support both /register and /signup
router.post('/register', registerUser);
router.post('/signup', registerUser); // Add this line for Angular compatibility
router.post('/login', loginUser);

// Protected route - verify token
router.get('/verify', authMiddleware, verifyToken);

module.exports = router;