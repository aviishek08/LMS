import { Book } from "../models/bookModel.js";
import { Borrow } from "../models/borrowModel.js";
import { User } from "../models/userModel.js";
import natural from "natural";
const { TfIdf } = natural;

// Helper function for cosine similarity
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < Math.max(vecA.length, vecB.length); i++) {
    const a = vecA[i] || 0;
    const b = vecB[i] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Get content-based recommendations for a user using Borrow model and genre
export const getContentBasedRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    // Get all books
    const books = await Book.find();
    // Get user's borrowed books from Borrow model
    const userBorrows = await Borrow.find({ "user.id": userId }).populate("book");
    // Only include borrows with a valid book
    const userBookIds = userBorrows.filter(b => b.book).map(b => b.book._id.toString());
    // Prepare documents for TF-IDF (combine title, author, description, genre)
    const documents = books.map(book => `${book.title} ${book.author} ${book.description} ${book.genre}`);
    const tfidf = new TfIdf();
    documents.forEach(doc => tfidf.addDocument(doc));
    // Get indices of user's books
    const userBookIndices = books.map((book, idx) => userBookIds.includes(book._id.toString()) ? idx : -1).filter(idx => idx !== -1);
    // Calculate average similarity of each book to user's books
    const similarities = books.map((_, idx) => {
      if (userBookIndices.includes(idx)) return -1; // skip already borrowed
      let simSum = 0;
      userBookIndices.forEach(userIdx => {
        const vecA = [], vecB = [];
        tfidf.listTerms(idx).forEach(term => {
          vecA.push(term.tfidf);
        });
        tfidf.listTerms(userIdx).forEach(term => {
          vecB.push(term.tfidf);
        });
        simSum += cosineSimilarity(vecA, vecB);
      });
      return userBookIndices.length > 0 ? simSum / userBookIndices.length : 0;
    });
    // Get top 5 recommendations
    const topIndices = similarities
      .map((sim, idx) => ({ sim, idx }))
      .filter(obj => obj.sim > 0)
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 5)
      .map(obj => obj.idx);
    const recommendations = topIndices.map(idx => books[idx]);
    res.json({ success: true, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Collaborative filtering: user-based k-NN
export const getCollaborativeRecommendations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    // Get all users
    const users = await User.find();
    // Get all borrows
    const allBorrows = await Borrow.find().populate("book");
    // Build user->book set map
    const userBookMap = {};
    users.forEach(user => {
      userBookMap[user._id.toString()] = new Set();
    });
    allBorrows.forEach(borrow => {
      if (borrow.book && borrow.user && borrow.user.id) {
        userBookMap[borrow.user.id.toString()]?.add(borrow.book._id.toString());
      }
    });
    // Current user's borrowed books
    const userBooks = userBookMap[userId] || new Set();
    // Compute Jaccard similarity with all other users
    const similarities = users.filter(u => u._id.toString() !== userId).map(otherUser => {
      const otherBooks = userBookMap[otherUser._id.toString()] || new Set();
      const intersection = new Set([...userBooks].filter(x => otherBooks.has(x)));
      const union = new Set([...userBooks, ...otherBooks]);
      const sim = union.size === 0 ? 0 : intersection.size / union.size;
      return { userId: otherUser._id.toString(), sim };
    });
    // Get top 3 similar users
    const topUsers = similarities.filter(s => s.sim > 0).sort((a, b) => b.sim - a.sim).slice(0, 3);
    // Collect books borrowed by top users but not by current user
    const recommendedBookIds = new Set();
    topUsers.forEach(({ userId: otherId }) => {
      (userBookMap[otherId] || new Set()).forEach(bookId => {
        if (!userBooks.has(bookId)) recommendedBookIds.add(bookId);
      });
    });
    // Get book details
    const recommendations = await Book.find({ _id: { $in: Array.from(recommendedBookIds) } });
    res.json({ success: true, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Recommend best rated and most popular books for new users
export const getBestRatedAndPopularBooks = async (req, res) => {
  try {
    // Get all books
    const books = await Book.find();
    // Get all borrows
    const borrows = await Borrow.find();
    // Calculate borrow count for each book
    const borrowCountMap = {};
    borrows.forEach(b => {
      const id = b.book.toString();
      borrowCountMap[id] = (borrowCountMap[id] || 0) + 1;
    });
    // Calculate average rating for each book
    const booksWithStats = books.map(book => {
      const avgRating = book.ratings && book.ratings.length > 0
        ? book.ratings.reduce((sum, r) => sum + r.rating, 0) / book.ratings.length
        : 0;
      const borrowCount = borrowCountMap[book._id.toString()] || 0;
      return { ...book.toObject(), avgRating, borrowCount };
    });
    // Top 5 by rating
    const bestRated = [...booksWithStats]
      .filter(b => b.ratings && b.ratings.length > 0)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);
    // Top 5 by borrow count
    const mostPopular = [...booksWithStats]
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 5);
    res.json({ success: true, bestRated, mostPopular });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Diverse recommendations: avoid same genre/author, add 'You might also like' from unexplored genres
export const getDiverseRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const books = await Book.find();
    const userBorrows = await Borrow.find({ "user.id": userId }).populate("book");
    const userBookIds = userBorrows.filter(b => b.book).map(b => b.book._id.toString());
    const userBooks = userBorrows.map(b => b.book).filter(Boolean);
    const userGenres = new Set(userBooks.flatMap(b => Array.isArray(b.genre) ? b.genre : [b.genre]));
    const userAuthors = new Set(userBooks.map(b => b.author));

    // Recommend books not borrowed, not by same author, and not in same genre (for diversity)
    const diverse = books.filter(b =>
      !userBookIds.includes(b._id.toString()) &&
      !userAuthors.has(b.author) &&
      ![...(Array.isArray(b.genre) ? b.genre : [b.genre])].some(g => userGenres.has(g))
    );
    // Shuffle and pick 5
    const shuffled = diverse.sort(() => 0.5 - Math.random());
    const diversePicks = shuffled.slice(0, 5);

    // 'You might also like': random picks from genres the user hasn't explored
    const allGenres = new Set(books.flatMap(b => Array.isArray(b.genre) ? b.genre : [b.genre]));
    const unexploredGenres = [...allGenres].filter(g => !userGenres.has(g));
    const unexploredBooks = books.filter(b =>
      !userBookIds.includes(b._id.toString()) &&
      [...(Array.isArray(b.genre) ? b.genre : [b.genre])].some(g => unexploredGenres.includes(g))
    );
    // Shuffle and pick 5
    const shuffledUnexplored = unexploredBooks.sort(() => 0.5 - Math.random());
    const youMightAlsoLike = shuffledUnexplored.slice(0, 5);

    res.json({ success: true, diverse: diversePicks, youMightAlsoLike });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
