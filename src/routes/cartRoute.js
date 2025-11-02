import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from "../controllers/cartControllers.js";
import { authenticateJWT } from "../middleware/jwtAuth.js";

const router = express.Router();

router.get("/", authenticateJWT, getCart);
router.post("/", authenticateJWT, addToCart);
router.patch("/", authenticateJWT, updateCartItem);
router.delete("/", authenticateJWT, removeCartItem);
router.delete("/clear", authenticateJWT, clearCart);

export default router;
