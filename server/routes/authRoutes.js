import express from 'express';
import { login, logout, getCurrentSession } from '../controllers/authController.js';
import { loginRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/login', loginRateLimiter, login);
router.post('/logout', logout);
router.get('/me', getCurrentSession);

export default router;
