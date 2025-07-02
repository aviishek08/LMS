import { Book } from "../models/bookModel.js";
import fs from "fs";
import path from "path";

// Polyfill __dirname for ES modules
const __dirname = path.resolve();

export const seedBooks = async (req, res) => {
  try {
    const csvPath = path.resolve(__dirname, "FinalData.csv");
    const csvData = fs.readFileSync(csvPath, "utf-8");
    const lines = csvData.split("\n").filter(Boolean);
    const books = [];
    for (let i = 1; i < lines.length; i++) { // skip header
      const [book_id, authors, title, Genres] = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
      const genreArr = Genres ? Genres.split(";").map(g => g.trim()).filter(Boolean) : ["Unknown"];
      books.push({
        title: title.replace(/^"|"$/g, ""),
        author: authors.replace(/^"|"$/g, ""),
        description: `No description available for ${title.replace(/^"|"$/g, "")}.`,
        price: 10 + (i % 10),
        quantity: 2 + (i % 6),
        genre: genreArr
      });
    }
    await Book.deleteMany({});
    await Book.insertMany(books);
    res.json({ success: true, message: `${books.length} real books seeded from FinalData.csv!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
