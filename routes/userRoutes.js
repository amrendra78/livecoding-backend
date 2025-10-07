const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  getAllUsers,
  getUserById
} = require('../controllers/userController');

// Protected routes (require authentication)
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.put('/change-password', authMiddleware, changePassword);
router.delete('/delete-account', authMiddleware, deleteUserAccount);

// Admin routes (optional)
router.get('/all', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUserById);

module.exports = router;