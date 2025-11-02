import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts
} from "../controllers/productController.js";
import { authenticateJWT } from "../middleware/jwtAuth.js";
import { requireAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multerMiddleware.js";
import { parseProductData } from "../middleware/parseProductdata.js";


const router = express.Router();



import {
  productValidationRules,
  productUpdateValidationRules
} from "../utils/productValidator.js";



// Public Routes
router.get("/", getProducts); // All products with filters, pagination, sorting
router.get("/category/:category", getProductsByCategory);
router.get("/search/:query", searchProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getProductById);

// Admin Routes (Protected)
router.post(
  "/",
  authenticateJWT,      // check JWT
  requireAdmin,          // only admin
  upload.array("images", 5),// 👈 handle file upload (max 5 images)
  parseProductData,
  productValidationRules,     // validate input
  createProduct          // controller
);

router.patch(
  "/:id",
  authenticateJWT,
  requireAdmin,
  productUpdateValidationRules,
  updateProduct
);

router.delete(
  "/:id",
  authenticateJWT,
  requireAdmin,
  deleteProduct
);

export default router;



