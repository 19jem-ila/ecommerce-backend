import express from "express";
import {
  addOrUpdateReview,
  deleteReview,
  getProductReviews,
  getUserReview
} from "../controllers/reviewController.js";
import { authenticateJWT } from "../middleware/jwtAuth.js";

const router = express.Router();

// Get all reviews for a product
router.get("/product/:productId", getProductReviews);

// Get current user's review for a product
router.get("/product/:productId/me", authenticateJWT, getUserReview);

// Add or update a review
router.post("/", authenticateJWT, addOrUpdateReview);

// Delete a review
router.delete("/:reviewId", authenticateJWT, deleteReview);

export default router;
