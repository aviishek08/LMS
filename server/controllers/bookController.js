import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Book } from "../models/bookModel.js"
import {User} from "../models/userModel.js"
import ErrorHandler from "../middlewares/errorMiddlewares.js";

export const addBook = catchAsyncErrors(async(req, res, next)=>{
    const {title, author, description, price, quantity, genre} = req.body;
    if(!title || !author || !description || !price || !quantity || !genre){
        return next(new ErrorHandler("Please fill up all the fields.", 400));
    }
    const book = await Book.create({
        title, 
        author, 
        description, 
        price, 
        quantity,
        genre,
    });
    res.status(201).json({
        success: true,
        message: "Book added successfully.",
        book,
    });
});

export const getAllBooks = catchAsyncErrors(async(req, res, next)=>{
    const books = await Book.find();
    res.status(200).json({
        success: true,
        books,
    });
});

export const deleteBook = catchAsyncErrors(async(req, res, next)=>{
    const {id} = req.params;
    const book = await Book.findById(id);
    if(!book){
        return next(new ErrorHandler("Book not found.", 404));
    }
    await book.deleteOne();
    res.status(200).json({
        success: true,
        message: "Book deleted successfully.",
    });
});

export const updateBookDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { title, author, description, price, quantity } = req.body;

  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  book.title = title || book.title;
  book.author = author || book.author;
  book.description = description || book.description;
  book.price = price !== undefined ? price : book.price;
  book.quantity = quantity !== undefined ? quantity : book.quantity;
  book.availability = book.quantity > 0;

  await book.save();

  res.status(200).json({
    success: true,
    message: "Book details updated successfully.",
    book,
  });
});

// Add or update a user's rating for a book
export const rateBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params; // book id
  const { rating } = req.body;
  const userId = req.user._id;
  if (!rating || rating < 1 || rating > 5) {
    return next(new ErrorHandler("Rating must be between 1 and 5.", 400));
  }
  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found.", 404));
  }
  // Check if user has already rated
  const existing = book.ratings.find(r => r.user.toString() === userId.toString());
  if (existing) {
    existing.rating = rating;
  } else {
    book.ratings.push({ user: userId, rating });
  }
  await book.save();
  res.status(200).json({ success: true, message: "Rating submitted.", ratings: book.ratings });
});
