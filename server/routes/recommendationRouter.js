import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { getContentBasedRecommendations, getCollaborativeRecommendations, getBestRatedAndPopularBooks, getDiverseRecommendations } from "../controllers/recommendationController.js";

const router = express.Router();

// Content-based recommendations for the logged-in user
router.get("/content-based", isAuthenticated, getContentBasedRecommendations);

// Collaborative filtering recommendations for the logged-in user
router.get("/collaborative", isAuthenticated, getCollaborativeRecommendations);

// Best rated and most popular books for new users
router.get("/best-popular", getBestRatedAndPopularBooks);

// Diverse recommendations for the logged-in user
router.get("/diverse", isAuthenticated, getDiverseRecommendations);

// Test endpoint to check JSON response
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Test endpoint is working!" });
});

export default router;
