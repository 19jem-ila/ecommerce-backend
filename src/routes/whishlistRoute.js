import express from "express";
import { addToWishlist, removeFromWishlist, getWishlist , moveToCart} from "../controllers/whishlistController.js";
import { authenticateJWT } from "../middleware/jwtAuth.js";

const router = express.Router();

// Add product to wishlist
router.post("/", authenticateJWT, addToWishlist);

// Remove product from wishlist
router.delete("/:productId", authenticateJWT, removeFromWishlist);

// Get current user's wishlist
router.get("/", authenticateJWT, getWishlist);

router.post("/move-to-cart", authenticateJWT, moveToCart);

export default router;
