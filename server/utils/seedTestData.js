import mongoose from "mongoose";
import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";

// Seed books
export const seedBooks = async () => {
  const books = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      description: "A novel set in the Roaring Twenties, exploring themes of wealth, love, and the American Dream.",
      price: 10,
      quantity: 5
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      description: "A story of racial injustice and childhood innocence in the Deep South.",
      price: 12,
      quantity: 4
    },
    {
      title: "1984",
      author: "George Orwell",
      description: "A dystopian novel about totalitarianism and surveillance.",
      price: 15,
      quantity: 6
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      description: "A classic romance novel about manners, marriage, and society.",
      price: 11,
      quantity: 3
    },
    {
      title: "Moby Dick",
      author: "Herman Melville",
      description: "The epic tale of Captain Ahab's obsessive quest to kill the white whale.",
      price: 13,
      quantity: 2
    }
  ];
  await Book.deleteMany({});
  await Book.insertMany(books);
  console.log("Books seeded!");
};

// Simulate a user borrowing a book
export const simulateUserBorrow = async (userId, bookTitle) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (!user.borrowedBooks) user.borrowedBooks = [];
  if (!user.borrowedBooks.some(b => b.bookTitle === bookTitle)) {
    user.borrowedBooks.push({ bookTitle, returned: false });
    await user.save();
    console.log(`User borrowed: ${bookTitle}`);
  }
};

// Usage example (uncomment to run):
// import { seedBooks, simulateUserBorrow } from "./utils/seedTestData.js";
// await seedBooks();
// await simulateUserBorrow("<USER_ID>", "The Great Gatsby");
