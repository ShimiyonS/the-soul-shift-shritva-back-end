/**
 * Auth routes - login, refresh, logout only (no register).
 * Same format as invest2gold_backend.
 */

import express from 'express';
import authController from '../controller/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateLogin } from '../middleware/validation.js';

const router = express.Router();

router.post('/login', validateLogin, authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));

export default router;
