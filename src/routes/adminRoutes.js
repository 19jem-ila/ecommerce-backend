import express from "express";
import { getAdminStats, getSalesTrends } from "../controllers/adminControllers.js";
import { authenticateJWT} from "../middleware/jwtAuth.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admins can access
router.get("/stats", 
    authenticateJWT, 
    requireAdmin,
     getAdminStats);
router.get("/trends",
     authenticateJWT, 
     requireAdmin, 
     getSalesTrends);

export default router;
