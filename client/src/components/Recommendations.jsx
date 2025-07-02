import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Recommendations = () => {
  const { user } = useSelector(state => state.auth);
  const [contentBooks, setContentBooks] = useState([]);
  const [collabBooks, setCollabBooks] = useState([]);
  const [bestRated, setBestRated] = useState([]);
  const [mostPopular, setMostPopular] = useState([]);
  const [diverse, setDiverse] = useState([]);
  const [youMightAlsoLike, setYouMightAlsoLike] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:4000/api/v1/recommendation/content-based", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json()),
      fetch("http://localhost:4000/api/v1/recommendation/collaborative", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json()),
      fetch("http://localhost:4000/api/v1/recommendation/best-popular", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json()),
      fetch("http://localhost:4000/api/v1/recommendation/diverse", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
    ]).then(([contentData, collabData, bestPopularData, diverseData]) => {
      setContentBooks(contentData.recommendations || []);
      setCollabBooks(collabData.recommendations || []);
      setBestRated(bestPopularData.bestRated || []);
      setMostPopular(bestPopularData.mostPopular || []);
      setDiverse(diverseData.diverse || []);
      setYouMightAlsoLike(diverseData.youMightAlsoLike || []);
      setLoading(false);
    });
  }, []);

  const filterBooks = books =>
    books.filter(book =>
      [book.title, book.author, book.genre].some(field =>
        field?.toLowerCase().includes(filter.toLowerCase())
      )
    );

  // Helper to show average rating stars
  const renderAvgStars = avg => (
    <span className="ml-2 text-yellow-400 text-base">
      {[1,2,3,4,5].map(star => (
        <span key={star}>{avg >= star ? '★' : '☆'}</span>
      ))}
    </span>
  );

  // Determine if user is new (no borrows, no ratings)
  const isNewUser = !contentBooks.length && !collabBooks.length;

  return (
    <div className="p-6 md:p-10 w-full">
      <h1 className="text-2xl font-bold mb-6">Recommendations</h1>
      <input
        type="text"
        placeholder="Filter by title, author, or genre"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="mb-6 p-2 border border-gray-300 rounded w-full max-w-md"
      />
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl" onClick={() => setSelectedBook(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-2">{selectedBook.title}</h3>
            <p className="mb-1 text-gray-700">by {selectedBook.author}</p>
            <p className="mb-1 text-sm text-gray-500">Genre: {selectedBook.genre}</p>
            <hr className="my-2" />
            <p className="text-gray-800 whitespace-pre-line">{selectedBook.description}</p>
          </div>
        </div>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : isNewUser ? (
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-xl font-semibold mb-4">Best Rated Books</h2>
            {filterBooks(bestRated).length === 0 ? (
              <p className="text-gray-500">No recommendations found.</p>
            ) : (
              <ul className="space-y-3">
                {filterBooks(bestRated).map(book => (
                  <li key={book._id} className="bg-white p-4 rounded shadow flex flex-col hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedBook(book)}>
                    <span className="font-bold text-lg">{book.title}</span>
                    <span className="text-gray-700">by {book.author}</span>
                    <span className="text-sm text-gray-500">Genre: {book.genre}</span>
                    <span className="text-sm text-yellow-600">Avg Rating: {book.avgRating?.toFixed(1) || 'N/A'} {renderAvgStars(book.avgRating)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Most Popular Books</h2>
            {filterBooks(mostPopular).length === 0 ? (
              <p className="text-gray-500">No recommendations found.</p>
            ) : (
              <ul className="space-y-3">
                {filterBooks(mostPopular).map(book => (
                  <li key={book._id} className="bg-white p-4 rounded shadow flex flex-col hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedBook(book)}>
                    <span className="font-bold text-lg">{book.title}</span>
                    <span className="text-gray-700">by {book.author}</span>
                    <span className="text-sm text-gray-500">Genre: {book.genre}</span>
                    <span className="text-sm text-blue-600">Borrowed: {book.borrowCount} times</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <>
        <div className="grid md:grid-cols-2 gap-10 mb-10">
          <div>
            <h2 className="text-xl font-semibold mb-4">Similar to books you like</h2>
            {filterBooks(contentBooks).length === 0 ? (
              <p className="text-gray-500">No recommendations found.</p>
            ) : (
              <ul className="space-y-3">
                {filterBooks(contentBooks).map(book => (
                  <li key={book._id} className="bg-white p-4 rounded shadow flex flex-col hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedBook(book)}>
                    <span className="font-bold text-lg">{book.title}</span>
                    <span className="text-gray-700">by {book.author}</span>
                    <span className="text-sm text-gray-500">Genre: {book.genre}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Users with similar interests also liked</h2>
            {filterBooks(collabBooks).length === 0 ? (
              <p className="text-gray-500">No recommendations found.</p>
            ) : (
              <ul className="space-y-3">
                {filterBooks(collabBooks).map(book => (
                  <li key={book._id} className="bg-white p-4 rounded shadow flex flex-col hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedBook(book)}>
                    <span className="font-bold text-lg">{book.title}</span>
                    <span className="text-gray-700">by {book.author}</span>
                    <span className="text-sm text-gray-500">Genre: {book.genre}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-xl font-semibold mb-4">Diverse Recommendations</h2>
            {filterBooks(diverse).length === 0 ? (
              <p className="text-gray-500">No recommendations found.</p>
            ) : (
              <ul className="space-y-3">
                {filterBooks(diverse).map(book => (
                  <li key={book._id} className="bg-white p-4 rounded shadow flex flex-col hover:bg-green-50 cursor-pointer" onClick={() => setSelectedBook(book)}>
                    <span className="font-bold text-lg">{book.title}</span>
                    <span className="text-gray-700">by {book.author}</span>
                    <span className="text-sm text-gray-500">Genre: {book.genre}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">You Might Also Like</h2>
            {filterBooks(youMightAlsoLike).length === 0 ? (
              <p className="text-gray-500">No recommendations found.</p>
            ) : (
              <ul className="space-y-3">
                {filterBooks(youMightAlsoLike).map(book => (
                  <li key={book._id} className="bg-white p-4 rounded shadow flex flex-col hover:bg-purple-50 cursor-pointer" onClick={() => setSelectedBook(book)}>
                    <span className="font-bold text-lg">{book.title}</span>
                    <span className="text-gray-700">by {book.author}</span>
                    <span className="text-sm text-gray-500">Genre: {book.genre}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default Recommendations;
