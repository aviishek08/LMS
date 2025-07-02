import express from "express";
import { simulateUserBorrow } from "../controllers/simulateController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only admin can simulate borrow
router.post("/borrow", isAuthenticated, isAuthorized("Admin"), simulateUserBorrow);

export default router;
