import React from "react";
import { useDispatch } from "react-redux";
import { returnBook, fetchAllBorrowedBooks } from "../store/slices/borrowSlice";
import { toggleReturnBookPopup } from "../store/slices/popUpSlice";
import { toast } from "react-toastify";

const ReturnBookPopup = ({ bookId, email }) => {
  const dispatch = useDispatch();
  const handleReturnBook = async (e) => {
    e.preventDefault();
    try {
      // Call the API directly to get the message
      const res = await fetch(
        `http://localhost:4000/api/v1/borrow/return-borrowed-book/${bookId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast(data.message);
        dispatch(fetchAllBorrowedBooks()); // Refresh the list immediately
        dispatch(toggleReturnBookPopup());
        dispatch(returnBook(email, bookId)); // update redux state
      } else {
        toast.error(data.message || "Failed to return book.");
      }
    } catch (error) {
      toast.error("Failed to return the book.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50">
        <div className="w-full bg-white rounded-lg shadow-lg md:w-1/3">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Return Book</h3>
            <form onSubmit={handleReturnBook}>
              <div className="mb-4">
                <label className="block text-gray-900 font-medium">
                  User Email
                </label>
                <input
                  type="email"
                  defaultValue={email}
                  placeholder="Borrower's Email"
                  className="w-full px-4 py-2 border-2 border-black rounded-md"
                  required
                  disabled
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-gray-200 rounded-medium hover:bg-gray-300"
                  type="button"
                  onClick={() => {
                    dispatch(toggleReturnBookPopup());
                  }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Return
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      ;
    </>
  );
};

export default ReturnBookPopup;
