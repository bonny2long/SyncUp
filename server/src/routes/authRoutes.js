import express from 'express';
import {
  register,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  adminResetPassword,
  login,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/admin-reset-password', adminResetPassword);
router.post('/login', login);

export default router;
