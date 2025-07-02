import React, { useEffect, useState } from "react";

const RecommendedBooks = ({ type = "content-based" }) => {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:4000/api/v1/recommendation/${type}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(data => {
        setBooks(data.recommendations || []);
        setLoading(false);
      });
  }, [type]);

  const filteredBooks = books.filter(book =>
    [book.title, book.author, book.genre].some(field =>
      field?.toLowerCase().includes(filter.toLowerCase())
    )
  );

  return (
    <div>
      <h2>Recommended Books</h2>
      <input
        type="text"
        placeholder="Filter by title, author, or genre"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem" }}
      />
      {loading ? (
        <p>Loading...</p>
      ) : filteredBooks.length === 0 ? (
        <p>No recommendations found.</p>
      ) : (
        <ul>
          {filteredBooks.map(book => (
            <li key={book._id}>
              <strong>{book.title}</strong> by {book.author} ({book.genre})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecommendedBooks;
