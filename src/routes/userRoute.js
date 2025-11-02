import express from "express";
import {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  updatePreferences,
  getAllUsers,
  updateUserRole,
  getUserById,
  deleteUser,
  toggleUserActive,

} from "../controllers/userController.js";
import { authenticateJWT } from "../middleware/jwtAuth.js";

const router = express.Router();

// User routes
router.get("/profile", authenticateJWT, getProfile);
router.patch("/profile", authenticateJWT, updateProfile);

router.post("/addresses", authenticateJWT, addAddress);
router.patch("/addresses/:addressId", authenticateJWT, updateAddress);
router.delete("/addresses/:addressId", authenticateJWT, deleteAddress);

router.patch("/preferences", authenticateJWT, updatePreferences);

// Admin routes
router.get("/admin/all", authenticateJWT, getAllUsers);
router.patch("/admin/:userId/role", authenticateJWT, updateUserRole);
router.get("/admin/:userId", authenticateJWT, getUserById);
router.delete("/admin/:userId", authenticateJWT, deleteUser);
router.patch("/admin/:userId/toggle-active", authenticateJWT, toggleUserActive);



export default router;
