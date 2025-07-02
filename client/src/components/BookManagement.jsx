import React, { useEffect, useState } from "react";
import Fuse from "fuse.js";
import { BookA, NotebookPen, Trash2, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleAddBookPopup,
  toggleDeleteBookPopup,
  toggleReadBookPopup,
  toggleRecordBookPopup,
} from "../store/slices/popUpSlice";
import { toast } from "react-toastify";
import {
  fetchAllBorrowedBooks,
  resetBorrowSlice,
} from "../store/slices/borrowSlice";
import {
  fetchAllBooks,
  resetBookSlice,
  deleteBook,
} from "../store/slices/bookSlice";
import Header from "../layout/Header";
import AddBookPopup from "../popups/AddBookPopup";
import ReadBookPopup from "../popups/ReadBookPopup";
import DeleteBookPopup from "../popups/DeleteBookPopup";
import RecordBookPopup from "../popups/RecordBookPopup";
const BookManagement = () => {
  const dispatch = useDispatch();
  const { loading, error, message, books } = useSelector((state) => state.book);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { addBookPopup, readBookPopup, recordBookPopup } = useSelector(
    (state) => state.popup
  );
  const {
    loading: borrowSliceLoading,
    error: borrowSliceError,
    message: borrowSliceMessage,
  } = useSelector((state) => state.borrow);

  const [readBook, setReadBook] = useState({});
  const openReadPopup = (id) => {
    const book = books.find((book) => book._id === id);
    setReadBook(book);
    dispatch(toggleReadBookPopup());
  };

  const { deleteBookPopup, deleteBookId } = useSelector((state) => state.popup);

  const [borrowBookId, setBorrowBookId] = useState("");
  const openRecordBookPopup = (bookId) => {
    setBorrowBookId(bookId);
    dispatch(toggleRecordBookPopup());
  };

  const [returnedBookId, setReturnedBookId] = useState(null);

  useEffect(() => {
    if (message || borrowSliceMessage) {
      toast.success(message || borrowSliceMessage);
      dispatch(fetchAllBooks());
      dispatch(fetchAllBorrowedBooks());
      dispatch(resetBookSlice());
      dispatch(resetBorrowSlice());
    }
    if (error || borrowSliceError) {
      toast.error(error || borrowSliceError);
      dispatch(resetBookSlice());
      dispatch(resetBorrowSlice());
    }
  }, [
    dispatch,
    message,
    error,
    loading,
    borrowSliceError,
    borrowSliceLoading,
    borrowSliceMessage,
  ]);
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [sortByAuthorAsc, setSortByAuthorAsc] = useState(true);
  const [sortByTitleAsc, setSortByTitleAsc] = useState(true);
  const handleSearch = (e) => {
    setSearchedKeyword(e.target.value.toLowerCase());
  };

  // Get unique genres for filter dropdown (flatten array)
  const uniqueGenres = Array.from(
    new Set(
      books
        .flatMap((book) => (Array.isArray(book.genre) ? book.genre : [book.genre]))
        .filter(Boolean)
    )
  );

  const fuse = new Fuse(books, {
    keys: ["title", "author"],
    includeScore: true,
    threshold: 0.3,
  });

  let searchedBooks = searchedKeyword
    ? fuse.search(searchedKeyword).map((result) => result.item)
    : books;
  if (genreFilter) {
    searchedBooks = searchedBooks.filter((book) =>
      Array.isArray(book.genre) ? book.genre.includes(genreFilter) : book.genre === genreFilter
    );
  }
  // Sort by title or author if requested
  if (sortByTitleAsc !== null) {
    searchedBooks = [...searchedBooks].sort((a, b) => {
      if (!sortByTitleAsc) return 0;
      return a.title.localeCompare(b.title);
    });
  }
  if (sortByAuthorAsc !== null) {
    searchedBooks = [...searchedBooks].sort((a, b) => {
      if (!sortByAuthorAsc) return 0;
      return a.author.localeCompare(b.author);
    });
  }

  return (
    <>
      <main className="relative flex-1 p-6 pt-28">
        <Header />
        {/* sub header  */}
        <header className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
          <h2 className="text-xl font-medium md:text-2xl md:font-semibold">
            {user && user.role === "Admin" ? "Book Management" : "Books"}
          </h2>
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            {isAuthenticated && user?.role === "Admin" && (
              <button
                onClick={() => dispatch(toggleAddBookPopup())}
                className="relative pl-14 w-full sm:w-52 flex gap-4 justify-center items-center py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800"
              >
                <span className="bg-white flex justify-center items-center overflow-hidden rounded-full text-black w-[25px] h-[25px] text-[27px] absolute left-5"></span>
                Add Book
              </button>
            )}
            <input
              type="text"
              placeholder="Search books..."
              className="w-full sm:w-52 border p-2 border-gray-300 rounded-md"
              value={searchedKeyword}
              onChange={handleSearch}
            />
            <select
              className="w-full sm:w-52 border p-2 border-gray-300 rounded-md"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
            >
              <option value="">All Genres</option>
              {uniqueGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* table  */}
        {books && books.length > 0 ? (
          <div className="mt-6 overflow-auto bg-white rounded-md shadow-lg">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">
                    <button
                      className="font-semibold hover:underline"
                      onClick={() => setSortByTitleAsc((asc) => !asc)}
                    >
                      Name {sortByTitleAsc ? '▲' : '▼'}
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <button
                      className="font-semibold hover:underline"
                      onClick={() => setSortByAuthorAsc((asc) => !asc)}
                    >
                      Author {sortByAuthorAsc ? '▲' : '▼'}
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left">Genres</th>
                  {isAuthenticated && user?.role === "Admin" && (
                    <th className="px-4 py-2 text-left">Quantity</th>
                  )}
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Availability</th>
                  {isAuthenticated && user?.role === "Admin" && (
                    <th className="px-4 py-2 text-center">Record Book</th>
                  )}
                </tr>
              </thead>
              {/* <tbody>
                {searchedBooks.map((book, index) => (
                  <tr
                    key={book._id}
                    className={(index + 1) % 2 === 0 ? "bg-gray-50" : ""}
                  >
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{book.title}</td>
                    <td className="px-4 py-2">{book.author}</td>
                    {isAuthenticated && user?.role === "Admin" && (
                      <td className="px-4 py-2">{book.quantity}</td>
                    )}
                    <td className="px-4 py-2">{`$${book.price}`}</td>
                    <td className="px-4 py-2">
                      {book.availability ? "Available" : "Unavailable"}
                    </td>
                    {isAuthenticated && user?.role === "Admin" && (
                      <td className="px-4 py-2 flex space-x-2 my-3 justify-center">
                        <BookA
                          onClick={() => {
                            openReadPopup(book._id);
                          }}
                        />
                        <NotebookPen
                          onClick={() => openRecordBookPopup(book._id)}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody> */}
              <tbody>
                {searchedBooks.map((book, index) => (
                  <tr
                    key={book._id}
                    className={(index + 1) % 2 === 0 ? "bg-gray-50" : ""}
                  >
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{book.title}</td>
                    <td className="px-4 py-2">{book.author}</td>
                    <td className="px-4 py-2">{Array.isArray(book.genre) ? book.genre.join(', ') : book.genre}</td>
                    {isAuthenticated && user?.role === "Admin" && (
                      <td className="px-4 py-2">{book.quantity}</td>
                    )}
                    <td className="px-4 py-2">{`$${book.price}`}</td>
                    <td className="px-4 py-2">
                      {book.availability ? "Available" : "Unavailable"}
                    </td>
                    {isAuthenticated && user?.role === "Admin" && (
                      <td className="px-4 py-2 flex space-x-2 my-3 justify-center">
                        <BookA
                          onClick={() => openReadPopup(book._id)}
                          className="cursor-pointer"
                        />
                        {returnedBookId === book._id ? (
                          <Check className="text-green-600 cursor-pointer" />
                        ) : (
                          <NotebookPen
                            onClick={() => {
                              openRecordBookPopup(book._id);
                              setReturnedBookId(book._id);
                            }}
                            className="cursor-pointer"
                          />
                        )}
                        <Trash2
                          onClick={() => {
                            dispatch(toggleDeleteBookPopup(book._id));
                          }}
                          className="cursor-pointer text-red-600"
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <h3 className="text-3xl mt-5 font-medium">
            No books found in library!
          </h3>
        )}
      </main>

      {addBookPopup && <AddBookPopup />}
      {readBookPopup && <ReadBookPopup book={readBook} />}
      {recordBookPopup && <RecordBookPopup bookId={borrowBookId} />}
      {deleteBookPopup && <DeleteBookPopup bookId={deleteBookId} />}
    </>
  );
};

export default BookManagement;
