import express from 'express';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.js';
import { authenticateJWT, checkBlacklist } from '../middleware/jwtAuth.js';
import { validate } from '../middleware/validatorMiddleware.js';

import { 
  registerSchema, 
  loginUserSchema, 
  resetPasswordSchema, 
  forgotPasswordSchema, 
  changePasswordSchema 
} from '../utils/validator.js';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  logoutUser,
  createAdmin,
  verifyEmail,        
  resendVerification,
  forgotPassword,     
  resetPassword,    
  changePassword , 
  refreshToken     
} from '../controllers/authController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔹 Register user (email/password)
router.post('/register', validate(registerSchema), registerUser);

// 🔹 Verify email (custom route with Nodemailer)
router.post('/verify-email', verifyEmail);

// 🔹 Resend verification email
router.post('/resend-verification', resendVerification);

// 🔹 Forgot password (send reset link)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

// 🔹 Reset password (verify token + update password)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// 🔹 Change password (JWT protected)
router.post('/change-password', authenticateJWT, validate(changePasswordSchema), changePassword);

// 🔹 Login (Firebase token + email verified)
router.post('/login', verifyFirebaseToken, validate(loginUserSchema), loginUser);

// 🔹 Get current user profile (JWT protected)
router.get('/profile', authenticateJWT, getProfile);

// 🔹 Update user profile (JWT protected)
router.put('/profile', authenticateJWT, updateProfile);

// 🔹 Create admin (JWT protected + admin only)
router.post('/create-admin',
   authenticateJWT, 
   requireAdmin, 
   createAdmin);

// 🔹 Logout (JWT protected + blacklist check)
router.post('/logout', authenticateJWT, checkBlacklist, logoutUser);

// 🔹 Refresh access token (uses refreshToken from request body)
router.post('/refresh', refreshToken);


export default router;
