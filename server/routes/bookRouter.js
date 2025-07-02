import { isAuthorized, isAuthenticated } from "../middlewares/authMiddleware.js";
import {addBook, deleteBook, getAllBooks, updateBookDetails, rateBook} from "../controllers/bookController.js";
import express from "express";

const router = express.Router();

router.post("/admin/add", isAuthenticated, isAuthorized("Admin"), addBook);
router.get("/all", isAuthenticated, getAllBooks);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteBook);
router.put("/update/:id", isAuthenticated, isAuthorized("Admin"), updateBookDetails);
router.post("/:id/rate", isAuthenticated, rateBook);

export default router;
