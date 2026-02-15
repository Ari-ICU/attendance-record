const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

// Public routes
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.post('/logout', authMiddleware, AuthController.logout);

router.get('/users', authMiddleware, adminOnly, AuthController.getAllUsers);
router.put('/users/:id/role', authMiddleware, adminOnly, AuthController.updateUserRole);

module.exports = router;