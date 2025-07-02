import { Borrow } from "../models/borrowModel.js";
import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";

export const simulateUserBorrow = async (req, res) => {
  try {
    const { userId, bookTitle } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const book = await Book.findOne({ title: bookTitle });
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    // Create borrow record
    await Borrow.create({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      price: book.price,
      book: book._id,
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    res.json({ success: true, message: `Simulated borrow for ${user.name} -> ${book.title}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
