import express from "express";
import { seedBooks } from "../controllers/seedController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only admin can seed books
router.post("/books", isAuthenticated, isAuthorized("Admin"), seedBooks);

export default router;
