import express from 'express';
import { signup, login, logout, getCurrentUser, updateUser } from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware,getCurrentUser);
router.put('/profile', authMiddleware, updateUser);


export default router;
