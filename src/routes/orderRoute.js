import express from "express";
import {
  createOrder,
  getUserOrders,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  initiatePayment,
  confirmPayment,
} from "../controllers/orderController.js";
import { authenticateJWT } from "../middleware/jwtAuth.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/", authenticateJWT, createOrder);
router.get("/my-orders", authenticateJWT, getUserOrders);


// Telebirr payment routes
router.post("/payments/initiate", authenticateJWT, initiatePayment);
router.post("/payments/confirm", confirmPayment); // webhook

router.patch("/:orderId/cancel", authenticateJWT, cancelOrder);

// Admin routes
router.get("/admin/all",
  //  authenticateJWT, 
  //  requireAdmin, 
   getAllOrders);
router.patch("/admin/:orderId/status", authenticateJWT, requireAdmin, updateOrderStatus);

export default router;
